import React, { useState, useRef, useEffect } from 'react';
import { Player } from '../types';
import { soundEngine } from '../utils/audio';
import { RotateCw, Sparkles, UserCheck } from 'lucide-react';

interface BottleSpinnerProps {
  players: Player[];
  activePlayerIndex: number;
  onPlayerSelected: (index: number) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export const BottleSpinner: React.FC<BottleSpinnerProps> = ({
  players,
  activePlayerIndex,
  onPlayerSelected,
  isSpinning,
  setIsSpinning,
}) => {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(
    players.length > 0 ? players[activePlayerIndex] || players[0] : null
  );
  const animationFrameRef = useRef<number | null>(null);
  const spinVelocityRef = useRef<number>(0);
  const spinAngleRef = useRef<number>(0);
  const lastTickAngleRef = useRef<number>(0);

  // Sync angle ref
  useEffect(() => {
    spinAngleRef.current = currentAngle;
  }, [currentAngle]);

  const numPlayers = Math.max(players.length, 1);
  const angleStep = 360 / numPlayers;

  // Spin the bottle with easing deceleration
  const handleSpin = () => {
    if (isSpinning || players.length < 2) return;

    soundEngine.playTap();
    soundEngine.vibrateTap();
    setIsSpinning(true);
    setSelectedPlayer(null);

    // Random rotations: between 4 and 7 full rotations plus random landing angle
    const extraSpins = 4 + Math.random() * 3;
    const targetExtraDeg = extraSpins * 360 + Math.random() * 360;
    const startAngle = spinAngleRef.current;
    const finalAngle = startAngle + targetExtraDeg;
    const duration = 3800; // ms
    const startTime = performance.now();

    lastTickAngleRef.current = startAngle;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic curve for realistic friction/deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const angle = startAngle + (finalAngle - startAngle) * easeOut;

      spinAngleRef.current = angle;
      setCurrentAngle(angle);

      // Play click & haptic when bottle passes a player sector (every angleStep degrees)
      if (Math.abs(angle - lastTickAngleRef.current) >= angleStep) {
        lastTickAngleRef.current = angle;
        const currentSpeed = (1 - progress);
        const pitch = 300 + currentSpeed * 500;
        soundEngine.playSpinTick(pitch);
        soundEngine.vibrateSpinTick();
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateSpin);
      } else {
        // Finished spinning! Normalize angle to 0..360
        setIsSpinning(false);
        const normalized = ((angle % 360) + 360) % 360;
        
        // The bottle tip points UP (0 deg is top player).
        // Each player i sits at (i * angleStep - 90 deg) in circular coordinate system,
        // so index = Math.round(normalized / angleStep) % numPlayers
        const pickedIndex = Math.floor(((360 - normalized + (angleStep / 2)) % 360) / angleStep) % numPlayers;
        
        soundEngine.playSuccess();
        soundEngine.vibrateCardReveal();
        setSelectedPlayer(players[pickedIndex]);
        onPlayerSelected(pickedIndex);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateSpin);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-sm aspect-square mx-auto flex items-center justify-center select-none my-2">
      {/* Outer ambient glow arena ring */}
      <div className="absolute inset-2 rounded-full border border-rose-900/30 bg-gradient-to-b from-rose-950/20 via-zinc-950/40 to-black/80 shadow-[inset_0_0_60px_rgba(255,42,109,0.08)]" />
      <div className="absolute inset-8 rounded-full border border-dashed border-zinc-800/60 pointer-events-none" />

      {/* Center pedestal / glow */}
      <div className="absolute w-28 h-28 rounded-full bg-rose-600/10 blur-xl pointer-events-none" />

      {/* Players around the circle */}
      {players.map((player, index) => {
        const playerAngle = index * angleStep;
        const rad = (playerAngle - 90) * (Math.PI / 180);
        // Distance from center in percentage (approx 38% for ring placement)
        const x = 50 + 38 * Math.cos(rad);
        const y = 50 + 38 * Math.sin(rad);
        const isTarget = selectedPlayer?.id === player.id;

        return (
          <div
            key={player.id}
            style={{ left: `${x}%`, top: `${y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300 z-10 ${
              isTarget ? 'scale-115' : 'scale-95 opacity-85'
            }`}
          >
            {/* Player Avatar */}
            <div
              className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 shadow-lg transition-all ${
                isTarget
                  ? 'ring-4 ring-rose-500 ring-offset-2 ring-offset-zinc-950 shadow-rose-500/50 scale-110'
                  : 'border border-zinc-700'
              }`}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm uppercase shadow-inner"
                style={{ backgroundColor: player.avatarColor }}
              >
                {player.name.substring(0, 2)}
              </div>

              {isTarget && (
                <div className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow">
                  <Sparkles className="w-3 h-3 fill-white" />
                </div>
              )}
            </div>

            {/* Player Name */}
            <span
              className={`mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow transition ${
                isTarget
                  ? 'bg-rose-600 text-white shadow-rose-900/50'
                  : 'bg-zinc-900/90 text-zinc-300 border border-zinc-800'
              }`}
            >
              {player.name}
            </span>
          </div>
        );
      })}

      {/* The 3D-Styled Spin Bottle */}
      <div
        onClick={handleSpin}
        style={{
          transform: `rotate(${currentAngle}deg)`,
          transition: isSpinning ? 'none' : 'transform 0.2s ease-out',
        }}
        className="relative z-20 cursor-pointer touch-none active:scale-95 transition-transform duration-100 flex items-center justify-center"
      >
        <svg
          width="90"
          height="190"
          viewBox="0 0 100 240"
          className="drop-shadow-[0_15px_25px_rgba(255,0,85,0.4)] filter"
        >
          <defs>
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3d031c" />
              <stop offset="30%" stop-color="#9e0c46" />
              <stop offset="50%" stop-color="#ff2a6d" />
              <stop offset="70%" stop-color="#700632" />
              <stop offset="100%" stop-color="#260111" />
            </linearGradient>

            <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
              <stop offset="50%" stop-color="#ffffff" stop-opacity="0.85" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
            </linearGradient>

            <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ffcc00" />
              <stop offset="50%" stop-color="#ffee66" />
              <stop offset="100%" stop-color="#cc9900" />
            </linearGradient>
          </defs>

          {/* Bottle Pointer / Cap (Points to Target Player) */}
          <rect x="42" y="10" width="16" height="18" rx="4" fill="url(#capGrad)" />
          <path d="M 50 2 L 44 10 L 56 10 Z" fill="#ff0055" />

          {/* Bottle Neck */}
          <rect x="44" y="28" width="12" height="48" rx="2" fill="url(#glassGrad)" />

          {/* Bottle Body */}
          <path
            d="M 44 76 
               C 35 90, 20 115, 20 145 
               L 20 215 
               C 20 228, 32 236, 50 236 
               C 68 236, 80 228, 80 215 
               L 80 145 
               C 80 115, 65 90, 56 76 
               Z"
            fill="url(#glassGrad)"
          />

          {/* 18+ Adult Heart Emblem on Bottle Label */}
          <rect x="28" y="130" width="44" height="48" rx="6" fill="#14020a" stroke="#ff2a6d" stroke-width="1.5" />
          <text x="50" y="152" textAnchor="middle" fill="#ff2a6d" fontSize="13" fontWeight="900" fontFamily="sans-serif">
            18+
          </text>
          <text x="50" y="168" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" letterSpacing="1" fontFamily="sans-serif">
            SPICY
          </text>

          {/* Glass Reflection highlights */}
          <path
            d="M 28 140 L 28 208 C 28 214, 34 218, 42 220"
            fill="none"
            stroke="url(#shineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Interactive Bottom Prompt or Action */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full flex flex-col items-center">
        <button
          id="spin-bottle-action-btn"
          disabled={isSpinning}
          onClick={handleSpin}
          className={`px-6 py-2.5 rounded-full font-black text-sm tracking-wide shadow-xl flex items-center gap-2 transition active:scale-95 ${
            isSpinning
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 text-white shadow-rose-900/60 hover:brightness-110 animate-pulse'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'SPINNING...' : 'TAP TO SPIN BOTTLE'}</span>
        </button>
      </div>
    </div>
  );
};
