import React, { useState, useEffect } from 'react';
import { Player, CoupleLevel, PlayEnvironment, OnlineRoomState } from '../types';
import { onlineSync } from '../utils/onlineSync';
import { soundEngine } from '../utils/audio';
import { webrtcManager } from '../utils/webrtc';
import {
  Wifi,
  Copy,
  Check,
  Heart,
  Share2,
  Video,
  Flame,
  UserCheck,
  Sparkles,
  X,
  LogOut,
  Smartphone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface OnlineLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOnlineGame: () => void;
  currentPlayers: Player[];
  activeLevel: CoupleLevel;
  activeEnvironment: PlayEnvironment;
  onChangeSettings: (level: CoupleLevel, env: PlayEnvironment) => void;
  onSetMyRole?: (role: 'male' | 'female') => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  isOpen,
  onClose,
  onStartOnlineGame,
  currentPlayers,
  activeLevel,
  activeEnvironment,
  onChangeSettings,
  onSetMyRole,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [hostName, setHostName] = useState<string>(currentPlayers[0]?.name || 'Him');
  const [hostGender, setHostGender] = useState<'male' | 'female'>(
    (currentPlayers[0]?.gender as 'male' | 'female') || 'male'
  );

  const [joinCode, setJoinCode] = useState<string>('');
  const [guestName, setGuestName] = useState<string>(currentPlayers[1]?.name || 'Her');
  const [guestGender, setGuestGender] = useState<'male' | 'female'>(
    (currentPlayers[1]?.gender as 'male' | 'female') || 'female'
  );

  const [selectedLevel, setSelectedLevel] = useState<CoupleLevel>(activeLevel);
  const [selectedEnv, setSelectedEnv] = useState<PlayEnvironment>(activeEnvironment);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [roomState, setRoomState] = useState<OnlineRoomState | null>(onlineSync.currentRoom);

  useEffect(() => {
    const unsub = onlineSync.onRoomUpdate((updated) => {
      setRoomState({ ...updated });
    });
    return () => {
      unsub();
    };
  }, []);

  // Check URL param for ?room=CODE auto-fill
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setJoinCode(roomParam.toUpperCase());
        setTab('join');
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleCreateRoom = async () => {
    soundEngine.playTap();
    setIsLoading(true);
    setErrorMessage('');
    const res = await onlineSync.createRoom({
      hostName,
      hostGender,
      level: selectedLevel,
      environment: selectedEnv,
    });
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create room');
      soundEngine.playForfeit();
    } else {
      soundEngine.playSuccess();
      soundEngine.vibrateSuccess();
      onChangeSettings(selectedLevel, selectedEnv);
      if (onSetMyRole) onSetMyRole(hostGender);
      webrtcManager.initCall(true);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      setErrorMessage('Please enter the 6-character room code from your partner.');
      return;
    }
    soundEngine.playTap();
    setIsLoading(true);
    setErrorMessage('');
    const res = await onlineSync.joinRoom({
      roomCode: joinCode.trim().toUpperCase(),
      playerName: guestName,
      playerGender: guestGender,
    });
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to join room');
      soundEngine.playForfeit();
    } else {
      soundEngine.playSuccess();
      soundEngine.vibrateSuccess();
      if (onSetMyRole) onSetMyRole(guestGender);
      webrtcManager.initCall(false);
      if (res.player) {
        // joined successfully
      }
    }
  };

  const copyRoomCode = () => {
    if (!roomState?.roomCode) return;
    navigator.clipboard.writeText(roomState.roomCode);
    setCopiedCode(true);
    soundEngine.playTap();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInviteLink = () => {
    if (!roomState?.roomCode) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomState.roomCode}`;
    const text = `Hey baby, let's play Truth or Dare together! Join our private room code: ${roomState.roomCode} or click here: ${url}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    soundEngine.playTap();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLeaveRoom = () => {
    soundEngine.playTap();
    onlineSync.leaveRoom();
    setRoomState(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Play Online Together</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-bold">
                  Live Sync
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">Connect two devices across any distance</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If already in active room */}
        {roomState ? (
          <div className="space-y-4">
            {/* Room Code Badge */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-rose-950/30 border border-rose-800/40 text-center relative overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                Your Private Couple Room Code
              </span>
              <div className="flex items-center justify-center gap-3 my-2">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 tracking-widest font-mono">
                  {roomState.roomCode}
                </span>
                <button
                  type="button"
                  onClick={copyRoomCode}
                  className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-white transition active:scale-95 flex items-center gap-1 text-xs font-bold"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Share Invite Button */}
              <button
                type="button"
                onClick={copyInviteLink}
                className="w-full py-2 px-3 rounded-xl bg-rose-950/50 border border-rose-700/40 text-rose-300 hover:text-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Invite Copied to Clipboard!' : 'Copy Invite Link / Friend Request'}</span>
              </button>
            </div>

            {/* Connected Partners Status */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block">
                Partner Connection Status
              </span>

              {/* Male Partner */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-xs">
                    ♂
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {roomState.malePlayer?.name || 'Him (Partner 1)'}
                    </span>
                    <span className="text-[10px] text-zinc-400">Male Prompts</span>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    roomState.malePlayer
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                >
                  {roomState.malePlayer ? '● Connected' : 'Waiting...'}
                </span>
              </div>

              {/* Female Partner */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-950 border border-pink-500/50 flex items-center justify-center text-pink-300 font-bold text-xs">
                    ♀
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {roomState.femalePlayer?.name || 'Her (Partner 2)'}
                    </span>
                    <span className="text-[10px] text-zinc-400">Female Prompts</span>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    roomState.femalePlayer
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                >
                  {roomState.femalePlayer ? '● Connected' : 'Waiting...'}
                </span>
              </div>
            </div>

            {/* Room Settings (Level & Environment) */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block">
                Session Intensity & Play Mode
              </span>

              {/* Level selection */}
              <div className="grid grid-cols-3 gap-1.5">
                {(['soft', 'medium', 'extreme'] as CoupleLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      soundEngine.playTap();
                      onlineSync.changeSettings(lvl, roomState.currentEnvironment);
                      onChangeSettings(lvl, roomState.currentEnvironment);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-black capitalize transition border ${
                      roomState.currentLevel === lvl
                        ? 'bg-rose-600 border-rose-400 text-white shadow-md shadow-rose-900/40'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Environment selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    onlineSync.changeSettings(roomState.currentLevel, 'video_call');
                    onChangeSettings(roomState.currentLevel, 'video_call');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    roomState.currentEnvironment === 'video_call'
                      ? 'bg-purple-950 border-purple-500 text-purple-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    onlineSync.changeSettings(roomState.currentLevel, 'direct_play');
                    onChangeSettings(roomState.currentLevel, 'direct_play');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    roomState.currentEnvironment === 'direct_play'
                      ? 'bg-rose-950 border-rose-500 text-rose-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Direct Play</span>
                </button>
              </div>
            </div>

            {/* Launch Game button */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleLeaveRoom}
                className="py-3 px-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 text-xs font-bold transition flex items-center gap-1"
                title="Disconnect room"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playSuccess();
                  soundEngine.vibrateSuccess();
                  onStartOnlineGame();
                  onClose();
                }}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white font-black text-sm shadow-xl shadow-rose-950/60 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 fill-white" />
                <span>Enter Synchronized Game</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Create / Join Tabs */
          <div className="space-y-4">
            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTap();
                  setTab('create');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  tab === 'create'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Create Room
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTap();
                  setTab('join');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  tab === 'join'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Join with Code
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            {tab === 'create' ? (
              <div className="space-y-4">
                {/* Your Role */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Your Profile & Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setHostGender('male')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition border flex items-center justify-center gap-2 ${
                        hostGender === 'male'
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span>♂ Male (Him)</span>
                      {hostGender === 'male' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setHostGender('female')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition border flex items-center justify-center gap-2 ${
                        hostGender === 'female'
                          ? 'bg-pink-950 border-pink-500 text-pink-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span>♀ Female (Her)</span>
                      {hostGender === 'female' && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Your name or nickname..."
                    maxLength={16}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold text-xs focus:outline-none focus:border-rose-500 transition"
                  />
                </div>

                {/* Level Selection */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Select Starting Level
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['soft', 'medium', 'extreme'] as CoupleLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSelectedLevel(lvl)}
                        className={`py-2 px-1 rounded-xl text-xs font-black capitalize transition border ${
                          selectedLevel === lvl
                            ? 'bg-rose-600 border-rose-400 text-white shadow-md'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Environment Selection */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Play Mode (Dares Type)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEnv('video_call')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                        selectedEnv === 'video_call'
                          ? 'bg-purple-950 border-purple-500 text-purple-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Video Call</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEnv('direct_play')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                        selectedEnv === 'direct_play'
                          ? 'bg-rose-950 border-rose-500 text-rose-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Direct Play</span>
                    </button>
                  </div>
                </div>

                {/* Create Button */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleCreateRoom}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-sm shadow-xl shadow-rose-950/60 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Wifi className="w-4 h-4" />
                  <span>{isLoading ? 'Creating Room...' : 'Create Room & Get Code'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Room Code Input */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Partner's 6-Character Room Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. LUV99X"
                    maxLength={8}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-xl font-mono font-black text-rose-400 tracking-widest uppercase focus:outline-none focus:border-rose-500 transition"
                  />
                </div>

                {/* Guest Profile */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Your Profile & Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setGuestGender('female')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition border flex items-center justify-center gap-2 ${
                        guestGender === 'female'
                          ? 'bg-pink-950 border-pink-500 text-pink-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span>♀ Female (Her)</span>
                      {guestGender === 'female' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuestGender('male')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition border flex items-center justify-center gap-2 ${
                        guestGender === 'male'
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span>♂ Male (Him)</span>
                      {guestGender === 'male' && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your name or nickname..."
                    maxLength={16}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold text-xs focus:outline-none focus:border-rose-500 transition"
                  />
                </div>

                {/* Join Button */}
                <button
                  type="button"
                  disabled={isLoading || !joinCode.trim()}
                  onClick={handleJoinRoom}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-sm shadow-xl shadow-rose-950/60 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Wifi className="w-4 h-4" />
                  <span>{isLoading ? 'Connecting...' : 'Join Partner Room'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Security & Offline Notice */}
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            End-to-end encrypted private session
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white underline font-bold"
          >
            Play Offline instead
          </button>
        </div>
      </div>
    </div>
  );
};
