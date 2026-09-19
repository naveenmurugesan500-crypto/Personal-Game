import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error('Failed to init Gemini client:', e);
    }
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ===================================================
// ONLINE MULTIPLAYER ROOMS IN-MEMORY STORE
// ===================================================
interface OnlinePlayer {
  id: string;
  name: string;
  gender: 'male' | 'female';
  avatarColor: string;
  score: number;
  truthsDone: number;
  daresDone: number;
  forfeitsDone: number;
  isOnline: boolean;
}

interface OnlineRoom {
  roomCode: string;
  hostId: string;
  malePlayer: OnlinePlayer | null;
  femalePlayer: OnlinePlayer | null;
  currentTurnGender: 'male' | 'female';
  currentLevel: 'soft' | 'medium' | 'extreme';
  currentEnvironment: 'direct_play' | 'video_call';
  currentCard: {
    prompt: any;
    targetGender: 'male' | 'female';
    drawnAt: number;
    status: 'idle' | 'revealed' | 'completed' | 'forfeited';
  } | null;
  messages: {
    id: string;
    senderName: string;
    senderGender: 'male' | 'female' | 'other';
    text: string;
    timestamp: number;
  }[];
  status: 'waiting' | 'connected' | 'playing';
  lastUpdated: number;
  clients: Set<WebSocket>;
}

const rooms = new Map<string, OnlineRoom>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function sanitizeRoom(room: OnlineRoom) {
  const { clients, ...safeRoom } = room;
  return safeRoom;
}

