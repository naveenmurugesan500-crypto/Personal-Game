/**
 * WebRTC P2P Video Call Manager for Truth or Dare: Couples Edition
 * Manages local user media (camera/mic) and PeerConnection signaling via onlineSync WebSocket
 */

import { onlineSync } from './onlineSync';

export interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: 'idle' | 'connecting' | 'connected' | 'failed' | 'disconnected';
  isCameraOn: boolean;
  isMicOn: boolean;
  partnerCameraOn: boolean;
  facingMode: 'user' | 'environment';
  error: string | null;
}

type StateListener = (state: WebRTCState) => void;

class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private listeners: Set<StateListener> = new Set();
  private unsubSignal: (() => void) | null = null;
  private unsubCamStatus: (() => void) | null = null;
  private isInitiator: boolean = false;
  private facingMode: 'user' | 'environment' = 'user';
  private isCameraOn: boolean = true;
  private isMicOn: boolean = true;
  private partnerCameraOn: boolean = false;
  private connectionState: WebRTCState['connectionState'] = 'idle';
  private error: string | null = null;

  private iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ];

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): WebRTCState {
    return {
      localStream: this.localStream,
      remoteStream: this.remoteStream,
      connectionState: this.connectionState,
      isCameraOn: this.isCameraOn,
      isMicOn: this.isMicOn,
      partnerCameraOn: this.partnerCameraOn,
      facingMode: this.facingMode,
      error: this.error,
    };
  }

  private notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  // Start local camera & mic
  public async startLocalMedia(options?: { facingMode?: 'user' | 'environment'; video?: boolean; audio?: boolean }): Promise<MediaStream | null> {
    if (options?.facingMode) this.facingMode = options.facingMode;
    if (options?.video !== undefined) this.isCameraOn = options.video;
    if (options?.audio !== undefined) this.isMicOn = options.audio;

    this.stopLocalMedia();
    this.error = null;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera/Mic not supported by this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: this.isCameraOn ? { facingMode: this.facingMode, width: { ideal: 640 }, height: { ideal: 480 } } : false,
        audio: this.isMicOn,
      });

      this.localStream = stream;
      this.isCameraOn = true;
      onlineSync.sendCamStatus(true);

      // If peer connection exists, replace/add tracks
      if (this.peerConnection) {
        const senders = this.peerConnection.getSenders();
        stream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            this.peerConnection?.addTrack(track, stream);
          }
        });
      }

      this.notify();
      return stream;
    } catch (err: any) {
      console.warn('getUserMedia error:', err);
      this.error = err.message || 'Unable to access camera or microphone';
      this.isCameraOn = false;
      this.notify();
      return null;
    }
  }

  // Stop local camera
  public stopLocalMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    this.notify();
  }

  // Toggle Camera
  public toggleCamera() {
    if (!this.localStream) {
      this.startLocalMedia({ video: true });
      return;
    }
    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const current = videoTracks[0].enabled;
      videoTracks[0].enabled = !current;
      this.isCameraOn = !current;
      onlineSync.sendCamStatus(this.isCameraOn);
      this.notify();
    } else {
      this.startLocalMedia({ video: true });
    }
  }

  // Toggle Mic
  public toggleMic() {
    if (!this.localStream) return;
    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      const current = audioTracks[0].enabled;
      audioTracks[0].enabled = !current;
      this.isMicOn = !current;
      this.notify();
    }
  }

  // Flip Camera (Front / Rear)
  public async flipCamera() {
    const nextFacing = this.facingMode === 'user' ? 'environment' : 'user';
    this.facingMode = nextFacing;
    await this.startLocalMedia({ facingMode: nextFacing });
  }

  // Initialize WebRTC signaling connection
  public initCall(isInitiator: boolean = false) {
    this.isInitiator = isInitiator;
    this.setupSignaling();
    this.createPeerConnection();

    if (this.isInitiator) {
      this.makeOffer();
    }
  }

  private setupSignaling() {
    if (this.unsubSignal) this.unsubSignal();
    if (this.unsubCamStatus) this.unsubCamStatus();

    this.unsubSignal = onlineSync.onSignal((signal, senderId) => {
      // Don't process self signals
      if (senderId === onlineSync.activePlayerId) return;
      this.handleIncomingSignal(signal);
    });

    this.unsubCamStatus = onlineSync.onCamStatus((isOn, senderId) => {
      if (senderId === onlineSync.activePlayerId) return;
      this.partnerCameraOn = isOn;
      this.notify();
    });
  }

  private createPeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    try {
      const pc = new RTCPeerConnection({ iceServers: this.iceServers });
      this.peerConnection = pc;
      this.connectionState = 'connecting';
      this.notify();

      // Add local tracks if available
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          pc.addTrack(track, this.localStream!);
        });
      }

      // Handle ICE Candidate
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          onlineSync.sendSignal({
            type: 'candidate',
            candidate: event.candidate,
          });
        }
      };

      // Handle Remote Stream Tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          this.partnerCameraOn = true;
          this.connectionState = 'connected';
          this.notify();
        }
      };

      // Handle Connection State Changes
      pc.onconnectionstatechange = () => {
        if (!pc) return;
        switch (pc.connectionState) {
          case 'connected':
            this.connectionState = 'connected';
            break;
          case 'connecting':
            this.connectionState = 'connecting';
            break;
          case 'failed':
            this.connectionState = 'failed';
            break;
          case 'disconnected':
          case 'closed':
            this.connectionState = 'disconnected';
            break;
          default:
            break;
        }
        this.notify();
      };
    } catch (err: any) {
      console.error('Failed to create RTCPeerConnection:', err);
      this.error = err.message || 'WebRTC connection failed';
      this.notify();
    }
  }

  private async makeOffer() {
    if (!this.peerConnection) return;
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.peerConnection.setLocalDescription(offer);
      onlineSync.sendSignal({
        type: 'offer',
        sdp: offer,
      });
    } catch (err) {
      console.error('Failed to create offer:', err);
    }
  }

  private async handleIncomingSignal(signal: any) {
    if (!signal) return;

    try {
      if (signal.type === 'offer') {
        if (!this.peerConnection) {
          this.createPeerConnection();
        }
        if (!this.peerConnection) return;

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        onlineSync.sendSignal({
          type: 'answer',
          sdp: answer,
        });
      } else if (signal.type === 'answer') {
        if (this.peerConnection && this.peerConnection.signalingState !== 'stable') {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        }
      } else if (signal.type === 'candidate' && signal.candidate) {
        if (this.peerConnection) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      }
    } catch (err) {
      console.warn('Error handling WebRTC signal:', err);
    }
  }

  // End and clean up call
  public endCall() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.connectionState = 'idle';
    this.partnerCameraOn = false;
    if (this.unsubSignal) {
      this.unsubSignal();
      this.unsubSignal = null;
    }
    if (this.unsubCamStatus) {
      this.unsubCamStatus();
      this.unsubCamStatus = null;
    }
    this.notify();
  }
}

export const webrtcManager = new WebRTCManager();
