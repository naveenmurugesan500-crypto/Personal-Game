export type GameMode = 'soft' | 'medium' | 'extreme' | 'couples' | 'flirty' | 'spicy' | 'wild';

export type CoupleLevel = 'soft' | 'medium' | 'extreme';
export type PlayEnvironment = 'direct_play' | 'video_call';
export type TargetGender = 'male' | 'female' | 'both';

export type PromptType = 'truth' | 'dare';

export interface Prompt {
  id: string;
  text: string;
  type: PromptType;
  category: GameMode;
  intensity: 1 | 2 | 3; // 1 = soft, 2 = medium, 3 = extreme
  targetGender?: TargetGender;
  environment?: PlayEnvironment | 'both';
  coupleLevel?: CoupleLevel;
  forCouplesOnly?: boolean;
  isCustom?: boolean;
}

export interface Player {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'nonbinary' | 'other';
  avatarColor: string;
  score: number;
  truthsDone: number;
  daresDone: number;
  forfeitsDone: number;
  isOnline?: boolean;
}

export interface Penalty {
  id: string;
  text: string;
  severity: 'mild' | 'spicy' | 'wild';
}

export type PlayStyle = 'bottle' | 'turn';

export interface GameSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  timerDuration: number; // in seconds
  playStyle: PlayStyle;
  penaltiesEnabled: boolean;
  currentMode: GameMode;
  coupleLevel: CoupleLevel;
  playEnvironment: PlayEnvironment;
}

export interface OnlineChatMessage {
  id: string;
  senderName: string;
  senderGender: 'male' | 'female' | 'other';
  text: string;
  timestamp: number;
}

export interface OnlineRoomState {
  roomCode: string;
  hostId: string;
  malePlayer: Player | null;
  femalePlayer: Player | null;
  currentTurnGender: 'male' | 'female';
  currentLevel: CoupleLevel;
  currentEnvironment: PlayEnvironment;
  currentCard: {
    prompt: Prompt;
    targetGender: 'male' | 'female';
    drawnAt: number;
    status: 'idle' | 'revealed' | 'completed' | 'forfeited';
  } | null;
  messages: OnlineChatMessage[];
  status: 'waiting' | 'connected' | 'playing';
  lastUpdated: number;
}

export type AppScreen =
  | 'home'
  | 'players'
  | 'modes'
  | 'play'
  | 'online_lobby'
  | 'custom_prompts'
  | 'penalties'
  | 'stats';

