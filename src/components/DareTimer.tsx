import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Bell } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface DareTimerProps {
  onClose: () => void;
  defaultSeconds?: number;
}

export const DareTimer: React.FC<DareTimerProps> = ({ onClose, defaultSeconds = 30 }) => {
  const [totalSeconds, setTotalSeconds] = useState(defaultSeconds);
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [isActive, setIsActive] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            setIsFinished(true);
            soundEngine.playBuzzer();
            soundEngine.vibrateBuzzer();
            return 0;
          }
          if (prev <= 6) {
            soundEngine.playTick();
            soundEngine.vibrateSpinTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const resetTimer = (seconds: number) => {
    soundEngine.playTap();
    setTotalSeconds(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
    setIsFinished(false);
  };

  const togglePause = () => {
    soundEngine.playTap();
    setIsActive(!isActive);
  };

  const progress = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  const strokeDashoffset = 283 - (283 * progress) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-black text-white tracking-wide mb-1 flex items-center gap-2">
          <span>DARE COUNTDOWN</span>
        </h3>
        <p className="text-xs text-zinc-400 mb-6">Complete your dare before time expires!</p>

        {/* Circular Countdown Progress */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#27272a"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={isFinished ? '#ef4444' : timeLeft <= 5 ? '#f59e0b' : '#ff2a6d'}
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-linear"
            />
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-4xl sm:text-5xl font-black font-mono tracking-tighter ${
                isFinished ? 'text-red-500 animate-bounce' : timeLeft <= 5 ? 'text-amber-400 animate-pulse' : 'text-white'
              }`}
            >
              {timeLeft}s
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mt-1">
              {isFinished ? 'TIME OUT!' : isActive ? 'Ticking...' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Time Preset Pills */}
        <div className="flex items-center gap-2 mb-6">
          {[15, 30, 45, 60].map((sec) => (
            <button
              key={sec}
              onClick={() => resetTimer(sec)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                totalSeconds === sec
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/50'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={togglePause}
            className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            onClick={() => resetTimer(totalSeconds)}
            className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition border border-zinc-800"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-sm shadow-md hover:brightness-110 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
