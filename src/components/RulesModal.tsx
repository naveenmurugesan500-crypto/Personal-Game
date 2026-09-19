import React from 'react';
import { Shield, Heart, Sparkles, AlertCircle, X } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-rose-500" />
          <h3 className="text-xl font-black text-white tracking-tight">Party Rules & Consent</h3>
        </div>
        <p className="text-xs text-zinc-400 mb-5">
          Guiding rules for an electric, safe, and exciting adult night.
        </p>

        <div className="space-y-3.5 mb-6 text-xs text-zinc-300">
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
              <Heart className="w-4 h-4 fill-rose-500" />
              <span>1. Mutual Adult Consent</span>
            </div>
            <p className="leading-relaxed text-zinc-400">
              Every challenge and dare must be comfortable for both participants. No player should ever be pressured into an action they do not genuinely want to do.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>2. The Safe Pass / Penalty Option</span>
            </div>
            <p className="leading-relaxed text-zinc-400">
              Uncomfortable with a question or dare? Tap "Forfeit / Penalty" to take a funny sip or silly forfeit instead of doing the prompt.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center gap-2 font-bold text-cyan-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>3. Las Vegas Rule</span>
            </div>
            <p className="leading-relaxed text-zinc-400">
              What is confessed or shared during the game stays strictly between the players in the room. Respect each other's privacy!
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center gap-2 font-bold text-purple-400 mb-1">
              <Shield className="w-4 h-4" />
              <span>4. Adult Verification (18+)</span>
            </div>
            <p className="leading-relaxed text-zinc-400">
              This game is strictly crafted for legal adults. Keep alcoholic beverages and mature themes responsible.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition"
        >
          Understood, Let's Play!
        </button>
      </div>
    </div>
  );
};
