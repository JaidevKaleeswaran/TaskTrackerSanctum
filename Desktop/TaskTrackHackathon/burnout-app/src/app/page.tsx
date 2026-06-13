'use client';

import { useState } from 'react';
import TaskTracker from '@/components/TaskTracker';
import MindGuard from '@/components/MindGuard';
import CheckEngineLight from '@/components/CheckEngineLight';
import EmergencyOverride from '@/components/EmergencyOverride';
import { useAppStore } from '@/store/useAppStore';

export default function Dashboard() {
  const [showCheckInTrigger, setShowCheckInTrigger] = useState(false);
  const { focusSeconds } = useAppStore();

  const handleTaskComplete = () => {
    // When a task is checked off, we gently prompt them to check-in if they've been working a bit
    if (focusSeconds > 5 * 60) {
      setShowCheckInTrigger(true);
    }
  };

  return (
    <>
      <EmergencyOverride />
      
      <div className="flex flex-col h-full gap-6 max-w-6xl mx-auto pt-6">
        <header className="mb-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-400">Your missions for the day.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Left Column: Tasks (Now Takes Majority) */}
          <div className="lg:col-span-8 h-[600px] lg:h-full">
            <TaskTracker onTaskComplete={handleTaskComplete} />
          </div>

          {/* Right Column: Check Engine & AI */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <CheckEngineLight />
            
            <div className={`transition-all duration-500 ${showCheckInTrigger ? 'scale-105 shadow-[0_0_20px_rgba(255,215,0,0.2)] rounded-2xl' : ''}`}>
              <MindGuard />
            </div>

            {showCheckInTrigger && (
              <div className="text-center text-accent text-sm animate-pulse">
                You completed a task! Please log a MindGuard check-in.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
