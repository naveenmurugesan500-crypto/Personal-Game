import React, { useState } from 'react';
import { Penalty, Player } from '../types';
import { DEFAULT_PENALTIES } from '../data/prompts';
import { soundEngine } from '../utils/audio';
import { Skull, Wine, Shuffle, CheckCircle, Flame } from 'lucide-react';

interface ForfeitModalProps {
  player: Player;
  onAcceptPenalty: () => void;
}

export const ForfeitModal: React.FC<ForfeitModalProps> = ({ player, onAcceptPenalty }) => {
  const [penalties] = useState<Penalty[]>(DEFAULT_PENALTIES);
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * DEFAULT_PENALTIES.length)
  );
  const [isShuffling, setIsShuffling] = useState(false);

  const activePenalty = penalties[currentIndex] || DEFAULT_PENALTIES[0];

  const handleShuffle = () => {
    soundEngine.playCardFlip();
    soundEngine.vibrateTap();
    setIsShuffling(true);

    let count = 0;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % penalties.length);
      soundEngine.playSpinTick();
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setIsShuffling(false);
        soundEngine.playSuccess();
        soundEngine.vibrateCardReveal();
      }
    }, 80);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-zinc-950 border-2 border-red-900/60 p-6 shadow-2xl text-center flex flex-col items-center">
        {/* Skull / Drink Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-500 mb-4 shadow-lg shadow-red-950/50">
          <Wine className="w-8 h-8 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/50 border border-red-800/40 text-red-400 text-xs font-black uppercase tracking-wider mb-2">
          <Skull className="w-3.5 h-3.5" />
          <span>CHICKENED OUT!</span>
        </div>

        <h3 className="text-xl font-black text-white tracking-tight mb-1">
          {player.name}'s Penalty
        </h3>
        <p className="text-xs text-zinc-400 mb-5">
          You refused the challenge! You must complete this forfeit to stay in the game.
        </p>

        {/* Penalty Display Card */}
        <div className="w-full min-h-[120px] rounded-2xl bg-zinc-900/90 border border-zinc-800 p-5 flex flex-col items-center justify-center mb-6 shadow-inner">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 mb-1">
            FORFEIT / PUNISHMENT
          </span>
          <p className="text-base font-bold text-white leading-snug">
            "{activePenalty.text}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            id="accept-penalty-btn"
            onClick={() => {
              soundEngine.playSuccess();
              soundEngine.vibrateSuccess();
              onAcceptPenalty();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white font-black text-sm shadow-lg shadow-red-900/40 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>I Surrender & Took Penalty</span>
          </button>

          <button
            disabled={isShuffling}
            onClick={handleShuffle}
            className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition"
          >
            <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>Roll Different Penalty</span>
          </button>
        </div>
      </div>
    </div>
  );
};