function broadcastToRoom(room: OnlineRoom, message: any) {
  const payload = JSON.stringify(message);
  for (const client of room.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Create an online couple room
app.post('/api/online/create', (req, res) => {
  try {
    const {
      hostName = 'Partner',
      hostGender = 'male',
      level = 'soft',
      environment = 'video_call',
    } = req.body;

    const roomCode = generateRoomCode();
    const hostPlayer: OnlinePlayer = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: hostName.trim() || (hostGender === 'male' ? 'Him' : 'Her'),
      gender: hostGender,
      avatarColor: hostGender === 'male' ? '#05d9e8' : '#ff2a6d',
      score: 0,
      truthsDone: 0,
      daresDone: 0,
      forfeitsDone: 0,
      isOnline: true,
    };

    const newRoom: OnlineRoom = {
      roomCode,
      hostId: hostPlayer.id,
      malePlayer: hostGender === 'male' ? hostPlayer : null,
      femalePlayer: hostGender === 'female' ? hostPlayer : null,
      currentTurnGender: hostGender,
      currentLevel: level,
      currentEnvironment: environment,
      currentCard: null,
      messages: [
        {
          id: `m_${Date.now()}`,
          senderName: 'Game Master',
          senderGender: 'other',
          text: `Room ${roomCode} created! Share this code with your partner to play together.`,
          timestamp: Date.now(),
        },
      ],
      status: 'waiting',
      lastUpdated: Date.now(),
      clients: new Set(),
    };

    rooms.set(roomCode, newRoom);

    res.json({
      success: true,
      roomCode,
      player: hostPlayer,
      room: sanitizeRoom(newRoom),
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Join an online couple room
app.post('/api/online/join', (req, res) => {
  try {
    const { roomCode = '', playerName = 'Partner', playerGender = 'female' } = req.body;
    const cleanCode = roomCode.trim().toUpperCase();

    const room = rooms.get(cleanCode);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room code not found. Please check with your partner.' });
    }

    const joiningPlayer: OnlinePlayer = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: playerName.trim() || (playerGender === 'male' ? 'Him' : 'Her'),
      gender: playerGender,
      avatarColor: playerGender === 'male' ? '#05d9e8' : '#ff2a6d',
      score: 0,
      truthsDone: 0,
      daresDone: 0,
      forfeitsDone: 0,
      isOnline: true,
    };

    if (playerGender === 'male') {
      room.malePlayer = joiningPlayer;
    } else {
      room.femalePlayer = joiningPlayer;
    }

    if (room.malePlayer && room.femalePlayer) {
      room.status = 'connected';
    }

    room.lastUpdated = Date.now();
    room.messages.push({
      id: `m_${Date.now()}`,
      senderName: 'Game Master',
      senderGender: 'other',
      text: `${joiningPlayer.name} joined the intimacy session! Both partners are connected.`,
      timestamp: Date.now(),
    });

    broadcastToRoom(room, {
      type: 'ROOM_UPDATE',
      room: sanitizeRoom(room),
    });

    res.json({
      success: true,
      roomCode: cleanCode,
      player: joiningPlayer,
      room: sanitizeRoom(room),
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get room details
app.get('/api/online/room/:code', (req, res) => {
  const cleanCode = req.params.code.trim().toUpperCase();
  const room = rooms.get(cleanCode);
  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }
  res.json({ success: true, room: sanitizeRoom(room) });
});

// Execute game action on room
app.post('/api/online/action', (req, res) => {
  try {
    const { roomCode = '', action = '', payload = {} } = req.body;
    const cleanCode = roomCode.trim().toUpperCase();
    const room = rooms.get(cleanCode);

    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    if (action === 'DRAW_CARD') {
      room.currentCard = {
        prompt: payload.prompt,
        targetGender: payload.targetGender || room.currentTurnGender,
        drawnAt: Date.now(),
        status: 'revealed',
      };
      room.status = 'playing';
    } else if (action === 'COMPLETE_CARD') {
      if (room.currentCard) {
        room.currentCard.status = 'completed';
      }
      const activePlayer = room.currentTurnGender === 'male' ? room.malePlayer : room.femalePlayer;
      if (activePlayer) {
        activePlayer.score += 10;
        if (room.currentCard?.prompt?.type === 'truth') {
          activePlayer.truthsDone += 1;
        } else {
          activePlayer.daresDone += 1;
        }
      }
    } else if (action === 'FORFEIT_CARD') {
      if (room.currentCard) {
        room.currentCard.status = 'forfeited';
      }
      const activePlayer = room.currentTurnGender === 'male' ? room.malePlayer : room.femalePlayer;
      if (activePlayer) {
        activePlayer.forfeitsDone += 1;
      }
    } else if (action === 'NEXT_TURN') {
      room.currentTurnGender = room.currentTurnGender === 'male' ? 'female' : 'male';
      room.currentCard = null;
    } else if (action === 'CHANGE_SETTINGS') {
      if (payload.level) room.currentLevel = payload.level;
      if (payload.environment) room.currentEnvironment = payload.environment;
    } else if (action === 'SEND_MESSAGE') {
      room.messages.push({
        id: `m_${Date.now()}`,
        senderName: payload.senderName || 'Partner',
        senderGender: payload.senderGender || 'other',
        text: payload.text || '',
        timestamp: Date.now(),
      });
      // Keep only last 50 messages
      if (room.messages.length > 50) {
        room.messages.shift();
      }
    }

    room.lastUpdated = Date.now();

    broadcastToRoom(room, {
      type: 'ROOM_UPDATE',
      room: sanitizeRoom(room),
      action,
      payload,
    });

    res.json({ success: true, room: sanitizeRoom(room) });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// AI Spicy Truth or Dare prompt generation
app.post('/api/generate-prompts', async (req, res) => {
  try {
    const { mode = 'spicy', type = 'all', players = [], customContext = '' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'No Gemini API key configured. Using offline curated decks.',
        prompts: [],
      });
    }

    const playerNames = Array.isArray(players) && players.length > 0
      ? players.map((p: any) => typeof p === 'string' ? p : p.name).filter(Boolean).join(', ')
      : 'Him and Her';

    const systemPrompt = `You are an expert game master creating an ADULT-ONLY (18+) Truth or Dare game EXCLUSIVELY FOR COUPLES (two intimate partners: Male and Female).
Generate exciting, seductive, romantic, flirty, or spicy truth questions and dares specifically between the two partners (${playerNames}).
The game level/mode is: "${mode}".
${customContext ? `Couple context / theme: "${customContext}".` : ''}

CRITICAL RULES:
- Questions and dares MUST be tailored for TWO PARTNERS exploring romance, sexual chemistry, intimate confessions, and playful physical challenges together.
- Focus on romantic desires, partner attraction confessions, sensual physical dares (e.g. whispering in ear, slow dancing, neck kisses, lap sitting, sensual massages, eye gazing, undressing dares, touching, passionate kissing, seductive compliments).
- Maintain mutual consent and positive romantic intimacy: keep it thrilling, spicy, and passionately fun!
- Return a strict JSON array with 6 items. Each item must have:
  "text": string (the truth or dare prompt text),
  "type": "truth" or "dare",
  "intensity": 1, 2, or 3 (1=soft, 2=medium, 3=extreme),
  "category": "${mode}"
Respond ONLY with raw JSON array.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Generate 6 new spicy adult Truth or Dare prompts for mode: ${mode}. Players: ${playerNames}` }],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.9,
      },
    });

    const responseText = response.text || '[]';
    let parsedPrompts = [];
    try {
      parsedPrompts = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedPrompts = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      prompts: parsedPrompts,
    });
  } catch (error: any) {
    console.error('Gemini generation error:', error);
    return res.status(200).json({
      success: false,
      fallback: true,
      error: error.message || 'Generation error',
      prompts: [],
    });
  }
});

async function startServer() {
  const server = http.createServer(app);

  // Setup WebSocket Server on /ws
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const roomCode = url.searchParams.get('roomCode')?.toUpperCase() || '';
    const playerId = url.searchParams.get('playerId') || '';

    let currentRoom = rooms.get(roomCode);
    if (currentRoom) {
      currentRoom.clients.add(ws);
      // Send immediate state sync
      ws.send(
        JSON.stringify({
          type: 'INIT_SYNC',
          room: sanitizeRoom(currentRoom),
        })
      );
    }

    ws.on('message', (messageRaw: string) => {
      try {
        const msg = JSON.parse(messageRaw.toString());
        const targetRoomCode = (msg.roomCode || roomCode).toUpperCase();
        const room = rooms.get(targetRoomCode);
        if (!room) return;

        if (msg.type === 'JOIN_ROOM') {
          room.clients.add(ws);
          currentRoom = room;
          ws.send(JSON.stringify({ type: 'ROOM_UPDATE', room: sanitizeRoom(room) }));
        } else if (msg.type === 'DRAW_CARD') {
          room.currentCard = {
            prompt: msg.prompt,
            targetGender: msg.targetGender || room.currentTurnGender,
            drawnAt: Date.now(),
            status: 'revealed',
          };
          room.status = 'playing';
          room.lastUpdated = Date.now();
          broadcastToRoom(room, { type: 'ROOM_UPDATE', room: sanitizeRoom(room) });
        } else if (msg.type === 'COMPLETE_CARD') {
          if (room.currentCard) {
            room.currentCard.status = 'completed';
          }
          const activePlayer = room.currentTurnGender === 'male' ? room.malePlayer : room.femalePlayer;
          if (activePlayer) {
            activePlayer.score += 10;
            if (room.currentCard?.prompt?.type === 'truth') {
              activePlayer.truthsDone += 1;
            } else {
              activePlayer.daresDone += 1;
            }
          }
          room.lastUpdated = Date.now();
          broadcastToRoom(room, { type: 'ROOM_UPDATE', room: sanitizeRoom(room) });
        } else if (msg.type === 'FORFEIT_CARD') {
          if (room.currentCard) {
            room.currentCard.status = 'forfeited';
          }
          const activePlayer = room.currentTurnGender === 'male' ? room.malePlayer : room.femalePlayer;
          if (activePlayer) {
            activePlayer.forfeitsDone += 1;
          }
          room.lastUpdated = Date.now();
          broadcastToRoom(room, { type: 'ROOM_UPDATE', room: sanitizeRoom(room) });
        } else if (msg.type === 'NEXT_TURN') {
          room.currentTurnGender = room.currentTurnGender === 'male' ? 'female' : 'male';
          room.currentCard = null;
          room.lastUpdated = Date.now();
          broadcastToRoom(room, { type: 'ROOM_UPDATE', room: sanitizeRoom(room) });
        } else if (msg.type === 'CHANGE_SETTINGS') {
          if (msg.level) room.currentLevel = msg.level;
          if (msg.environment) room.currentEnvironment = msg.environment;
          room.lastUpdated = Date.now();
          broadcastToRoom(room, { type: 'ROOM_UPDATE', room: sanitizeRoom(room) });
        } else if (msg.type === 'SEND_MESSAGE') {
          const chatMsg = {
            id: `m_${Date.now()}`,
            senderName: msg.senderName || 'Partner',
            senderGender: msg.senderGender || 'other',
            text: msg.text || '',
            timestamp: Date.now(),
          };
          room.messages.push(chatMsg);
          if (room.messages.length > 50) room.messages.shift();
          room.lastUpdated = Date.now();
          broadcastToRoom(room, { type: 'CHAT_MESSAGE', message: chatMsg, room: sanitizeRoom(room) });
        } else if (msg.type === 'SEND_REACTION') {
          broadcastToRoom(room, {
            type: 'REACTION',
            emoji: msg.emoji,
            senderName: msg.senderName,
          });
        } else if (msg.type === 'WEBRTC_SIGNAL') {
          // Relay WebRTC signaling (offer, answer, candidate) to the other client in this room
          const relayMsg = JSON.stringify({
            type: 'WEBRTC_SIGNAL',
            signal: msg.signal,
            senderId: msg.senderId,
          });
          for (const client of room.clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(relayMsg);
            }
          }
        } else if (msg.type === 'CAM_STATUS') {
          // Relay camera active status to other client
          const relayMsg = JSON.stringify({
            type: 'CAM_STATUS',
            isCameraOn: msg.isCameraOn,
            senderId: msg.senderId,
          });
          for (const client of room.clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(relayMsg);
            }
          }
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoom) {
        currentRoom.clients.delete(ws);
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Truth or Dare Game Server (HTTP + WS) running on port ${PORT}`);
  });
}

startServer();
