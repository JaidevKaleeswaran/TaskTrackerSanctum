'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Brain, Loader2 } from 'lucide-react';

export default function MindGuard() {
  const [checkIn, setCheckIn] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { recentHistory, setLatestInsight, focusSeconds, burnoutTimeLimit, setBurnoutTimeLimit } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn.trim()) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/mindguard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_check_in: checkIn,
          recent_history: recentHistory,
        })
      });

      if (!res.ok) throw new Error('Failed to fetch AI insight');
      
      const data = await res.json();
      setLatestInsight({
        ...data,
        timestamp: Date.now()
      });

      // Adaptive Stamina Logic:
      if (data.burnout_score > 75 && (focusSeconds / 60) < burnoutTimeLimit) {
        // If they report early burnout, dramatically reduce the timer to their current active time
        // This will immediately trigger the BreakPromptModal on the next tick
        const currentMins = Math.floor(focusSeconds / 60);
        setBurnoutTimeLimit(Math.max(1, currentMins)); // Set to 1 min min for testing
      }
      
      // Gamification Logic: Spawn a village crisis
      try {
        const crisisRes = await fetch('/api/village-crisis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_check_in: checkIn,
            burnout_score: data.burnout_score,
          })
        });
        if (crisisRes.ok) {
          const crisisData = await crisisRes.json();
          if (crisisData.target_building && crisisData.problem_description) {
            import('@/store/useGameStore').then(({ useGameStore }) => {
              useGameStore.getState().addBuildingProblem(
                crisisData.target_building, 
                `${crisisData.problem_description} (Cost: ${crisisData.currency_cost_to_fix}💰)`
              );
              // Also deal some damage
              useGameStore.getState().damageBuilding(crisisData.target_building, data.burnout_score > 70 ? 25 : 10);
            });
          }
        }
      } catch (e) {
        console.error("Failed to generate village crisis", e);
      }

      setCheckIn('');
    } catch (err) {
      console.error(err);
      alert("MindGuard is currently unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-gray-800 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="text-accent" size={24} />
        <h3 className="text-lg font-bold text-white">MindGuard Check-in</h3>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        How are you feeling right now? This helps us adapt your personal stamina limits.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          placeholder="e.g., 'Feeling a bit tired but ready to go...'" 
          className="flex-1 bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors text-sm"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !checkIn.trim()}
          className="bg-accent text-black font-bold px-6 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Analyze'}
        </button>
      </form>
    </div>
  );
}
