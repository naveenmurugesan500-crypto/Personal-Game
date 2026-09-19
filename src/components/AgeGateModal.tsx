import React from 'react';
import { ShieldAlert, Flame, Lock } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface AgeGateModalProps {
  onConfirm: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ onConfirm }) => {
  const handleAccept = () => {
    soundEngine.playSuccess();
    soundEngine.vibrateSuccess();
    localStorage.setItem('tod_adult_verified', 'true');
    onConfirm();
  };

  const handleDecline = () => {
    soundEngine.playBuzzer();
    soundEngine.vibrateBuzzer();
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-rose-900/50 p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* 18+ Badge Icon */}
        <div className="mx-auto mb-5 w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-700 via-red-600 to-pink-600 p-0.5 shadow-xl shadow-rose-900/40">
          <div className="w-full h-full rounded-[14px] bg-zinc-950 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-rose-500 tracking-tight">18+</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mature</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          Adults Only (18+)
        </h2>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs font-semibold mb-4">
          <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Explicit Party Game for Adults</span>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
          This game contains mature themes, spicy romantic dares, intimate confessions, and adult party humor.
          It is strictly intended for consenting players aged <strong className="text-white">18 years or older</strong>.
        </p>

        <div className="space-y-3">
          <button
            id="age-confirm-btn"
            onClick={handleAccept}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 text-white font-bold text-base shadow-lg shadow-rose-900/50 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <span>I Am 18+ — Enter Game</span>
            <Flame className="w-4 h-4 fill-white" />
          </button>

          <button
            id="age-decline-btn"
            onClick={handleDecline}
            className="w-full py-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-medium text-sm transition"
          >
            I am Under 18 (Exit)
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
          <Lock className="w-3.5 h-3.5" />
          <span>All challenges must respect mutual consent & safety</span>
        </div>
      </div>
    </div>
  );
};
