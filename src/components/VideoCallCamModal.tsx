import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Camera, RefreshCw, X, Sparkles, Flame, Heart } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface VideoCallCamModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onSendReaction?: (emoji: string) => void;
}

export const VideoCallCamModal: React.FC<VideoCallCamModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  onSendReaction,
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, isCameraActive, facingMode]);

  const startCamera = async () => {
    try {
      setCameraError('');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        setCameraError('Camera not supported in this browser.');
      }
    } catch (err: any) {
      console.warn('Camera permission / start error:', err);
      setCameraError('Camera access not available or permission denied.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleFacingMode = () => {
    soundEngine.playTap();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-3 z-40 w-44 sm:w-52 rounded-3xl bg-zinc-950/95 border border-purple-500/40 shadow-2xl shadow-purple-950/80 overflow-hidden backdrop-blur-md">
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-purple-950/70 border-b border-purple-800/40 text-[11px] font-black text-purple-200">
        <span className="flex items-center gap-1">
          <Video className="w-3.5 h-3.5 text-purple-400" />
          <span>Cam Mirror</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleFacingMode}
            className="p-1 hover:text-white transition"
            title="Flip camera"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              onClose();
            }}
            className="p-1 hover:text-white transition"
            title="Close cam preview"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Video stream container */}
      <div className="relative aspect-[3/4] bg-zinc-900 flex items-center justify-center overflow-hidden">
        {cameraError ? (
          <div className="p-3 text-center text-[10px] text-zinc-400">
            <VideoOff className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
            <span>{cameraError}</span>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        )}

        {/* Live Cam pill */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-[9px] font-bold text-white flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <span>Live</span>
        </div>
      </div>

      {/* Quick reaction emojis to send to partner */}
      {onSendReaction && (
        <div className="flex items-center justify-around py-1.5 bg-zinc-900/90 border-t border-zinc-800">
          {['💋', '🔥', '😈', '💖'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                soundEngine.playTap();
                onSendReaction(emoji);
              }}
              className="text-base hover:scale-125 active:scale-95 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
