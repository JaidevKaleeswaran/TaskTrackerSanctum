'use client';

import { useState, useEffect } from 'react';
import { useAppStore, TaskType } from '@/store/useAppStore';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface PomodoroTimerProps {
  durationMinutes: number;
  taskType: TaskType;
}

export default function PomodoroTimer({ durationMinutes, taskType }: PomodoroTimerProps) {
  const { updateStats } = useAppStore();
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setTimeLeft(durationMinutes * 60);
    setIsActive(false);
  }, [durationMinutes, taskType]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      handleComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleComplete = async () => {
    // 1. Update global state
    updateStats(taskType, durationMinutes);

    // 2. Sync to Firebase
    try {
      await addDoc(collection(db, 'sessions'), {
        type: taskType,
        durationMinutes,
        completedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error syncing to Firebase:", e);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durationMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / (durationMinutes * 60));
  const dashArray = 283; // 2 * pi * r (approx 45)
  const dashOffset = dashArray - dashArray * progress;
  const color = taskType === 'Focus' ? '#3b82f6' : '#10b981';

  return (
    <div className="bg-surface p-8 rounded-2xl border border-gray-800 shadow-xl flex flex-col items-center justify-center relative">
      <div className="absolute top-4 right-4 bg-black px-3 py-1 rounded-full border border-gray-700 text-xs font-bold text-gray-300">
        {taskType} Mode
      </div>
      
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        {/* Background Ring */}
        <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="#1a1a1a" 
            strokeWidth="4" 
          />
          {/* Progress Ring */}
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke={color} 
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        
        <div className="text-6xl font-bold font-mono tracking-tighter text-white z-10">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={resetTimer}
          className="p-4 rounded-full bg-black border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
        >
          <RotateCcw size={24} />
        </button>
        
        <button 
          onClick={toggleTimer}
          className="w-20 h-20 rounded-full bg-accent text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.2)] hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] transition-all hover:scale-105"
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
        </button>
      </div>
    </div>
  );
}
