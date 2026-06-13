'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export default function BreakPromptModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { adjustBurnoutLimit, resetTimer, updateStats, focusSeconds, isFocusing } = useAppStore();

  const handleTakeBreak = () => {
    // Stop and log current time
    if (focusSeconds > 0) {
      updateStats('Focus', Math.round(focusSeconds / 60));
    }
    resetTimer();
    onClose();
  };

  const handlePushThrough = () => {
    // Close modal, keep timer running, increase limit by 5 minutes
    adjustBurnoutLimit(5);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-surface border border-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-red-500 to-accent" />
            
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Burnout Limit Reached</h2>
            <p className="text-gray-400 mb-8">
              You've reached your current stamina threshold. Taking a break now is highly recommended to maintain long-term focus.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <a 
                href="https://www.youtube.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-black border border-gray-800 p-4 rounded-xl hover:border-accent transition-colors flex flex-col items-center justify-center gap-2 group"
                onClick={handleTakeBreak}
              >
                <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                  ▶
                </div>
                <span className="text-sm font-bold text-white">YouTube</span>
              </a>
              <a 
                href="https://www.instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-black border border-gray-800 p-4 rounded-xl hover:border-accent transition-colors flex flex-col items-center justify-center gap-2 group"
                onClick={handleTakeBreak}
              >
                <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                  📷
                </div>
                <span className="text-sm font-bold text-white">Instagram</span>
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleTakeBreak}
                className="w-full bg-accent text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors"
              >
                Take a Break (Stop Timer)
              </button>
              <button 
                onClick={handlePushThrough}
                className="w-full bg-transparent text-gray-500 font-bold py-3 rounded-xl hover:text-white hover:bg-gray-800 transition-colors text-sm"
              >
                Continue Working (+5m Limit)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
