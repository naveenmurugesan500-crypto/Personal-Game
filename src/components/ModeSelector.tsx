import React from 'react';
import { GameMode } from '../types';
import { GAME_MODES } from '../data/prompts';
import { Flame, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface ModeSelectorProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onBack: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  onBack,
}) => {
  const handlePickMode = (mode: GameMode) => {
    soundEngine.playCardFlip();
    soundEngine.vibrateCardReveal();
    onSelectMode(mode);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 select-none pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h2 className="text-lg font-black text-white uppercase tracking-wider">Choose Game Mode</h2>
        <div className="w-8" />
      </div>

      <p className="text-xs text-zinc-400 text-center mb-5">
        Select your party intensity level. All modes are strictly 18+ adult content.
      </p>

      {/* Modes List */}
      <div className="space-y-3.5">
        {GAME_MODES.map((mode) => {
          const isSelected = currentMode === mode.id;

          return (
            <div
              key={mode.id}
              onClick={() => handlePickMode(mode.id)}
              className={`relative rounded-3xl p-5 border-2 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? `bg-gradient-to-r ${mode.color} shadow-xl scale-[1.01]`
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white tracking-wide">{mode.name}</h3>
                    <span
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow"
                      style={{
                        backgroundColor: `${mode.accent}20`,
                        borderColor: `${mode.accent}50`,
                        color: mode.accent,
                      }}
                    >
                      {mode.badge}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-300 mt-0.5">{mode.tagline}</p>
                </div>

                {/* Flame Spice Indicator */}
                <div className="flex items-center gap-0.5 bg-black/40 px-2 py-1 rounded-full border border-zinc-800">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Flame
                      key={i}
                      className={`w-3 h-3 ${
                        i < mode.spiceLevel
                          ? 'text-rose-500 fill-rose-500'
                          : 'text-zinc-700 fill-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed mb-3">{mode.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                <span className="text-[11px] font-bold text-zinc-400">
                  Spice Level: <span className="text-white font-mono">{mode.spiceLevel}/5</span>
                </span>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </>
                  ) : (
                    <span>Select</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
