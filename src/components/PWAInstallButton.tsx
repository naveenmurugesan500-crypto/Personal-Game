import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    soundEngine.playTap();
    soundEngine.vibrateTap();
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General prompt or alert
      alert('To install on Android: Tap your browser menu (3 dots) and choose "Add to Home screen" or "Install App".');
    }
  };

  return (
    <>
      <button
        id="pwa-install-btn"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-semibold shadow-lg shadow-rose-900/40 hover:brightness-110 active:scale-95 transition-all"
        title="Install Android App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Smartphone className="w-5 h-5" />
                <span>Install on Mobile</span>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-300 space-y-2">
              <span className="block font-medium text-white mb-2">To install as a full-screen app:</span>
              <span className="block">1. Tap the <strong>Share</strong> icon in your browser toolbar.</span>
              <span className="block">2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              <span className="block">3. Launch from your home screen for the full immersive 18+ game experience!</span>
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
