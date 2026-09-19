import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Vibrate, VibrateOff, Flame, HelpCircle, Shield, Wifi, BatteryCharging } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { soundEngine } from '../utils/audio';
import { GameMode } from '../types';
import { GAME_MODES } from '../data/prompts';

interface AndroidHeaderProps {
  currentMode: GameMode;
  onSelectModeClick: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  vibrationEnabled: boolean;
  onToggleVibration: () => void;
  onOpenRules: () => void;
  isOnlineActive?: boolean;
  onlineRoomCode?: string;
  onOpenOnlineLobby?: () => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  currentMode,
  onSelectModeClick,
  soundEnabled,
  onToggleSound,
  vibrationEnabled,
  onToggleVibration,
  onOpenRules,
  isOnlineActive,
  onlineRoomCode,
  onOpenOnlineLobby,
}) => {
  const [timeStr, setTimeStr] = useState('11:42');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const activeModeMeta = GAME_MODES.find((m) => m.id === currentMode) || GAME_MODES[1];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0c0c14]/90 backdrop-blur-md border-b border-zinc-800/80">
      {/* Android System Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 text-[11px] font-medium text-zinc-400 select-none">
        <span>{timeStr}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1">
            <span>89%</span>
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 max-w-xl mx-auto">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 p-0.5 shadow-md shadow-rose-900/50 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-zinc-950 flex items-center justify-center">
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black tracking-tight text-white uppercase">Truth or Dare</h1>
              <span className="px-1.5 py-0.2 rounded bg-rose-900/70 border border-rose-700/50 text-rose-300 font-extrabold text-[10px]">18+</span>
            </div>
            <button
              onClick={onSelectModeClick}
              className="text-[11px] font-semibold text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeModeMeta.accent }} />
              <span>{activeModeMeta.name}</span>
              <span className="text-[9px] text-zinc-500">▼ change</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Online / Offline status badge button */}
          {onOpenOnlineLobby && (
            <button
              id="online-lobby-btn"
              onClick={() => {
                soundEngine.playTap();
                onOpenOnlineLobby();
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1.5 border transition active:scale-95 ${
                isOnlineActive
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-sm'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
              }`}
              title="Play Online or Offline"
            >
              <Wifi className={`w-3 h-3 ${isOnlineActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <span>{isOnlineActive ? onlineRoomCode || 'Online' : 'Online / Offline'}</span>
            </button>
          )}

          <PWAInstallButton />

          {/* Sound Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={() => {
              soundEngine.playTap();
              onToggleSound();
            }}
            className={`p-2 rounded-xl transition ${
              soundEnabled ? 'text-zinc-200 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-800/50'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Vibration Toggle */}
          <button
            id="toggle-vibration-btn"
            onClick={() => {
              soundEngine.playTap();
              onToggleVibration();
            }}
            className={`p-2 rounded-xl transition ${
              vibrationEnabled ? 'text-zinc-200 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-800/50'
            }`}
            title={vibrationEnabled ? 'Disable Haptics' : 'Enable Haptics'}
          >
            {vibrationEnabled ? <Vibrate className="w-4 h-4" /> : <VibrateOff className="w-4 h-4" />}
          </button>

          {/* Rules / Help */}
          <button
            id="open-rules-btn"
            onClick={() => {
              soundEngine.playTap();
              onOpenRules();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Game Rules & Consent"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
