'use client';

import { useAppStore } from '@/store/useAppStore';
import { Activity } from 'lucide-react';

export default function CheckEngineLight() {
  const { latestInsight, focusSeconds, burnoutTimeLimit } = useAppStore();

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  let message = 'Mental state optimal.';

  // If AI insight is available
  if (latestInsight) {
    if (latestInsight.burnout_score > 75) {
      status = 'critical';
      message = 'Burnout detected! Take action immediately.';
    } else if (latestInsight.burnout_score > 40) {
      status = 'warning';
      message = 'Cognitive load rising. Consider a break soon.';
    }
  } 
  // Fallback to time-based dynamically using the stamina limit
  else if (focusSeconds >= burnoutTimeLimit * 60) {
    status = 'critical';
    message = `Limit reached! You have been focusing for ${burnoutTimeLimit} minutes. Check-in required.`;
  } else if (focusSeconds >= (burnoutTimeLimit - 5) * 60 && focusSeconds > 0) {
    status = 'warning';
    message = `Approaching burnout limit. Less than 5 minutes remaining.`;
  }

  const colors = {
    healthy: 'bg-green-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    warning: 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]',
    critical: 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse'
  };

  const textColors = {
    healthy: 'text-green-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500'
  };

  return (
    <div className="bg-surface p-4 rounded-xl border border-gray-800 shadow-xl flex items-center gap-4">
      <div className={`w-4 h-4 rounded-full flex-shrink-0 ${colors[status]}`} />
      <div>
        <h3 className={`text-sm font-bold uppercase tracking-wider ${textColors[status]} flex items-center gap-1`}>
          <Activity size={14} /> Check Engine
        </h3>
        <p className="text-gray-400 text-sm mt-0.5">{message}</p>
      </div>
    </div>
  );
}
