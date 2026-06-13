'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useGameStore } from '@/store/useGameStore';
import { Plus, Trash2, Repeat, CheckCircle2, Circle, Play, Square } from 'lucide-react';
import CreateTaskModal from '@/components/CreateTaskModal';

export default function TaskTracker({ onTaskComplete }: { onTaskComplete?: () => void }) {
  const { tasks, deleteTask, toggleTaskCompletion, activeTaskId, setActiveTaskId, isFocusing, setIsFocusing } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    toggleTaskCompletion(id);
    if (!currentlyCompleted) {
      if (activeTaskId === id) {
        setIsFocusing(false);
        setActiveTaskId(null);
      }
      
      // Gamification: Earn currency and reset degradation timer
      useGameStore.getState().earnCurrency(task.reward || 50);
      useGameStore.getState().setLastTaskCompletedAt(Date.now());

      if (onTaskComplete) onTaskComplete(); // Trigger AI Check-in
    }
  };

  const handlePlayToggle = async (id: string, title: string, durationMinutes: number) => {
    if (activeTaskId === id) {
      // Toggle pause/play
      if (isFocusing) {
        useAppStore.getState().recordBreakInterval(Math.round(useAppStore.getState().focusSeconds / 60));
      }
      setIsFocusing(!isFocusing);
    } else {
      // Switch task and start
      setActiveTaskId(id);
      setIsFocusing(true);

      // Call AI to calculate custom burnout limit
      try {
        const todayStats = useAppStore.getState().recentHistory.find(h => h.date === new Date().toISOString().split('T')[0]);
        const pastBreaks = todayStats?.break_intervals || [];

        const res = await fetch('/api/timer-setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_title: title,
            estimated_minutes: durationMinutes,
            past_break_intervals: pastBreaks
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.recommended_break_time) {
            useAppStore.getState().setBurnoutTimeLimit(data.recommended_break_time);
            console.log("AI set burnout limit to:", data.recommended_break_time, "Reason:", data.reasoning);
          }
        }
      } catch (e) {
        console.error("Failed to get AI timer setup:", e);
        useAppStore.getState().setBurnoutTimeLimit(durationMinutes > 30 ? 30 : durationMinutes);
      }
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const incompleteTasks = tasks.filter(t => {
    if (t.completed) return false;
    if (!t.dueDate || t.isRecurring || t.dueDate === todayStr || t.dueDate < todayStr) {
      return true;
    }
    return false;
  });
  const completedTasks = tasks.filter(t => {
    if (!t.completed) return false;
    if (!t.dueDate || t.dueDate === todayStr) {
      return true;
    }
    return false;
  });

  return (
    <>
      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="bg-surface p-6 rounded-2xl border border-gray-800 shadow-xl h-full flex flex-col relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Missions</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => useAppStore.getState().generateMockTasks()}
              className="bg-gray-800 hover:bg-gray-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors border border-gray-700 text-white flex items-center gap-1.5"
            >
              + Generate Examples
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-accent text-black font-bold p-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> New Task
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {tasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 py-12">
              <p>Your list is empty. Create a mission to start.</p>
              <button 
                onClick={() => useAppStore.getState().generateMockTasks()}
                className="bg-gray-800 hover:bg-gray-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors border border-gray-750 text-white"
              >
                Generate Example Tasks
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {incompleteTasks.map(task => {
                  const isActive = activeTaskId === task.id;
                  
                  return (
                    <div key={task.id} className={`bg-black p-4 rounded-xl border flex items-start gap-4 group transition-colors ${isActive ? 'border-accent shadow-[0_0_15px_rgba(255,215,0,0.15)]' : 'border-gray-800 hover:border-gray-600'}`}>
                      <button onClick={() => handleToggle(task.id, task.completed)} className="mt-1 text-gray-500 hover:text-accent transition-colors">
                        <Circle size={22} />
                      </button>
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-lg">{task.title}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-xs font-bold uppercase tracking-wider ${task.type === 'Focus' ? 'text-blue-500' : 'text-green-500'}`}>{task.type}</span>
                          <span className="text-xs text-gray-500">{task.durationMinutes}m est.</span>
                          {task.isRecurring && <span className="text-xs text-accent flex items-center gap-1"><Repeat size={12} /> Daily</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handlePlayToggle(task.id, task.title, task.durationMinutes)}
                          className={`p-3 rounded-full transition-all ${isActive && isFocusing ? 'bg-accent/20 text-accent' : 'bg-gray-800 text-gray-400 hover:text-accent hover:bg-gray-700'}`}
                        >
                          {isActive && isFocusing ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-3 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-gray-800 rounded-full hover:bg-gray-700">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {completedTasks.length > 0 && (
                <div className="space-y-2 pt-6 border-t border-gray-800/50">
                  <h4 className="text-xs text-gray-600 uppercase font-bold tracking-wider mb-3 px-2">Completed</h4>
                  {completedTasks.map(task => (
                    <div key={task.id} className="bg-black/50 p-3 rounded-xl border border-gray-800/50 flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                      <button onClick={() => handleToggle(task.id, task.completed)} className="text-accent">
                        <CheckCircle2 size={20} />
                      </button>
                      <div className="flex-1 line-through text-gray-500">
                        <h3 className="font-medium">{task.title}</h3>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
