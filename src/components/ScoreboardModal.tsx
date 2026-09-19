import React from 'react';
import { Player } from '../types';
import { Trophy, Award, Flame, X, ShieldCheck, Wine, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface ScoreboardModalProps {
  players: Player[];
  onResetScores: () => void;
  onClose: () => void;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  players,
  onResetScores,
  onClose,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const mvp = sortedPlayers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-black text-white tracking-tight">Party Scoreboard</h3>
        </div>
        <p className="text-xs text-zinc-400 mb-5">
          See who is the bravest player and who had the most drinks!
        </p>

        {/* MVP Banner */}
        {mvp && mvp.score > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-pink-500/20 border border-amber-500/40 mb-5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">
                  Current Party Champion
                </span>
                <span className="text-base font-black text-white">{mvp.name}</span>
              </div>
            </div>
            <span className="text-lg font-black font-mono text-amber-400">{mvp.score} pts</span>
          </div>
        )}

        {/* Players List Table */}
        <div className="space-y-2.5 mb-6">
          {sortedPlayers.map((player, idx) => (
            <div
              key={player.id}
              className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-xs font-black text-zinc-500 text-center">
                  #{idx + 1}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase"
                  style={{ backgroundColor: player.avatarColor }}
                >
                  {player.name.substring(0, 2)}
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">{player.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                    <span className="flex items-center gap-0.5 text-cyan-400">
                      <ShieldCheck className="w-3 h-3" /> {player.truthsDone} truths
                    </span>
                    <span className="flex items-center gap-0.5 text-rose-400">
                      <Flame className="w-3 h-3 fill-rose-500" /> {player.daresDone} dares
                    </span>
                    {player.forfeitsDone > 0 && (
                      <span className="flex items-center gap-0.5 text-amber-400">
                        <Wine className="w-3 h-3" /> {player.forfeitsDone} drinks
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className="text-sm font-black font-mono text-white px-2 py-1 rounded-lg bg-zinc-800">
                {player.score} pts
              </span>
            </div>
          ))}
        </div>

        {/* Reset / Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundEngine.playTap();
              if (confirm('Reset all player scores to zero?')) {
                onResetScores();
              }
            }}
            className="flex-1 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Scores</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
