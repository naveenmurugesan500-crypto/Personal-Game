import React from 'react';
import { Player, Prompt, PromptType, CoupleLevel, PlayEnvironment } from '../types';
import { IndividualDashboard } from './IndividualDashboard';

interface DualSplitDashboardProps {
  player1: Player; // Usually Him
  player2: Player; // Usually Her
  activeTurnGender: 'male' | 'female';
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
  onCloseDualView: () => void;
  isOnlineActive?: boolean;
  onlineRoomCode?: string;
}

export const DualSplitDashboard: React.FC<DualSplitDashboardProps> = ({
  player1,
  player2,
  activeTurnGender,
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
  onCloseDualView,
  isOnlineActive,
  onlineRoomCode,
}) => {
  const himPlayer = player1.gender === 'male' ? player1 : player2;
  const herPlayer = player2.gender === 'female' ? player2 : player1;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col p-2">
      {/* Top Dual View Banner */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-purple-950/40 border border-purple-800/40 rounded-2xl mb-3 text-xs font-bold text-purple-300">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span>Dual Screen View Active — Both Him & Her Individual Dashboards</span>
        </span>
        <button
          type="button"
          onClick={onCloseDualView}
          className="px-3 py-1 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-white text-xs font-bold transition"
        >
          Single Screen
        </button>
      </div>

      {/* Side-by-side grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HIM'S DASHBOARD */}
        <div className="w-full">
          <IndividualDashboard
            myPlayer={himPlayer}
            partnerPlayer={herPlayer}
            isMyTurn={activeTurnGender === 'male'}
            activeRole="male"
            onChangeActiveRole={() => {}}
            onToggleDualView={onCloseDualView}
            isDualView={true}
            currentPrompt={currentPrompt}
            selectedType={selectedType}
            onSelectType={onSelectType}
            onCompletePrompt={onCompletePrompt}
            onForfeitPrompt={onForfeitPrompt}
            onRerollPrompt={onRerollPrompt}
            onOpenTimer={onOpenTimer}
            activeLevel={activeLevel}
            onChangeLevel={onChangeLevel}
            activeEnvironment={activeEnvironment}
            onChangeEnvironment={onChangeEnvironment}
            onPassTurn={onPassTurn}
            onSpinBottle={onSpinBottle}
            onSendReaction={onSendReaction}
            isOnlineActive={isOnlineActive}
            onlineRoomCode={onlineRoomCode}
          />
        </div>

        {/* HER'S DASHBOARD */}
        <div className="w-full">
          <IndividualDashboard
            myPlayer={herPlayer}
            partnerPlayer={himPlayer}
            isMyTurn={activeTurnGender === 'female'}
            activeRole="female"
            onChangeActiveRole={() => {}}
            onToggleDualView={onCloseDualView}
            isDualView={true}
            currentPrompt={currentPrompt}
            selectedType={selectedType}
            onSelectType={onSelectType}
            onCompletePrompt={onCompletePrompt}
            onForfeitPrompt={onForfeitPrompt}
            onRerollPrompt={onRerollPrompt}
            onOpenTimer={onOpenTimer}
            activeLevel={activeLevel}
            onChangeLevel={onChangeLevel}
            activeEnvironment={activeEnvironment}
            onChangeEnvironment={onChangeEnvironment}
            onPassTurn={onPassTurn}
            onSpinBottle={onSpinBottle}
            onSendReaction={onSendReaction}
            isOnlineActive={isOnlineActive}
            onlineRoomCode={onlineRoomCode}
          />
        </div>
      </div>
    </div>
  );
};
