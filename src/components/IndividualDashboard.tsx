import React from 'react';
import { Player, Prompt, PromptType, CoupleLevel, PlayEnvironment } from '../types';
import { SharedIntimacyStage } from './SharedIntimacyStage';
import { soundEngine } from '../utils/audio';
import {
  Flame,
  Sparkles,
  Heart,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  Award,
  Video,
  Smile,
  Dices,
} from 'lucide-react';

interface IndividualDashboardProps {
  myPlayer: Player;
  partnerPlayer: Player;
  isMyTurn: boolean;
  activeRole: 'male' | 'female';
  onChangeActiveRole: (role: 'male' | 'female') => void;
  onToggleDualView?: () => void;
  isDualView?: boolean;
  currentPrompt: Prompt | null;
  selectedType: PromptType | null;
  onSelectType: (type: PromptType) => void;
  onCompletePrompt: () => void;
  onForfeitPrompt: () => void;
  onRerollPrompt: () => void;
  onOpenTimer: () => void;
  activeLevel: CoupleLevel;
  onChangeLevel: (lvl: CoupleLevel) => void;
  activeEnvironment: PlayEnvironment;
  onChangeEnvironment: (env: PlayEnvironment) => void;
  onPassTurn: () => void;
  onSpinBottle?: () => void;
  onSendReaction: (emoji: string) => void;
  isOnlineActive?: boolean;
  onlineRoomCode?: string;
}

export const IndividualDashboard: React.FC<IndividualDashboardProps> = ({
  myPlayer,
  partnerPlayer,
  isMyTurn,
  activeRole,
  onChangeActiveRole,
  onToggleDualView,
  isDualView,
  currentPrompt,
  selectedType,
  onSelectType,
  onCompletePrompt,
  onForfeitPrompt,
  onRerollPrompt,
  onOpenTimer,
  activeLevel,
  onChangeLevel,
  activeEnvironment,
  onChangeEnvironment,
  onPassTurn,
  onSpinBottle,
  onSendReaction,
  isOnlineActive,
  onlineRoomCode,
}) => {
  const isMale = myPlayer.gender === 'male';

  // Chemistry rating calculation
  const totalTasks = myPlayer.truthsDone + myPlayer.daresDone;
  const chemistryPercent = Math.min(100, Math.round((myPlayer.score / 100) * 100));

  return (
    <div
      className={`w-full flex flex-col p-3 rounded-3xl transition-all ${
        isMale
          ? 'bg-gradient-to-b from-cyan-950/20 via-zinc-950 to-[#0c0c14] border border-cyan-900/30'
          : 'bg-gradient-to-b from-rose-950/20 via-zinc-950 to-[#0c0c14] border border-rose-900/30'
      }`}
    >
      {/* Top Individual Player Identity Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        {/* Left: Player Badge */}
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-zinc-700"
            style={{ backgroundColor: myPlayer.avatarColor }}
          >
            {myPlayer.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white">{myPlayer.name}</span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isMale ? 'bg-cyan-500/20 text-cyan-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {isMale ? '♂ Him' : '♀ Her'}
              </span>
            </div>
            <span className="text-[11px] font-bold text-zinc-400">
              {isMyTurn ? (
                <span className="text-rose-400 font-black">🎯 Your Turn</span>
              ) : (
                <span>Partner's Turn ({partnerPlayer.name})</span>
              )}
            </span>
          </div>
        </div>

        {/* Right: Dashboard Switcher (Him vs Her vs Dual) */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              onChangeActiveRole('male');
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition ${
              activeRole === 'male'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Switch view to Him"
          >
            ♂ Him
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              onChangeActiveRole('female');
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition ${
              activeRole === 'female'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Switch view to Her"
          >
            ♀ Her
          </button>

          {onToggleDualView && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                onToggleDualView();
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition ${
                isDualView
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Dual Screen Split View"
            >
              Dual
            </button>
          )}
        </div>
      </div>

      {/* Level and Environment Personal Selector */}
      <div className="w-full flex items-center justify-between gap-2 px-1 py-1 mb-3">
        <div className="flex items-center gap-1 p-0.5 bg-zinc-900/80 rounded-xl border border-zinc-800">
          {(['soft', 'medium', 'extreme'] as CoupleLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                soundEngine.playTap();
                onChangeLevel(lvl);
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition ${
                activeLevel === lvl
                  ? lvl === 'soft'
                    ? 'bg-emerald-600 text-white'
                    : lvl === 'medium'
                    ? 'bg-amber-600 text-white'
                    : 'bg-rose-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              onChangeEnvironment(
                activeEnvironment === 'video_call' ? 'direct_play' : 'video_call'
              );
            }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition ${
              activeEnvironment === 'video_call'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
            }`}
          >
            {activeEnvironment === 'video_call' ? (
              <>
                <Video className="w-3 h-3" />
                <span>Video Call</span>
              </>
            ) : (
              <>
                <Flame className="w-3 h-3 text-rose-500" />
                <span>Direct Play</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* THE STRICTLY SHARED STAGE (Camera + Dare/Truth Only) */}
      <div className="w-full my-1">
        <SharedIntimacyStage
          myPlayer={myPlayer}
          partnerPlayer={partnerPlayer}
          isMyTurn={isMyTurn}
          currentPrompt={currentPrompt}
          selectedType={selectedType}
          onSelectType={onSelectType}
          onCompletePrompt={onCompletePrompt}
          onForfeitPrompt={onForfeitPrompt}
          onRerollPrompt={onRerollPrompt}
          onOpenTimer={onOpenTimer}
          activeLevel={activeLevel}
          activeEnvironment={activeEnvironment}
          onSendReaction={onSendReaction}
          isOnlineActive={isOnlineActive}
        />
      </div>

      {/* INDIVIDUAL DASHBOARD PRIVATE SECTION (NOT SHARED TO PARTNER) */}
      <div className="w-full mt-4 pt-3 border-t border-zinc-800/80 space-y-3">
        {/* Quick Turn Controls Bar */}
        <div className="flex items-center justify-between gap-2">
          {onSpinBottle && (
            <button
              type="button"
              onClick={onSpinBottle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition"
            >
              <RotateCw className="w-3.5 h-3.5 text-rose-400" />
              <span>Spin Bottle</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPassTurn}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition ml-auto"
          >
            <span>Pass to {partnerPlayer.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* My Personal Scorecard & Chemistry Meter */}
        <div className="w-full p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Your Personal Score</span>
            </span>
            <span className="font-mono text-white text-sm font-black">{myPlayer.score} pts</span>
          </div>

          {/* Stats pills */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-1.5 rounded-xl bg-cyan-950/40 border border-cyan-900/40">
              <span className="text-cyan-400 font-bold block">Truths Done</span>
              <span className="text-white font-black text-xs">{myPlayer.truthsDone}</span>
            </div>
            <div className="p-1.5 rounded-xl bg-rose-950/40 border border-rose-900/40">
              <span className="text-rose-400 font-bold block">Dares Done</span>
              <span className="text-white font-black text-xs">{myPlayer.daresDone}</span>
            </div>
            <div className="p-1.5 rounded-xl bg-amber-950/40 border border-amber-900/40">
              <span className="text-amber-400 font-bold block">Forfeits</span>
              <span className="text-white font-black text-xs">{myPlayer.forfeitsDone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
