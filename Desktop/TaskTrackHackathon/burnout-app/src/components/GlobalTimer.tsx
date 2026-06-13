'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Play, Pause, Square } from 'lucide-react';
import BreakPromptModal from '@/components/BreakPromptModal';

export default function GlobalTimer() {
  const pathname = usePathname();
  const { isFocusing, focusSeconds, setIsFocusing, setFocusSeconds, resetTimer, updateStats, burnoutTimeLimit } = useAppStore();
  const [showBreakPrompt, setShowBreakPrompt] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPingedThreshold = useRef<number>(0);

  // Reset timer on tab change
  useEffect(() => {
    if (focusSeconds > 0) {
      updateStats('Focus', Math.round(focusSeconds / 60));
    }
    resetTimer();
    setShowBreakPrompt(false);
    lastPingedThreshold.current = 0;
  }, [pathname, resetTimer, updateStats]);

  // Stopwatch Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isFocusing) {
      interval = setInterval(() => {
        setFocusSeconds((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusing, setFocusSeconds]);

  // Adaptive Stamina Trigger Logic
  useEffect(() => {
    // If we reach the burnout limit (converted to seconds) and haven't pinged for this threshold yet
    if (focusSeconds >= burnoutTimeLimit * 60 && lastPingedThreshold.current < burnoutTimeLimit) {
      lastPingedThreshold.current = burnoutTimeLimit;
      
      // Play Ping
      if (!audioRef.current) {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // A gentle bell ping
      }
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));

      // Show Modal
      setShowBreakPrompt(true);
    }
  }, [focusSeconds, burnoutTimeLimit]);

  const handleStop = () => {
    setIsFocusing(false);
    useAppStore.getState().recordBreakInterval(Math.round(focusSeconds / 60));
    updateStats('Focus', Math.round(focusSeconds / 60));
    resetTimer();
    lastPingedThreshold.current = 0;
  };

  const handlePausePlay = () => {
    if (isFocusing) {
      useAppStore.getState().recordBreakInterval(Math.round(focusSeconds / 60));
    }
    setIsFocusing(!isFocusing);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <BreakPromptModal isOpen={showBreakPrompt} onClose={() => setShowBreakPrompt(false)} />

      <div className="fixed top-4 right-4 z-40 flex items-center bg-surface border border-gray-800 shadow-2xl rounded-full p-2 pr-4 gap-3 animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center gap-1">
          <button 
            onClick={handlePausePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFocusing ? 'bg-yellow-500/20 text-yellow-500' : 'bg-accent text-black hover:bg-yellow-400'}`}
          >
            {isFocusing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
          </button>
          {focusSeconds > 0 && (
            <button 
              onClick={handleStop}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Square size={16} fill="currentColor" />
            </button>
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold leading-none">Focusing (Limit: {burnoutTimeLimit}m)</span>
          <span className={`font-mono font-bold tracking-tighter text-lg leading-none mt-1 ${focusSeconds >= burnoutTimeLimit * 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {formatTime(focusSeconds)}
          </span>
        </div>
      </div>
    </>
  );
}
