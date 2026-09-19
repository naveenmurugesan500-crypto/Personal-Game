/**
 * Truth or Dare: 18+ Adult Edition (Couples Special)
 * Features:
 * - 18+ Age Gate & Male/Female Partner Confirmation
 * - Separated Male & Female Decks (Soft / Medium / Extreme)
 * - Video Call & Direct Play Modes
 * - Online Multiplayer (Room Code / Friend Request / Real-time Sync) & Offline Mode
 * - Front-Camera Viewfinder for Video Call Dares
 * - Spin-the-Bottle & Turn-by-Turn Modes
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Player,
  GameMode,
  Prompt,
  PromptType,
  PlayStyle,
  AppScreen,
  CoupleLevel,
  PlayEnvironment,
  OnlineRoomState,
} from './types';
import { DEFAULT_PLAYERS, DEFAULT_PROMPTS, getPromptsForCouple } from './data/prompts';
import { soundEngine } from './utils/audio';
import { onlineSync } from './utils/onlineSync';

import { AndroidHeader } from './components/AndroidHeader';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { BottleSpinner } from './components/BottleSpinner';
import { CardDeck } from './components/CardDeck';
import { DareTimer } from './components/DareTimer';
import { ForfeitModal } from './components/ForfeitModal';
import { PlayerSetup } from './components/PlayerSetup';
import { ModeSelector } from './components/ModeSelector';
import { CustomPromptModal } from './components/CustomPromptModal';
import { ScoreboardModal } from './components/ScoreboardModal';
import { RulesModal } from './components/RulesModal';
import { AgeGateModal } from './components/AgeGateModal';
import { GenderConfirmationModal } from './components/GenderConfirmationModal';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { VideoCallCamModal } from './components/VideoCallCamModal';

import {
  Sparkles,
  RotateCw,
  Flame,
  ArrowRight,
  Dices,
  Video,
  Wifi,
  Heart,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';

export default function App() {
  // 18+ Age verification gate
  const [hasAgeVerified, setHasAgeVerified] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tod_adult_verified') === 'true';
    }
    return false;
  });

  // Couples gender confirmation state (male / female setup)
  const [hasGenderConfirmed, setHasGenderConfirmed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tod_couple_confirmed') === 'true';
    }
    return false;
  });
  const [showGenderModal, setShowGenderModal] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('play');

  // Couples Specific Intensity Level & Environment
  const [coupleLevel, setCoupleLevel] = useState<CoupleLevel>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('tod_couple_level') as CoupleLevel) || 'soft';
    }
    return 'soft';
  });

  const [playEnvironment, setPlayEnvironment] = useState<PlayEnvironment>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('tod_play_env') as PlayEnvironment) || 'direct_play';
    }
    return 'direct_play';
  });

  // Players State (Defaults to Male Partner 1 & Female Partner 2)
  const [players, setPlayers] = useState<Player[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tod_players');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_PLAYERS;
  });

  // Active Player Index (0 = Him, 1 = Her)
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);

  // General Mode & Preferences
  const [currentMode, setCurrentMode] = useState<GameMode>('spicy');
  const [playStyle, setPlayStyle] = useState<PlayStyle>('turn');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // Gameplay State
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedType, setSelectedType] = useState<PromptType | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [usedPromptIds, setUsedPromptIds] = useState<string[]>([]);
  const [customPrompts, setCustomPrompts] = useState<Prompt[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tod_custom_prompts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [];
  });

  // Modals & Floating Features
  const [showTimer, setShowTimer] = useState(false);
  const [showForfeit, setShowForfeit] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showOnlineLobby, setShowOnlineLobby] = useState(false);
  const [showVideoCam, setShowVideoCam] = useState(false);

  // Online Multiplayer State
  const [onlineRoom, setOnlineRoom] = useState<OnlineRoomState | null>(null);
  const [floatingReaction, setFloatingReaction] = useState<{ emoji: string; sender: string } | null>(null);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('tod_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('tod_custom_prompts', JSON.stringify(customPrompts));
  }, [customPrompts]);

  useEffect(() => {
    localStorage.setItem('tod_couple_level', coupleLevel);
  }, [coupleLevel]);

  useEffect(() => {
    localStorage.setItem('tod_play_env', playEnvironment);
  }, [playEnvironment]);

  // Subscribe to Online State Sync
  useEffect(() => {
    const unsubRoom = onlineSync.onRoomUpdate((room) => {
      setOnlineRoom({ ...room });
      if (room.currentLevel) {
        setCoupleLevel(room.currentLevel);
      }
      if (room.currentEnvironment) {
        setPlayEnvironment(room.currentEnvironment);
      }

      // Sync active player by turn gender
      if (room.currentTurnGender) {
        const pIdx = players.findIndex((p) => p.gender === room.currentTurnGender);
        if (pIdx !== -1) {
          setActivePlayerIndex(pIdx);
        }
      }

      // Sync card if drawn online
      if (room.currentCard && room.currentCard.prompt) {
        setCurrentPrompt(room.currentCard.prompt);
        setSelectedType(room.currentCard.prompt.type);
      } else if (!room.currentCard) {
        // Reset card
        setCurrentPrompt(null);
        setSelectedType(null);
      }
    });

    const unsubReaction = onlineSync.onReaction((emoji, senderName) => {
      setFloatingReaction({ emoji, sender: senderName });
      soundEngine.playSuccess();
      setTimeout(() => setFloatingReaction(null), 3000);
    });

    return () => {
      unsubRoom();
      unsubReaction();
    };
  }, [players]);

  // Active player safe reference
  const activePlayer = players[activePlayerIndex] || players[0] || DEFAULT_PLAYERS[0];
  const partnerPlayer = players[activePlayerIndex === 0 ? 1 : 0] || players[1] || DEFAULT_PLAYERS[1];

  // Draw a gender-aware, couple-level-aware prompt
  const drawPrompt = useCallback(
    (type: PromptType): Prompt => {
      const targetGender = (activePlayer.gender as 'male' | 'female') || 'male';

      // First check curated adult couples prompts matching level, env & gender
      const couplePrompts = getPromptsForCouple({
        allPrompts: DEFAULT_PROMPTS,
        targetGender,
        level: coupleLevel,
        environment: playEnvironment,
        promptType: type,
      });

      // Also include any user-created custom prompts matching type
      const customMatching = customPrompts.filter((p) => p.type === type);
      const combinedPool = [...couplePrompts, ...customMatching];

      // Exclude recently used
      const unused = combinedPool.filter((p) => !usedPromptIds.includes(p.id));
      const pool = unused.length > 0 ? unused : combinedPool;

      if (pool.length === 0) {
        // Fallback to default prompts
        const defaultPool = DEFAULT_PROMPTS.filter((p) => p.type === type);
        return defaultPool[Math.floor(Math.random() * defaultPool.length)] || DEFAULT_PROMPTS[0];
      }

      const chosen = pool[Math.floor(Math.random() * pool.length)];
      setUsedPromptIds((prev) => [...prev.slice(-40), chosen.id]);
      return chosen;
    },
    [activePlayer.gender, coupleLevel, playEnvironment, customPrompts, usedPromptIds]
  );

  // Handle Type Select (Truth or Dare card click)
  const handleSelectType = (type: PromptType) => {
    setSelectedType(type);
    const prompt = drawPrompt(type);
    setCurrentPrompt(prompt);

    if (onlineRoom?.roomCode) {
      onlineSync.drawCard(prompt, (activePlayer.gender as 'male' | 'female') || 'male');
    }
  };

  // Handle Reroll / Swap Prompt
  const handleRerollPrompt = () => {
    if (!selectedType) return;
    const newPrompt = drawPrompt(selectedType);
    setCurrentPrompt(newPrompt);

    if (onlineRoom?.roomCode) {
      onlineSync.drawCard(newPrompt, (activePlayer.gender as 'male' | 'female') || 'male');
    }
  };

  // Complete Prompt (+10 points to active player)
  const handleCompletePrompt = () => {
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx === activePlayerIndex) {
          return {
            ...p,
            score: p.score + 10,
            truthsDone: selectedType === 'truth' ? p.truthsDone + 1 : p.truthsDone,
            daresDone: selectedType === 'dare' ? p.daresDone + 1 : p.daresDone,
          };
        }
        return p;
      })
    );

    if (onlineRoom?.roomCode) {
      onlineSync.completeCard();
      onlineSync.nextTurn();
    }

    setSelectedType(null);
    setCurrentPrompt(null);

    // If in turn mode, advance turn
    setActivePlayerIndex((prev) => (prev + 1) % players.length);
  };

  // Forfeit Prompt (Player refused or chickened out)
  const handleForfeitPrompt = () => {
    setShowForfeit(true);
  };

  // Accept Penalty from Forfeit Modal
  const handleAcceptPenalty = () => {
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx === activePlayerIndex) {
          return {
            ...p,
            forfeitsDone: p.forfeitsDone + 1,
          };
        }
        return p;
      })
    );

    if (onlineRoom?.roomCode) {
      onlineSync.forfeitCard();
      onlineSync.nextTurn();
    }

    setShowForfeit(false);
    setSelectedType(null);
    setCurrentPrompt(null);
    setActivePlayerIndex((prev) => (prev + 1) % players.length);
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    soundEngine.soundEnabled = newVal;
  };

  // Toggle Vibration
  const handleToggleVibration = () => {
    const newVal = !vibrationEnabled;
    setVibrationEnabled(newVal);
    soundEngine.vibrationEnabled = newVal;
  };

  // Advance to next player manually
  const handleNextPlayer = () => {
    soundEngine.playTap();
    soundEngine.vibrateTap();
    setSelectedType(null);
    setCurrentPrompt(null);
    const nextIdx = (activePlayerIndex + 1) % players.length;
    setActivePlayerIndex(nextIdx);

    if (onlineRoom?.roomCode) {
      onlineSync.nextTurn();
    }
  };

  // Reset Scores
  const handleResetScores = () => {
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        score: 0,
        truthsDone: 0,
        daresDone: 0,
        forfeitsDone: 0,
      }))
    );
  };

  // Add custom prompt
  const handleAddCustomPrompt = (p: Prompt) => {
    setCustomPrompts((prev) => [p, ...prev]);
  };

  // Add multiple prompts (e.g. from AI)
  const handleAddMultiplePrompts = (newPrompts: Prompt[]) => {
    setCustomPrompts((prev) => [...newPrompts, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0c0c14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-rose-600 selection:text-white pb-20 relative overflow-x-hidden">
      {/* 18+ Verification Gate */}
      {!hasAgeVerified && <AgeGateModal onConfirm={() => setHasAgeVerified(true)} />}

      {/* Step 2: Couples Gender Confirmation (Male / Female) */}
      {hasAgeVerified && (!hasGenderConfirmed || showGenderModal) && (
        <GenderConfirmationModal
          initialPartner1={players[0]}
          initialPartner2={players[1]}
          onConfirm={(partner1, partner2) => {
            setPlayers([partner1, partner2]);
            setHasGenderConfirmed(true);
            setShowGenderModal(false);
          }}
        />
      )}

      {/* Android Top Header */}
      <AndroidHeader
        currentMode={currentMode}
        onSelectModeClick={() => setCurrentScreen('modes')}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        vibrationEnabled={vibrationEnabled}
        onToggleVibration={handleToggleVibration}
        onOpenRules={() => setShowRules(true)}
        isOnlineActive={!!onlineRoom?.roomCode}
        onlineRoomCode={onlineRoom?.roomCode}
        onOpenOnlineLobby={() => setShowOnlineLobby(true)}
      />

      {/* Floating Reaction Animation */}
      {floatingReaction && (
        <div className="fixed bottom-32 inset-x-0 z-50 flex flex-col items-center pointer-events-none animate-bounce">
          <div className="p-3 rounded-2xl bg-zinc-950/90 border border-rose-500/60 shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <span className="text-3xl">{floatingReaction.emoji}</span>
            <span className="text-xs font-bold text-rose-300">
              {floatingReaction.sender} reacted!
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col">
        {/* SCREEN 1: PLAY GAME ARENA */}
        {currentScreen === 'play' && (
          <div className="flex-1 flex flex-col items-center justify-between p-3">
            {/* Quick Couple Level & Mode Switcher Bar */}
            <div className="w-full flex items-center justify-between gap-2 px-1 py-1.5 mb-2">
              {/* Level Selector Pills */}
              <div className="flex items-center gap-1 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800">
                {(['soft', 'medium', 'extreme'] as CoupleLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      soundEngine.playTap();
                      setCoupleLevel(lvl);
                      if (onlineRoom?.roomCode) {
                        onlineSync.changeSettings(lvl, playEnvironment);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black capitalize transition ${
                      coupleLevel === lvl
                        ? lvl === 'soft'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : lvl === 'medium'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-rose-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Video Call vs Direct Play Switcher */}
              <div className="flex items-center gap-1 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    setPlayEnvironment('direct_play');
                    if (onlineRoom?.roomCode) {
                      onlineSync.changeSettings(coupleLevel, 'direct_play');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition ${
                    playEnvironment === 'direct_play'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Direct In-Person Play"
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Direct</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    setPlayEnvironment('video_call');
                    setShowVideoCam(true);
                    if (onlineRoom?.roomCode) {
                      onlineSync.changeSettings(coupleLevel, 'video_call');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition ${
                    playEnvironment === 'video_call'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Video Call Mode"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Video</span>
                </button>
              </div>
            </div>

            {/* Play Style Segmented Switcher (Bottle vs Turn) */}
            <div className="flex items-center gap-1 p-1 bg-zinc-900/80 rounded-full border border-zinc-800 shadow-sm my-1">
              <button
                id="play-style-turn-btn"
                onClick={() => {
                  soundEngine.playTap();
                  setPlayStyle('turn');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold transition ${
                  playStyle === 'turn'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Turn-by-Turn</span>
              </button>

              <button
                id="play-style-bottle-btn"
                onClick={() => {
                  soundEngine.playTap();
                  setPlayStyle('bottle');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold transition ${
                  playStyle === 'bottle'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Spin Bottle</span>
              </button>
            </div>

            {/* If In Bottle Spin Mode: Show 3D Bottle Spinner */}
            {playStyle === 'bottle' && !selectedType && (
              <div className="w-full flex-1 flex flex-col items-center justify-center my-2">
                <BottleSpinner
                  players={players}
                  activePlayerIndex={activePlayerIndex}
                  onPlayerSelected={(idx) => {
                    setActivePlayerIndex(idx);
                  }}
                  isSpinning={isSpinning}
                  setIsSpinning={setIsSpinning}
                />
              </div>
            )}

            {/* If In Turn Mode and Card Not Yet Chosen: Show Next Turn Card Banner */}
            {playStyle === 'turn' && !selectedType && (
              <div className="w-full flex-1 flex flex-col items-center justify-center text-center px-4 my-3">
                <div className="relative mb-3">
                  <div
                    className="w-20 h-20 rounded-full p-1 shadow-2xl shadow-rose-900/40 ring-4 ring-rose-500/40 mx-auto flex items-center justify-center"
                    style={{ backgroundColor: `${activePlayer.avatarColor}25` }}
                  >
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-white text-xl font-black uppercase shadow-inner"
                      style={{ backgroundColor: activePlayer.avatarColor }}
                    >
                      {activePlayer.name.substring(0, 2)}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase shadow">
                    {activePlayer.gender === 'male' ? '♂ Him' : '♀ Her'}
                  </div>
                </div>

                <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Ready for intimacy challenge
                </span>
                <h2 className="text-xl font-black text-white tracking-tight mt-1 mb-1">
                  {activePlayer.name}
                </h2>
                <p className="text-xs text-zinc-400 max-w-xs mb-3">
                  Pick Truth for spicy secrets or Dare for romantic and physical challenges!
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNextPlayer}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>Pass Turn</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TRUTH OR DARE CARD DECK */}
            <div className="w-full">
              <CardDeck
                activePlayer={activePlayer}
                currentPrompt={currentPrompt}
                selectedType={selectedType}
                onSelectType={handleSelectType}
                onCompletePrompt={handleCompletePrompt}
                onForfeitPrompt={handleForfeitPrompt}
                onRerollPrompt={handleRerollPrompt}
                onOpenTimer={() => setShowTimer(true)}
                activeLevel={coupleLevel}
                activeEnvironment={playEnvironment}
                onToggleCam={() => setShowVideoCam((prev) => !prev)}
                isCamActive={showVideoCam}
              />
            </div>
          </div>
        )}

        {/* SCREEN 2: PLAYERS MANAGEMENT */}
        {currentScreen === 'players' && (
          <PlayerSetup
            players={players}
            onUpdatePlayers={setPlayers}
            onStartGame={() => setCurrentScreen('play')}
            onOpenGenderModal={() => setShowGenderModal(true)}
          />
        )}

        {/* SCREEN 3: GAME MODES */}
        {currentScreen === 'modes' && (
          <ModeSelector
            currentMode={currentMode}
            onSelectMode={(mode) => {
              setCurrentMode(mode);
              setCurrentScreen('play');
            }}
            onBack={() => setCurrentScreen('play')}
          />
        )}

        {/* SCREEN 4: CUSTOM PROMPTS & AI SPICE */}
        {currentScreen === 'custom_prompts' && (
          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white">Custom Cards</h2>
              <button
                onClick={() => setShowCustomModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Add / AI Create</span>
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              All custom truths and dares created by you or generated via AI spice are saved here.
            </p>

            {customPrompts.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-3xl bg-zinc-900/40 border border-zinc-800/80">
                <Flame className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-zinc-300 mb-1">No Custom Prompts Yet</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-4">
                  Write secret partner dares or tap "Add / AI Create" to auto-generate personalized spicy prompts!
                </p>
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Create Custom Cards
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {customPrompts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            p.type === 'truth'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {p.type}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500">
                          {p.intensity === 3 ? '🔥🔥🔥 Extreme' : p.intensity === 2 ? '🔥🔥 Medium' : '🔥 Soft'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-white">"{p.text}"</p>
                    </div>

                    <button
                      onClick={() =>
                        setCustomPrompts((prev) => prev.filter((item) => item.id !== p.id))
                      }
                      className="text-zinc-600 hover:text-red-400 text-xs p-1"
                      title="Delete prompt"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCREEN 5: SCOREBOARD / STATS */}
        {currentScreen === 'stats' && (
          <div className="p-4 flex-1">
            <ScoreboardModal
              players={players}
              onResetScores={handleResetScores}
              onClose={() => setCurrentScreen('play')}
            />
          </div>
        )}
      </main>

      {/* Android Bottom Navigation */}
      <AndroidBottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />

      {/* Modals */}
      {showTimer && <DareTimer onClose={() => setShowTimer(false)} />}
      {showForfeit && (
        <ForfeitModal player={activePlayer} onAcceptPenalty={handleAcceptPenalty} />
      )}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showCustomModal && (
        <CustomPromptModal
          currentMode={currentMode}
          players={players}
          onAddCustomPrompt={handleAddCustomPrompt}
          onAddMultiplePrompts={handleAddMultiplePrompts}
          onClose={() => setShowCustomModal(false)}
        />
      )}
      {showScoreboard && (
        <ScoreboardModal
          players={players}
          onResetScores={handleResetScores}
          onClose={() => setShowScoreboard(false)}
        />
      )}

      {/* Online Multiplayer Lobby Modal */}
      <OnlineLobbyModal
        isOpen={showOnlineLobby}
        onClose={() => setShowOnlineLobby(false)}
        onStartOnlineGame={() => {
          setShowOnlineLobby(false);
          setCurrentScreen('play');
        }}
        currentPlayers={players}
        activeLevel={coupleLevel}
        activeEnvironment={playEnvironment}
        onChangeSettings={(lvl, env) => {
          setCoupleLevel(lvl);
          setPlayEnvironment(env);
        }}
      />

      {/* Video Call Cam Viewfinder Modal */}
      <VideoCallCamModal
        isOpen={showVideoCam}
        onClose={() => setShowVideoCam(false)}
        partnerName={partnerPlayer.name}
        onSendReaction={(emoji) => {
          if (onlineRoom?.roomCode) {
            onlineSync.sendReaction(emoji, activePlayer.name);
          }
        }}
      />
    </div>
  );
}
