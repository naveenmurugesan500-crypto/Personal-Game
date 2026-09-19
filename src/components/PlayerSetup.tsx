import React, { useState } from 'react';
import { Player } from '../types';
import { Heart, Sparkles, Check, Flame, RefreshCw, UserCheck } from 'lucide-react';
import { soundEngine } from '../utils/audio';

const AVATAR_COLORS = [
  '#ff2a6d', // hot pink
  '#05d9e8', // neon cyan
  '#a855f7', // electric purple
  '#f59e0b', // amber gold
  '#ef4444', // crimson
  '#3b82f6', // bright blue
  '#ec4899', // rose
  '#10b981', // emerald
];

interface PlayerSetupProps {
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
  onStartGame: () => void;
  onOpenGenderModal?: () => void;
}

export const PlayerSetup: React.FC<PlayerSetupProps> = ({
  players,
  onUpdatePlayers,
  onStartGame,
  onOpenGenderModal,
}) => {
  const p1 = players[0] || {
    id: 'partner_1',
    name: 'Him',
    gender: 'male',
    avatarColor: '#05d9e8',
    score: 0,
    truthsDone: 0,
    daresDone: 0,
    forfeitsDone: 0,
  };

  const p2 = players[1] || {
    id: 'partner_2',
    name: 'Her',
    gender: 'female',
    avatarColor: '#ff2a6d',
    score: 0,
    truthsDone: 0,
    daresDone: 0,
    forfeitsDone: 0,
  };

  const updatePartner1 = (fields: Partial<Player>) => {
    soundEngine.playTap();
    const updatedP1 = { ...p1, ...fields };
    onUpdatePlayers([updatedP1, p2]);
  };

  const updatePartner2 = (fields: Partial<Player>) => {
    soundEngine.playTap();
    const updatedP2 = { ...p2, ...fields };
    onUpdatePlayers([p1, updatedP2]);
  };

  const swapRoles = () => {
    soundEngine.playTap();
    soundEngine.vibrateTap();
    onUpdatePlayers([
      { ...p2, id: 'partner_1' },
      { ...p1, id: 'partner_2' },
    ]);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 select-none pb-28">
      {/* Title & Couple Badge */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs font-black tracking-wider uppercase mb-2">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>Intimate Couples Edition</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Couples Profiles</h2>
        <p className="text-xs text-zinc-400 mt-1">Configure both partners' names and confirmed gender</p>
      </div>

      {/* Quick Swap & Gender Modal Reset */}
      <div className="flex items-center justify-between gap-2 mb-4 px-1">
        <button
          type="button"
          onClick={swapRoles}
          className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
          <span>Swap Turn Order</span>
        </button>

        {onOpenGenderModal && (
          <button
            type="button"
            onClick={onOpenGenderModal}
            className="flex-1 py-2 px-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <UserCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Gender Setup Wizard</span>
          </button>
        )}
      </div>

      {/* Partners Configuration Cards */}
      <div className="space-y-4 mb-6">
        {/* Partner 1 */}
        <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
              Partner 1
            </span>
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-rose-500" />
              {p1.gender === 'male' ? 'Male (He/Him)' : 'Female (She/Her)'}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md"
              style={{ backgroundColor: p1.avatarColor }}
            >
              {p1.gender === 'male' ? '♂' : '♀'}
            </div>

            <div className="flex-1">
              <input
                id="partner-1-name-input"
                type="text"
                value={p1.name}
                onChange={(e) => updatePartner1({ name: e.target.value })}
                placeholder="Partner 1 name..."
                maxLength={16}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold text-sm focus:outline-none focus:border-rose-500 transition"
              />
            </div>
          </div>

          {/* Gender Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => updatePartner1({ gender: 'male', avatarColor: '#05d9e8' })}
              className={`py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border ${
                p1.gender === 'male'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-md'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>♂ Male</span>
              {p1.gender === 'male' && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => updatePartner1({ gender: 'female', avatarColor: '#ff2a6d' })}
              className={`py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border ${
                p1.gender === 'female'
                  ? 'bg-pink-950 border-pink-500 text-pink-300 shadow-md'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>♀ Female</span>
              {p1.gender === 'female' && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Color Palette */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Aura Color:</span>
            <div className="flex items-center gap-1.5">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updatePartner1({ avatarColor: c })}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-full transition ${
                    p1.avatarColor === c ? 'ring-2 ring-white scale-110 shadow' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Intimacy Connection Heart */}
        <div className="flex items-center justify-center -my-2 relative z-10">
          <div className="w-9 h-9 rounded-full bg-zinc-950 border border-rose-500/60 flex items-center justify-center shadow-lg shadow-rose-950/80">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
        </div>

        {/* Partner 2 */}
        <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
              Partner 2
            </span>
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-rose-500" />
              {p2.gender === 'female' ? 'Female (She/Her)' : 'Male (He/Him)'}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md"
              style={{ backgroundColor: p2.avatarColor }}
            >
              {p2.gender === 'female' ? '♀' : '♂'}
            </div>

            <div className="flex-1">
              <input
                id="partner-2-name-input"
                type="text"
                value={p2.name}
                onChange={(e) => updatePartner2({ name: e.target.value })}
                placeholder="Partner 2 name..."
                maxLength={16}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold text-sm focus:outline-none focus:border-rose-500 transition"
              />
            </div>
          </div>

          {/* Gender Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => updatePartner2({ gender: 'male', avatarColor: '#05d9e8' })}
              className={`py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border ${
                p2.gender === 'male'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-md'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>♂ Male</span>
              {p2.gender === 'male' && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => updatePartner2({ gender: 'female', avatarColor: '#ff2a6d' })}
              className={`py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border ${
                p2.gender === 'female'
                  ? 'bg-pink-950 border-pink-500 text-pink-300 shadow-md'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>♀ Female</span>
              {p2.gender === 'female' && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Color Palette */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Aura Color:</span>
            <div className="flex items-center gap-1.5">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updatePartner2({ avatarColor: c })}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-full transition ${
                    p2.avatarColor === c ? 'ring-2 ring-white scale-110 shadow' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Couple Intimacy Chemistry Summary */}
      <div className="p-4 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 mb-6 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Intimacy Chemistry</span>
          <span className="text-sm font-black text-rose-400">100% Couples Match</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-zinc-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{p1.truthsDone + p2.truthsDone + p1.daresDone + p2.daresDone} Rounds Played</span>
        </div>
      </div>

      {/* Start Couples Game Button */}
      <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 z-20">
        <button
          id="start-couples-game-btn"
          onClick={() => {
            soundEngine.playSuccess();
            soundEngine.vibrateSuccess();
            onStartGame();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 text-white font-black text-base shadow-xl shadow-rose-900/50 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <Flame className="w-5 h-5 fill-white" />
          <span>Start Couples Game ({p1.name} & {p2.name})</span>
        </button>
      </div>
    </div>
  );
};
