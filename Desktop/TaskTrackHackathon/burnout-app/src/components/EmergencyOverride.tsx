'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export default function EmergencyOverride() {
  const { latestInsight, focusSeconds, isFocusing } = useAppStore();

  // Trigger if AI says score > 85, OR if they've been focusing for > 120 minutes without checking in
  const isCritical = (latestInsight && latestInsight.burnout_score > 85) || (isFocusing && focusSeconds > 120 * 60);

  return (
    <AnimatePresence>
      {isCritical && (
        <motion.div 
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute top-10 text-center px-4">
            <h2 className="text-red-500 font-bold text-3xl tracking-widest uppercase mb-2">Emergency Override</h2>
            <p className="text-gray-400 mt-2 max-w-md mx-auto text-lg">
              {latestInsight?.action_directive || "You've been working continuously for over 2 hours without a break."}
            </p>
          </div>
          
          <motion.div
            className="w-64 h-64 rounded-full border-4 border-red-500 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.3)] relative mt-10"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div 
              className="w-full h-full rounded-full bg-red-500 opacity-20"
              animate={{ 
                scale: [0.8, 1, 0.8],
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          <p className="mt-12 text-gray-400 text-sm tracking-widest uppercase animate-pulse">Follow the circle to regulate breathing</p>

          <div className="absolute bottom-10 w-full px-6 max-w-2xl text-center">
            <h3 className="text-xl font-bold text-white mb-6">Mandatory 15-Minute Recovery Protocol</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href="https://www.youtube.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-surface border border-gray-800 p-4 rounded-xl hover:border-accent hover:bg-black transition-colors block"
              >
                <h4 className="text-accent font-bold mb-1">Watch a Video</h4>
                <p className="text-gray-400 text-xs">Disconnect and watch something light.</p>
              </a>
              <a 
                href="https://www.instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-surface border border-gray-800 p-4 rounded-xl hover:border-accent hover:bg-black transition-colors block"
              >
                <h4 className="text-accent font-bold mb-1">Social Media Break</h4>
                <p className="text-gray-400 text-xs">Catch up with friends for a few minutes.</p>
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
