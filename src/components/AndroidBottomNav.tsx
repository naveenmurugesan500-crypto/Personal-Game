import React from 'react';
import { AppScreen } from '../types';
import { Flame, Heart, Layers, PlusCircle, Trophy } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface AndroidBottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const navItems: { screen: AppScreen; label: string; icon: React.ReactNode }[] = [
    { screen: 'play', label: 'Game', icon: <Flame className="w-5 h-5" /> },
    { screen: 'players', label: 'Couple', icon: <Heart className="w-5 h-5" /> },
    { screen: 'modes', label: 'Modes', icon: <Layers className="w-5 h-5" /> },
    { screen: 'custom_prompts', label: 'Custom +', icon: <PlusCircle className="w-5 h-5" /> },
    { screen: 'stats', label: 'Scores', icon: <Trophy className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 max-w-md mx-auto">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => {
                soundEngine.playTap();
                soundEngine.vibrateTap();
                onNavigate(item.screen);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-rose-500 scale-105' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-rose-500/15 shadow-sm shadow-rose-900/30' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Android Home Navigation Bar indicator line */}
      <div className="w-32 h-1 bg-zinc-700/60 rounded-full mx-auto mb-1" />
    </nav>
  );
};
