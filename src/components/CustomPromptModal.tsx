import React, { useState } from 'react';
import { Prompt, PromptType, GameMode, Player } from '../types';
import { PlusCircle, Sparkles, X, Flame, ShieldCheck, Check } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface CustomPromptModalProps {
  currentMode: GameMode;
  players: Player[];
  onAddCustomPrompt: (prompt: Prompt) => void;
  onAddMultiplePrompts: (prompts: Prompt[]) => void;
  onClose: () => void;
}

export const CustomPromptModal: React.FC<CustomPromptModalProps> = ({
  currentMode,
  players,
  onAddCustomPrompt,
  onAddMultiplePrompts,
  onClose,
}) => {
  const [text, setText] = useState('');
  const [type, setType] = useState<PromptType>('dare');
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    soundEngine.playSuccess();
    soundEngine.vibrateSuccess();

    const newPrompt: Prompt = {
      id: `custom_${Date.now()}`,
      text: text.trim(),
      type,
      category: currentMode,
      intensity,
      isCustom: true,
    };

    onAddCustomPrompt(newPrompt);
    setText('');
    onClose();
  };

  const handleGenerateAI = async () => {
    soundEngine.playTap();
    soundEngine.vibrateTap();
    setIsAiLoading(true);
    setAiMessage(null);

    try {
      const res = await fetch('/api/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: currentMode,
          players: players.map((p) => p.name),
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.prompts) && data.prompts.length > 0) {
        const generated: Prompt[] = data.prompts.map((p: any, idx: number) => ({
          id: `ai_${Date.now()}_${idx}`,
          text: p.text,
          type: p.type === 'truth' ? 'truth' : 'dare',
          category: currentMode,
          intensity: (p.intensity === 1 || p.intensity === 2 || p.intensity === 3 ? p.intensity : 2) as 1 | 2 | 3,
          isCustom: true,
        }));

        soundEngine.playSuccess();
        soundEngine.vibrateSuccess();
        onAddMultiplePrompts(generated);
        setAiMessage(`Generated & added ${generated.length} AI spicy prompts!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setAiMessage('Using offline deck. You can manually write your own spicy prompts!');
      }
    } catch (err) {
      console.error(err);
      setAiMessage('Could not connect to AI generator. You can add your custom prompt above!');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-white tracking-tight mb-1 flex items-center gap-2">
          <span>Add Custom Prompt</span>
          <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
        </h3>
        <p className="text-xs text-zinc-400 mb-5">
          Write an inside joke, personal fantasy, or special dare for your friends.
        </p>

        {/* AI Spice Quick Generator Section */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-rose-950/30 to-pink-950/40 border border-purple-800/40 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Spicy Pack Generator</span>
            </div>
            <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 font-mono">
              Auto-Spice
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-3">
            Use Gemini AI to instantly generate 6 custom adult challenges tailored for {players.map((p) => p.name).join(', ')}.
          </p>
          <button
            onClick={handleGenerateAI}
            disabled={isAiLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>{isAiLoading ? 'Crafting Spicy Dares...' : 'Generate 6 AI Adult Prompts'}</span>
          </button>
          {aiMessage && (
            <p className="text-[11px] text-center text-emerald-400 font-semibold mt-2">
              {aiMessage}
            </p>
          )}
        </div>

        {/* Manual Custom Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Truth or Dare Type Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('truth')}
                className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  type === 'truth'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/50'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Truth</span>
              </button>

              <button
                type="button"
                onClick={() => setType('dare')}
                className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  type === 'dare'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-md shadow-rose-950/50'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>Dare</span>
              </button>
            </div>
          </div>

          {/* Intensity Rating */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">Spice Intensity</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 1, label: '🔥 Mild' },
                { val: 2, label: '🔥🔥 Hot' },
                { val: 3, label: '🔥🔥🔥 Wild' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setIntensity(item.val as any)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    intensity === item.val
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Challenge Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Kiss the cheek of the person to your left for 10 seconds..."
              rows={3}
              maxLength={240}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-rose-900/40 transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add to Game Deck</span>
          </button>
        </form>
      </div>
    </div>
  );
};
