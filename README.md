# Truth or Dare: 18+ Adult Edition (Couples Special)

An adult couples Truth or Dare web application built with React, Vite, Tailwind CSS, Express, and WebSockets for real-time multiplayer synchronization.

---

## Features

- **18+ Age Gate & Intimacy Confirmation**: Verified consensual adult session for partners.
- **Gender-Tailored Decks**: Dedicated prompt categories for Him (Male) and Her (Female) across **Soft**, **Medium**, and **Extreme** levels.
- **Play Modes**:
  - **Direct Play**: Physical, sensual in-person challenges (touching, kissing, whispering, lap seating).
  - **Video Call**: Remote long-distance challenges (camera gazing, sensual poses, flirty whispers).
- **Online Multiplayer & Offline Play**:
  - **Online Sync**: Real-time room codes with WebSocket sync for turns, card reveals, score tracking, and live floating reactions.
  - **Offline Mode**: Pass-and-play on a single shared screen.
- **Spin-the-Bottle & Turn-by-Turn**: Smooth 3D-styled bottle spinner and turn switcher.
- **In-App Cam Mirror**: Front-camera viewfinder designed for video call dares.
- **PWA Ready**: Installable on Android & iOS as a full-screen mobile app.

---

## Getting Started from Git

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <repository-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables (Optional)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

If you wish to enable custom AI spicy prompt generation via Google Gemini, add your Gemini API key to `.env`:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

*(Note: The game includes hundreds of offline curated prompts, so an API key is completely optional!)*

### 4. Run the Development Server

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Production Build

To build and start the standalone production server:

```bash
# Build client and bundle backend server
npm run build

# Start the compiled production server
npm start
```

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, WebSocket (`ws`), Vite Middleware (`tsx` in dev, `esbuild` in prod)
- **AI**: `@google/genai` (Gemini 2.5 Flash) for dynamic prompt generation
- **PWA**: `vite-plugin-pwa` with web app manifest and offline caching
