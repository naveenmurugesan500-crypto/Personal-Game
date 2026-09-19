import { OnlineRoomState, Player, CoupleLevel, PlayEnvironment, Prompt } from '../types';

type RoomUpdateListener = (room: OnlineRoomState) => void;
type ReactionListener = (emoji: string, senderName: string) => void;

class OnlineSyncService {
  private ws: WebSocket | null = null;
  private roomCode: string = '';
  private playerId: string = '';
  private roomUpdateListeners: Set<RoomUpdateListener> = new Set();
  private reactionListeners: Set<ReactionListener> = new Set();
  private reconnectTimer: any = null;
  private currentRoomState: OnlineRoomState | null = null;

  public get currentRoom(): OnlineRoomState | null {
    return this.currentRoomState;
  }

  public get activeRoomCode(): string {
    return this.roomCode;
  }

  public get activePlayerId(): string {
    return this.playerId;
  }

  public onRoomUpdate(listener: RoomUpdateListener) {
    this.roomUpdateListeners.add(listener);
    if (this.currentRoomState) {
      listener(this.currentRoomState);
    }
    return () => this.roomUpdateListeners.delete(listener);
  }

  public onReaction(listener: ReactionListener) {
    this.reactionListeners.add(listener);
    return () => this.reactionListeners.delete(listener);
  }

  private notifyRoomUpdate(room: OnlineRoomState) {
    this.currentRoomState = room;
    for (const listener of this.roomUpdateListeners) {
      listener(room);
    }
  }

  private notifyReaction(emoji: string, senderName: string) {
    for (const listener of this.reactionListeners) {
      listener(emoji, senderName);
    }
  }

  public async createRoom(params: {
    hostName: string;
    hostGender: 'male' | 'female';
    level: CoupleLevel;
    environment: PlayEnvironment;
  }): Promise<{ success: boolean; roomCode?: string; player?: Player; error?: string }> {
    try {
      const res = await fetch('/api/online/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        this.roomCode = data.roomCode;
        this.playerId = data.player.id;
        this.currentRoomState = data.room;
        this.notifyRoomUpdate(data.room);
        this.connectWebSocket();
        return { success: true, roomCode: data.roomCode, player: data.player };
      }
      return { success: false, error: data.error || 'Failed to create room' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  }

  public async joinRoom(params: {
    roomCode: string;
    playerName: string;
    playerGender: 'male' | 'female';
  }): Promise<{ success: boolean; roomCode?: string; player?: Player; error?: string }> {
    try {
      const res = await fetch('/api/online/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        this.roomCode = data.roomCode;
        this.playerId = data.player.id;
        this.currentRoomState = data.room;
        this.notifyRoomUpdate(data.room);
        this.connectWebSocket();
        return { success: true, roomCode: data.roomCode, player: data.player };
      }
      return { success: false, error: data.error || 'Failed to join room' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  }

  public connectWebSocket() {
    if (!this.roomCode || typeof window === 'undefined') return;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?roomCode=${encodeURIComponent(
      this.roomCode
    )}&playerId=${encodeURIComponent(this.playerId)}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.sendWsMessage({
          type: 'JOIN_ROOM',
          roomCode: this.roomCode,
          playerId: this.playerId,
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'INIT_SYNC' || msg.type === 'ROOM_UPDATE') {
            if (msg.room) {
              this.notifyRoomUpdate(msg.room);
            }
          } else if (msg.type === 'CHAT_MESSAGE') {
            if (msg.room) {
              this.notifyRoomUpdate(msg.room);
            }
          } else if (msg.type === 'REACTION') {
            this.notifyReaction(msg.emoji, msg.senderName);
          }
        } catch (err) {
          console.error('Failed to parse WS msg:', err);
        }
      };

      this.ws.onclose = () => {
        if (this.roomCode) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            this.connectWebSocket();
          }, 3000);
        }
      };
    } catch (err) {
      console.error('WS Connection error:', err);
    }
  }

  private sendWsMessage(msg: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }

  public async drawCard(prompt: Prompt, targetGender: 'male' | 'female') {
    const sent = this.sendWsMessage({
      type: 'DRAW_CARD',
      roomCode: this.roomCode,
      prompt,
      targetGender,
    });
    if (!sent) {
      await fetch('/api/online/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: this.roomCode,
          action: 'DRAW_CARD',
          payload: { prompt, targetGender },
        }),
      });
    }
  }

  public async completeCard() {
    const sent = this.sendWsMessage({
      type: 'COMPLETE_CARD',
      roomCode: this.roomCode,
    });
    if (!sent) {
      await fetch('/api/online/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: this.roomCode,
          action: 'COMPLETE_CARD',
        }),
      });
    }
  }

  public async forfeitCard() {
    const sent = this.sendWsMessage({
      type: 'FORFEIT_CARD',
      roomCode: this.roomCode,
    });
    if (!sent) {
      await fetch('/api/online/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: this.roomCode,
          action: 'FORFEIT_CARD',
        }),
      });
    }
  }

  public async nextTurn() {
    const sent = this.sendWsMessage({
      type: 'NEXT_TURN',
      roomCode: this.roomCode,
    });
    if (!sent) {
      await fetch('/api/online/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: this.roomCode,
          action: 'NEXT_TURN',
        }),
      });
    }
  }

  public async changeSettings(level?: CoupleLevel, environment?: PlayEnvironment) {
    const sent = this.sendWsMessage({
      type: 'CHANGE_SETTINGS',
      roomCode: this.roomCode,
      level,
      environment,
    });
    if (!sent) {
      await fetch('/api/online/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: this.roomCode,
          action: 'CHANGE_SETTINGS',
          payload: { level, environment },
        }),
      });
    }
  }

  public async sendMessage(senderName: string, senderGender: 'male' | 'female', text: string) {
    const sent = this.sendWsMessage({
      type: 'SEND_MESSAGE',
      roomCode: this.roomCode,
      senderName,
      senderGender,
      text,
    });
    if (!sent) {
      await fetch('/api/online/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: this.roomCode,
          action: 'SEND_MESSAGE',
          payload: { senderName, senderGender, text },
        }),
      });
    }
  }

  public sendReaction(emoji: string, senderName: string) {
    this.sendWsMessage({
      type: 'SEND_REACTION',
      roomCode: this.roomCode,
      emoji,
      senderName,
    });
  }

  public leaveRoom() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.roomCode = '';
    this.playerId = '';
    this.currentRoomState = null;
    clearTimeout(this.reconnectTimer);
  }
}

export const onlineSync = new OnlineSyncService();
