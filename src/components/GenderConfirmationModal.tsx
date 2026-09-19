import React, { useState } from 'react';
import { Player } from '../types';
import { soundEngine } from '../utils/audio';
import { Heart, Sparkles, User, Check, ArrowRight, Flame } from 'lucide-react';

interface GenderConfirmationModalProps {
  onConfirm: (partner1: Player, partner2: Player) => void;
  initialPartner1?: Player;
  initialPartner2?: Player;
}

export const GenderConfirmationModal: React.FC<GenderConfirmationModalProps> = ({
  onConfirm,
  initialPartner1,
  initialPartner2,
}) => {
  const [p1Name, setP1Name] = useState(initialPartner1?.name || 'Him');
  const [p1Gender, setP1Gender] = useState<'male' | 'female'>(
    initialPartner1?.gender === 'female' ? 'female' : 'male'
  );

  const [p2Name, setP2Name] = useState(initialPartner2?.name || 'Her');
  const [p2Gender, setP2Gender] = useState<'male' | 'female'>(
    initialPartner2?.gender === 'male' ? 'male' : 'female'
  );

  // Quick preset pairings
  const applyPreset = (g1: 'male' | 'female', g2: 'male' | 'female', n1: string, n2: string) => {
    soundEngine.playTap();
    soundEngine.vibrateTap();
    setP1Gender(g1);
    setP2Gender(g2);
    setP1Name(n1);
    setP2Name(n2);
  };

  const handleConfirm = () => {
    soundEngine.playSuccess();
    soundEngine.vibrateSuccess();

    const partner1: Player = {
      id: 'partner_1',
      name: p1Name.trim() || (p1Gender === 'male' ? 'He' : 'She'),
      gender: p1Gender,
      avatarColor: p1Gender === 'male' ? '#05d9e8' : '#ff2a6d',
      score: 0,
      truthsDone: 0,
      daresDone: 0,
      forfeitsDone: 0,
    };

    const partner2: Player = {
      id: 'partner_2',
      name: p2Name.trim() || (p2Gender === 'female' ? 'She' : 'He'),
      gender: p2Gender,
      avatarColor: p2Gender === 'female' ? '#ff2a6d' : '#05d9e8',
      score: 0,
      truthsDone: 0,
      daresDone: 0,
      forfeitsDone: 0,
    };

    localStorage.setItem('tod_couple_confirmed', 'true');
    localStorage.setItem('tod_players', JSON.stringify([partner1, partner2]));
    onConfirm(partner1, partner2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-xl p-4 select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-rose-800/50 p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Subtle romantic ambient aura */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-400">
            ✓ 18+ Age Verified
          </span>
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-800/60 text-rose-300">
            Step 2: Gender Setup
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 p-0.5 shadow-lg shadow-rose-900/50 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Couples Setup
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Confirm your and your partner's gender to customize the intimate romantic challenges.
          </p>
        </div>

        {/* Quick Couple Presets */}
        <div className="flex items-center justify-center gap-1.5 mb-5 flex-wrap">
          <button
            type="button"
            onClick={() => applyPreset('male', 'female', 'Him', 'Her')}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
              p1Gender === 'male' && p2Gender === 'female'
                ? 'bg-rose-600 border-rose-500 text-white shadow'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            ♂ Male & ♀ Female
          </button>
          <button
            type="button"
            onClick={() => applyPreset('female', 'male', 'Her', 'Him')}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
              p1Gender === 'female' && p2Gender === 'male'
                ? 'bg-rose-600 border-rose-500 text-white shadow'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            ♀ Female & ♂ Male
          </button>
          <button
            type="button"
            onClick={() => applyPreset('female', 'female', 'Partner 1', 'Partner 2')}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
              p1Gender === 'female' && p2Gender === 'female'
                ? 'bg-rose-600 border-rose-500 text-white shadow'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            ♀ ♀ Two Females
          </button>
          <button
            type="button"
            onClick={() => applyPreset('male', 'male', 'Partner 1', 'Partner 2')}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
              p1Gender === 'male' && p2Gender === 'male'
                ? 'bg-rose-600 border-rose-500 text-white shadow'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            ♂ ♂ Two Males
          </button>
        </div>

        {/* Partners Configuration Cards */}
        <div className="space-y-4 mb-6">
          {/* Partner 1 */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                Partner 1
              </span>
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <Flame className="w-3 h-3 fill-rose-500" />
                {p1Gender === 'male' ? 'Male (He/Him)' : 'Female (She/Her)'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-base shadow"
                style={{ backgroundColor: p1Gender === 'male' ? '#05d9e8' : '#ff2a6d' }}
              >
                {p1Gender === 'male' ? '♂' : '♀'}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={p1Name}
                  onChange={(e) => setP1Name(e.target.value)}
                  placeholder="Partner 1 Name (e.g. Alex)"
                  maxLength={16}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-rose-500 transition"
                />

                {/* Male / Female Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTap();
                      setP1Gender('male');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border ${
                      p1Gender === 'male'
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>♂ Male</span>
                    {p1Gender === 'male' && <Check className="w-3 h-3" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTap();
                      setP1Gender('female');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border ${
                      p1Gender === 'female'
                        ? 'bg-pink-950 border-pink-500 text-pink-300 shadow'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>♀ Female</span>
                    {p1Gender === 'female' && <Check className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Neon Heart Divider */}
          <div className="flex items-center justify-center -my-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-zinc-950 border border-rose-500/50 flex items-center justify-center shadow-lg shadow-rose-950/60">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            </div>
          </div>

          {/* Partner 2 */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                Partner 2
              </span>
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <Flame className="w-3 h-3 fill-rose-500" />
                {p2Gender === 'female' ? 'Female (She/Her)' : 'Male (He/Him)'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-base shadow"
                style={{ backgroundColor: p2Gender === 'female' ? '#ff2a6d' : '#05d9e8' }}
              >
                {p2Gender === 'female' ? '♀' : '♂'}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={p2Name}
                  onChange={(e) => setP2Name(e.target.value)}
                  placeholder="Partner 2 Name (e.g. Jordan)"
                  maxLength={16}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-rose-500 transition"
                />

                {/* Male / Female Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTap();
                      setP2Gender('male');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border ${
                      p2Gender === 'male'
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>♂ Male</span>
                    {p2Gender === 'male' && <Check className="w-3 h-3" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTap();
                      setP2Gender('female');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border ${
                      p2Gender === 'female'
                        ? 'bg-pink-950 border-pink-500 text-pink-300 shadow'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>♀ Female</span>
                    {p2Gender === 'female' && <Check className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm and Start Button */}
        <button
          id="confirm-couples-gender-btn"
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 text-white font-black text-base shadow-xl shadow-rose-900/50 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <span>Enter Couples Intimate Game</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
