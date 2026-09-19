import React, { useState } from 'react';
import { Player, Prompt, PromptType, CoupleLevel, PlayEnvironment } from '../types';
import { soundEngine } from '../utils/audio';
import {
  Flame,
  RefreshCw,
  Timer,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Video,
  Heart,
  Camera,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CardDeckProps {
  activePlayer: Player;
  currentPrompt: Prompt | null;
  selectedType: PromptType | null;
  onSelectType: (type: PromptType) => void;
  onCompletePrompt: (success: boolean) => void;
  onForfeitPrompt: () => void;
  onRerollPrompt: () => void;
  onOpenTimer: () => void;
  activeLevel?: CoupleLevel;
  activeEnvironment?: PlayEnvironment;
  onToggleCam?: () => void;
  isCamActive?: boolean;
}

export const CardDeck: React.FC<CardDeckProps> = ({
  activePlayer,
  currentPrompt,
  selectedType,
  onSelectType,
  onCompletePrompt,
  onForfeitPrompt,
  onRerollPrompt,
  onOpenTimer,
  activeLevel = 'soft',
  activeEnvironment = 'direct_play',
  onToggleCam,
  isCamActive,
}) => {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleChooseType = (type: PromptType) => {
    soundEngine.playCardFlip();
    soundEngine.vibrateCardReveal();
    setIsFlipping(true);
    setTimeout(() => {
      onSelectType(type);
      setIsFlipping(false);
    }, 280);
  };

  const handleComplete = () => {
    soundEngine.playSuccess();
    soundEngine.vibrateSuccess();

    // Trigger adult celebratory confetti
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#ff2a6d', '#ff7700', '#ffee00', '#9b00e8'],
      });
    } catch {
      // Ignore
    }

    onCompletePrompt(true);
  };

  const handleForfeit = () => {
    soundEngine.playBuzzer();
    soundEngine.vibrateBuzzer();
    onForfeitPrompt();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center px-4 py-2 select-none">
      {/* Active Player Status Banner */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 shadow-md">
          <div
            className="w-3.5 h-3.5 rounded-full shadow"
            style={{ backgroundColor: activePlayer.avatarColor }}
          />
          <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            Turn:{' '}
            <strong className="text-white tracking-wide">{activePlayer.name}</strong>
            <span
              className={`text-[11px] font-black px-1.5 py-0.2 rounded-full ${
                activePlayer.gender === 'male'
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                  : 'bg-pink-950 text-pink-400 border border-pink-800/60'
              }`}
            >
              {activePlayer.gender === 'male' ? '♂ Him' : '♀ Her'}
            </span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono font-bold">
            {activePlayer.score} pts
          </span>
        </div>

        {/* Level and Mode tags */}
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider">
          <span
            className={`px-2.5 py-1 rounded-full border ${
              activeLevel === 'soft'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                : activeLevel === 'medium'
                ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
            }`}
          >
            {activeLevel}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 flex items-center gap-1">
            {activeEnvironment === 'video_call' ? (
              <>
                <Video className="w-3 h-3 text-purple-400" />
                <span>Video Call</span>
              </>
            ) : (
              <>
                <Flame className="w-3 h-3 text-rose-500" />
                <span>Direct Play</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* If No Type Selected Yet: Choice Cards (TRUTH vs DARE) */}
      {!selectedType || !currentPrompt ? (
        <div className="w-full grid grid-cols-2 gap-4 my-2">
          {/* TRUTH CARD */}
          <button
            id="choose-truth-btn"
            onClick={() => handleChooseType('truth')}
            className="group relative h-64 rounded-3xl bg-gradient-to-b from-cyan-950/60 via-zinc-950 to-black border-2 border-cyan-500/40 p-5 flex flex-col items-center justify-between shadow-xl shadow-cyan-950/40 hover:border-cyan-400 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            <div className="w-full flex justify-between items-center text-cyan-400 text-xs font-bold">
              <span>TRUTH</span>
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition duration-300">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <span className="text-xl font-black text-white tracking-wider">TRUTH</span>
              <span className="text-[11px] text-cyan-300/80 text-center mt-1">Spicy confessions & deep secrets</span>
            </div>

            <div className="w-full py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold text-center border border-cyan-500/30">
              Pick Truth
            </div>
          </button>

          {/* DARE CARD */}
          <button
            id="choose-dare-btn"
            onClick={() => handleChooseType('dare')}
            className="group relative h-64 rounded-3xl bg-gradient-to-b from-rose-950/60 via-zinc-950 to-black border-2 border-rose-500/40 p-5 flex flex-col items-center justify-between shadow-xl shadow-rose-950/40 hover:border-rose-400 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            <div className="w-full flex justify-between items-center text-rose-400 text-xs font-bold">
              <span>DARE</span>
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-3 group-hover:scale-110 transition duration-300">
                <Flame className="w-8 h-8 fill-rose-500" />
              </div>
              <span className="text-xl font-black text-white tracking-wider">DARE</span>
              <span className="text-[11px] text-rose-300/80 text-center mt-1">Physical actions & thrilling tests</span>
            </div>

            <div className="w-full py-1.5 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold text-center border border-rose-500/30">
              Pick Dare
            </div>
          </button>
        </div>
      ) : (
        /* REVEALED CARD VIEW */
        <div
          className={`w-full relative rounded-3xl p-6 shadow-2xl border-2 transition-all duration-300 ${
            selectedType === 'truth'
              ? 'bg-gradient-to-b from-cyan-950/80 via-zinc-950 to-black border-cyan-500/50 shadow-cyan-950/50'
              : 'bg-gradient-to-b from-rose-950/80 via-zinc-950 to-black border-rose-500/50 shadow-rose-950/50'
          } ${isFlipping ? 'scale-90 rotate-y-90' : 'scale-100'}`}
        >
          {/* Card Top Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-1.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                  selectedType === 'truth'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {selectedType.toUpperCase()}
              </span>

              {/* Target gender badge if set */}
              {currentPrompt.targetGender && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    currentPrompt.targetGender === 'male'
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                      : 'bg-pink-950/80 text-pink-300 border border-pink-700/60'
                  }`}
                >
                  {currentPrompt.targetGender === 'male' ? '♂ For Him' : '♀ For Her'}
                </span>
              )}
            </div>

            {/* Intensity Flame Rating */}
            <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full border border-zinc-800">
              {Array.from({ length: 3 }).map((_, i) => (
                <Flame
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < currentPrompt.intensity
                      ? 'text-rose-500 fill-rose-500'
                      : 'text-zinc-700 fill-zinc-800'
                  }`}
                />
              ))}
              <span className="text-[10px] font-bold text-zinc-400 ml-1">
                {currentPrompt.intensity === 1
                  ? 'Mild'
                  : currentPrompt.intensity === 2
                  ? 'Hot'
                  : 'Extreme'}
              </span>
            </div>
          </div>

          {/* Prompt Challenge Text */}
          <div className="min-h-[140px] flex items-center justify-center my-4 px-2">
            <p className="text-lg sm:text-xl font-bold text-white text-center leading-relaxed drop-shadow-sm">
              "{currentPrompt.text}"
            </p>
          </div>

          {/* Quick Action Helpers for Dare (Timer + Cam) */}
          {selectedType === 'dare' && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={onOpenTimer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-bold text-amber-400 hover:bg-zinc-800 active:scale-95 transition"
              >
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span>30s Countdown</span>
              </button>

              {onToggleCam && (
                <button
                  type="button"
                  onClick={onToggleCam}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border active:scale-95 transition ${
                    isCamActive
                      ? 'bg-purple-900/80 border-purple-500 text-purple-200'
                      : 'bg-zinc-900 border-zinc-700 text-purple-300 hover:bg-zinc-800'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isCamActive ? 'Hide Cam Mirror' : 'Open Cam Mirror'}</span>
                </button>
              )}
            </div>
          )}

          {/* Bottom Controls */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Completed */}
              <button
                id="prompt-done-btn"
                onClick={handleComplete}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Done (+10)</span>
              </button>

              {/* Forfeit / Refused */}
              <button
                id="prompt-forfeit-btn"
                onClick={handleForfeit}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-red-700 to-rose-800 text-white font-bold text-sm shadow-lg shadow-red-950/50 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Forfeit / Drink!</span>
              </button>
            </div>

            {/* Reroll Button (Change question with mutual comfort) */}
            <div className="flex justify-center">
              <button
                id="prompt-reroll-btn"
                onClick={() => {
                  soundEngine.playTap();
                  soundEngine.vibrateTap();
                  onRerollPrompt();
                }}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition py-1 px-3 rounded-lg hover:bg-zinc-800/60"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reroll / Swap Prompt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
