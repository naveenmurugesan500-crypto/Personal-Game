import React, { useState, useEffect, useRef } from 'react';
import { Player, Prompt, PromptType, CoupleLevel, PlayEnvironment } from '../types';
import { soundEngine } from '../utils/audio';
import { webrtcManager, WebRTCState } from '../utils/webrtc';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  RefreshCw,
  Flame,
  ShieldCheck,
  Sparkles,
  Timer,
  CheckCircle,
  AlertTriangle,
  Heart,
  Smile,
  Maximize2,
  Minimize2,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SharedIntimacyStageProps {
  myPlayer: Player;
  partnerPlayer: Player;
  isMyTurn: boolean;
  currentPrompt: Prompt | null;
  selectedType: PromptType | null;
  onSelectType: (type: PromptType) => void;
  onCompletePrompt: () => void;
  onForfeitPrompt: () => void;
  onRerollPrompt: () => void;
  onOpenTimer: () => void;
  activeLevel: CoupleLevel;
  activeEnvironment: PlayEnvironment;
  onSendReaction?: (emoji: string) => void;
  isOnlineActive?: boolean;
}

export const SharedIntimacyStage: React.FC<SharedIntimacyStageProps> = ({
  myPlayer,
  partnerPlayer,
  isMyTurn,
  currentPrompt,
  selectedType,
  onSelectType,
  onCompletePrompt,
  onForfeitPrompt,
  onRerollPrompt,
  onOpenTimer,
  activeLevel,
  activeEnvironment,
  onSendReaction,
  isOnlineActive,
}) => {
  const [webrtcState, setWebrtcState] = useState<WebRTCState>(() => webrtcManager.getState());
  const [isPipMinimized, setIsPipMinimized] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string>('');

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Subscribe to WebRTC state changes
  useEffect(() => {
    const unsub = webrtcManager.subscribe((state) => {
      setWebrtcState({ ...state });

      // Attach remote stream if available
      if (remoteVideoRef.current && state.remoteStream) {
        remoteVideoRef.current.srcObject = state.remoteStream;
      }

      // Attach local stream if available
      if (localVideoRef.current && state.localStream) {
        localVideoRef.current.srcObject = state.localStream;
      }
    });

    // Start local camera on mount
    webrtcManager
      .startLocalMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn('Camera auto-start warning:', err);
        setCameraError('Camera access required for live call.');
      });

    return () => {
      unsub();
    };
  }, []);

  // Update video element streams when streams change
  useEffect(() => {
    if (localVideoRef.current && webrtcState.localStream) {
      localVideoRef.current.srcObject = webrtcState.localStream;
    }
  }, [webrtcState.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && webrtcState.remoteStream) {
      remoteVideoRef.current.srcObject = webrtcState.remoteStream;
    }
  }, [webrtcState.remoteStream]);

  // Handle local camera toggle
  const handleToggleCamera = () => {
    soundEngine.playTap();
    webrtcManager.toggleCamera();
    setIsCameraActive((prev) => !prev);
  };

  // Handle local mic toggle
  const handleToggleMic = () => {
    soundEngine.playTap();
    webrtcManager.toggleMic();
  };

  // Handle flip camera
  const handleFlipCamera = () => {
    soundEngine.playTap();
    webrtcManager.flipCamera();
  };

  const handleCardComplete = () => {
    soundEngine.playSuccess();
    soundEngine.vibrateSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ff2a6d', '#05d9e8', '#ffee00'],
      });
    } catch {
      // Ignore
    }
    onCompletePrompt();
  };

  const handleCardForfeit = () => {
    soundEngine.playBuzzer();
    soundEngine.vibrateBuzzer();
    onForfeitPrompt();
  };

  const reactions = ['💋', '🔥', '😈', '💖', '👏', '👀'];

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* 1. THE SHARED LIVE CAMERA STAGE */}
      <div className="w-full relative rounded-3xl bg-zinc-950 border-2 border-zinc-800 shadow-2xl overflow-hidden aspect-[4/3] sm:aspect-video flex items-center justify-center">
        {/* Remote Partner Video Stream (Primary View) */}
        {webrtcState.remoteStream && webrtcState.partnerCameraOn ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          /* Partner Camera Placeholder / Avatar when connecting or in offline mode */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black text-center relative">
            <div className="relative mb-3">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-black uppercase shadow-2xl ring-4 ring-rose-500/30 animate-pulse"
                style={{ backgroundColor: partnerPlayer.avatarColor }}
              >
                {partnerPlayer.name.substring(0, 2)}
              </div>
              <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300 border border-zinc-700 flex items-center gap-1">
                <Video className="w-3 h-3 text-purple-400" />
                <span>{partnerPlayer.gender === 'male' ? '♂ Him' : '♀ Her'}</span>
              </div>
            </div>

            <h3 className="text-base font-black text-white">{partnerPlayer.name}'s Live Cam</h3>
            <p className="text-xs text-zinc-400 max-w-xs mt-1">
              {isOnlineActive
                ? webrtcState.connectionState === 'connected'
                  ? 'Partner camera connected'
                  : 'Waiting for partner video feed...'
                : 'Shared intimacy camera stage — position phone facing you both'}
            </p>

            {/* Quick action buttons for partner camera simulation / testing */}
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400">
                <span
                  className={`w-2 h-2 rounded-full ${
                    webrtcState.connectionState === 'connected'
                      ? 'bg-emerald-500 animate-ping'
                      : 'bg-amber-500'
                  }`}
                />
                <span>
                  {webrtcState.connectionState === 'connected' ? 'Live Stream Active' : 'Cam Standby'}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Local Player Picture-in-Picture Camera (Self Stream) */}
        <div
          className={`absolute bottom-3 right-3 z-20 rounded-2xl bg-black/90 border border-zinc-700/80 shadow-2xl overflow-hidden transition-all duration-300 ${
            isPipMinimized ? 'w-14 h-14' : 'w-28 sm:w-36 aspect-[3/4]'
          }`}
        >
          {/* PiP Header controls */}
          <div className="absolute top-1 right-1 z-30 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPipMinimized((prev) => !prev)}
              className="p-1 rounded-md bg-black/60 text-zinc-300 hover:text-white"
              title={isPipMinimized ? 'Maximize' : 'Minimize'}
            >
              {isPipMinimized ? <Maximize2 className="w-2.5 h-2.5" /> : <Minimize2 className="w-2.5 h-2.5" />}
            </button>
          </div>

          {/* Local Video element */}
          {webrtcState.isCameraOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 text-[10px] p-2 text-center">
              <VideoOff className="w-4 h-4 mb-1 text-zinc-600" />
              <span>Cam Off</span>
            </div>
          )}

          {/* Pip badge: My Camera */}
          {!isPipMinimized && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-zinc-300 pointer-events-none">
              You ({myPlayer.name})
            </div>
          )}
        </div>

        {/* Floating Cam Controls Toolbar */}
        <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
          {/* Turn status indicator tag */}
          <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-zinc-800 text-[11px] font-extrabold text-white">
            <span
              className={`w-2 h-2 rounded-full ${
                isMyTurn ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500'
              }`}
            />
            <span>
              {isMyTurn ? '🎯 YOUR TURN' : `👀 WATCHING ${partnerPlayer.name.toUpperCase()}`}
            </span>
          </div>

          {/* Camera & Mic Action buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-full bg-black/70 backdrop-blur-md border border-zinc-800">
            <button
              type="button"
              onClick={handleToggleCamera}
              className={`p-1.5 rounded-full transition ${
                webrtcState.isCameraOn
                  ? 'bg-zinc-800 text-zinc-200 hover:text-white'
                  : 'bg-rose-600 text-white'
              }`}
              title="Toggle Camera"
            >
              {webrtcState.isCameraOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleToggleMic}
              className={`p-1.5 rounded-full transition ${
                webrtcState.isMicOn
                  ? 'bg-zinc-800 text-zinc-200 hover:text-white'
                  : 'bg-rose-600 text-white'
              }`}
              title="Toggle Microphone"
            >
              {webrtcState.isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleFlipCamera}
              className="p-1.5 rounded-full bg-zinc-800 text-zinc-200 hover:text-white transition"
              title="Flip Camera (Front/Back)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Floating Reaction Bar Overlay */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 p-1 rounded-full bg-black/60 backdrop-blur-md border border-zinc-800">
          {reactions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                soundEngine.playTap();
                if (onSendReaction) onSendReaction(emoji);
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-800/80 active:scale-125 transition text-sm"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* 2. THE SHARED TRUTH OR DARE CARD */}
      <div className="w-full">
        {!selectedType || !currentPrompt ? (
          /* Card selection state */
          <div className="w-full p-4 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col items-center text-center">
            {isMyTurn ? (
              /* MY TURN: I pick Truth or Dare */
              <>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 mb-1">
                  It's Your Turn, {myPlayer.name}!
                </span>
                <h3 className="text-lg font-black text-white mb-1">Choose Your Challenge</h3>
                <p className="text-xs text-zinc-400 mb-4 max-w-xs">
                  Your partner {partnerPlayer.name} will watch you live on camera.
                </p>

                <div className="w-full grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectType('truth')}
                    className="p-4 rounded-2xl bg-gradient-to-b from-cyan-950/70 to-zinc-950 border-2 border-cyan-500/50 hover:border-cyan-400 hover:scale-[1.02] active:scale-95 transition flex flex-col items-center justify-center shadow-lg shadow-cyan-950/40"
                  >
                    <ShieldCheck className="w-7 h-7 text-cyan-400 mb-2" />
                    <span className="text-base font-black text-white tracking-wide">TRUTH</span>
                    <span className="text-[10px] text-cyan-300/80 mt-0.5">Spicy Confession</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectType('dare')}
                    className="p-4 rounded-2xl bg-gradient-to-b from-rose-950/70 to-zinc-950 border-2 border-rose-500/50 hover:border-rose-400 hover:scale-[1.02] active:scale-95 transition flex flex-col items-center justify-center shadow-lg shadow-rose-950/40"
                  >
                    <Flame className="w-7 h-7 text-rose-500 fill-rose-500 mb-2" />
                    <span className="text-base font-black text-white tracking-wide">DARE</span>
                    <span className="text-[10px] text-rose-300/80 mt-0.5">Physical Action</span>
                  </button>
                </div>
              </>
            ) : (
              /* PARTNER'S TURN: I wait for partner to pick */
              <div className="py-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 animate-spin">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white">
                  Waiting for {partnerPlayer.name}...
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs mt-1">
                  {partnerPlayer.name} is currently choosing Truth or Dare. Watch them on camera!
                </p>
              </div>
            )}
          </div>
        ) : (
          /* REVEALED SHARED TRUTH OR DARE CARD */
          <div
            className={`w-full rounded-3xl p-5 sm:p-6 shadow-2xl border-2 transition-all ${
              selectedType === 'truth'
                ? 'bg-gradient-to-b from-cyan-950/80 via-zinc-950 to-black border-cyan-500/60 shadow-cyan-950/40'
                : 'bg-gradient-to-b from-rose-950/80 via-zinc-950 to-black border-rose-500/60 shadow-rose-950/40'
            }`}
          >
            {/* Header badges */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    selectedType === 'truth'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {selectedType.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400">
                  {currentPrompt.intensity === 3 ? '🔥🔥🔥 Extreme' : currentPrompt.intensity === 2 ? '🔥🔥 Medium' : '🔥 Soft'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenTimer}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition border border-zinc-800"
                >
                  <Timer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Timer</span>
                </button>

                <button
                  type="button"
                  onClick={onRerollPrompt}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition border border-zinc-800"
                  title="Swap Challenge"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Prompt Challenge Text (Synchronized) */}
            <div className="my-4 min-h-[72px] flex items-center justify-center">
              <p className="text-base sm:text-lg font-bold text-white text-center leading-snug">
                "{currentPrompt.text}"
              </p>
            </div>

            {/* Action Buttons for Card */}
            {isMyTurn ? (
              /* MY TURN ACTIONS: Done vs Forfeit */
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleCardForfeit}
                  className="py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-red-950/60 border border-zinc-800 hover:border-red-500/50 text-zinc-400 hover:text-red-300 text-xs font-black transition flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Chicken Out (Penalty)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCardComplete}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black shadow-lg shadow-rose-900/40 transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>I Did It! (+10 pts)</span>
                </button>
              </div>
            ) : (
              /* WATCHING PARTNER ACTIONS: Verify / Approve or Penalty */
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col items-center">
                <span className="text-[11px] font-bold text-zinc-400 mb-2">
                  Watching {partnerPlayer.name} perform this challenge on camera:
                </span>
                <div className="w-full grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCardForfeit}
                    className="py-2.5 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>Failed / Forfeit</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCardComplete}
                    className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve (+10 pts)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
