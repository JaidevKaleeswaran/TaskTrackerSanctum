'use client';

import { useAppStore } from '@/store/useAppStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BrainCircuit, Activity, AlertCircle } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

export default function AIInsights() {
  const { insightHistory, latestInsight } = useAppStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chartData = useMemo(() => {
    return insightHistory.map((insight, index) => ({
      name: `Check-in ${index + 1}`,
      score: insight.burnout_score,
      emotion: insight.detected_emotion
    }));
  }, [insightHistory]);

  return (
    <div className="max-w-6xl mx-auto pt-6 h-full flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <BrainCircuit className="text-accent" size={32} />
          AI Insights
        </h1>
        <p className="text-gray-400 mt-2">Your cognitive load and burnout trends, analyzed by MindGuard.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Latest Insight Panel */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-surface p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-5 rounded-full blur-3xl" />
            
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity size={20} className="text-accent" />
              Current Status
            </h2>

            {latestInsight ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Burnout Score</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-5xl font-mono font-bold tracking-tighter ${latestInsight.burnout_score > 75 ? 'text-red-500' : latestInsight.burnout_score > 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {latestInsight.burnout_score}
                    </span>
                    <span className="text-gray-500 mb-1">/ 100</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black p-3 rounded-lg border border-gray-800">
                    <p className="text-xs text-gray-500 uppercase">Emotion</p>
                    <p className="text-white font-medium capitalize mt-1">{latestInsight.detected_emotion}</p>
                  </div>
                  <div className="bg-black p-3 rounded-lg border border-gray-800">
                    <p className="text-xs text-gray-500 uppercase">Pattern</p>
                    <p className="text-white font-medium mt-1">{latestInsight.pattern_diagnosed}</p>
                  </div>
                </div>

                <div className="bg-black p-4 rounded-xl border-l-4 border-accent">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Action Directive</p>
                  <p className="text-white text-lg font-medium leading-relaxed">
                    "{latestInsight.action_directive}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500">
                <AlertCircle size={32} className="mb-3 opacity-50" />
                <p>No data yet.</p>
                <p className="text-sm mt-1">Complete a MindGuard check-in on the dashboard to generate insights.</p>
              </div>
            )}
          </div>
        </div>

        {/* Burnout Trend Chart */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6">Burnout Trajectory</h2>
          
          <div className="flex-1 w-full min-h-[300px]">
            {insightHistory.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                Not enough data to map trajectory.
              </div>
            ) : (
              isClient && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#555" 
                      tick={{ fill: '#888', fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke="#555" 
                      tick={{ fill: '#888', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#FFD700', fontWeight: 'bold' }}
                      labelStyle={{ color: '#888', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#FFD700" 
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#000', stroke: '#FFD700', strokeWidth: 2 }}
                      activeDot={{ r: 8, fill: '#FFD700', stroke: '#000' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
