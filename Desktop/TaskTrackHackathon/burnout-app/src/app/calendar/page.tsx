'use client';

import { useState, useMemo } from 'react';
import { useAppStore, TaskType } from '@/store/useAppStore';
import { useGameStore } from '@/store/useGameStore';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, Check, Repeat } from 'lucide-react';

interface CalendarDay {
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
}

export default function CalendarPage() {
  const { tasks, addTask, deleteTask, toggleTaskCompletion } = useAppStore();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  
  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('Focus');
  const [isRecurring, setIsRecurring] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState('60');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate 42 calendar grid days
  const calendarDays = useMemo(() => {
    const startDay = new Date(currentYear, currentMonth, 1).getDay(); // Day of week (0-6)
    const days: CalendarDay[] = [];

    // Previous month padding
    const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const dayVal = prevMonthLastDate - i;
      const monthVal = currentMonth === 0 ? 11 : currentMonth - 1;
      const yearVal = currentMonth === 0 ? currentYear - 1 : currentYear;
      // Format manual ISO date safely without timezone offset shift
      const dateStr = `${yearVal}-${String(monthVal + 1).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: dayVal, isCurrentMonth: false });
    }

    // Current month days
    const currentMonthLastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= currentMonthLastDate; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: i, isCurrentMonth: true });
    }

    // Next month padding
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const monthVal = currentMonth === 11 ? 0 : currentMonth + 1;
      const yearVal = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${yearVal}-${String(monthVal + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: i, isCurrentMonth: false });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Group tasks by dueDate
  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        if (!map[task.dueDate]) map[task.dueDate] = [];
        map[task.dueDate].push(task);
      }
    });
    return map;
  }, [tasks]);

  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  // Form Reward Calculation
  const reward = useMemo(() => {
    const mins = parseInt(durationMinutes || '0');
    return taskType === 'Focus' ? mins * 3 : mins * 1;
  }, [durationMinutes, taskType]);

  // Handle Add Task Submission
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !durationMinutes || !selectedDateStr) return;

    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: taskTitle.trim(),
      type: taskType,
      isRecurring,
      completed: false,
      durationMinutes: parseInt(durationMinutes),
      reward,
      dueDate: selectedDateStr,
    };

    addTask(newTask);

    // Gamification feedback if adding recurring/recharge tasks
    if (taskType === 'Recharge') {
      useGameStore.getState().earnCurrency(10); // Reward active self-care pacing!
    }

    // Reset Form
    setTaskTitle('');
    setIsRecurring(false);
    setDurationMinutes('60');
    setSelectedDateStr(null);
  };

  const handleToggleTask = (id: string, currentlyCompleted: boolean) => {
    toggleTaskCompletion(id);
    if (!currentlyCompleted) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        // Earn gold!
        useGameStore.getState().earnCurrency(task.reward || 50);
        useGameStore.getState().setLastTaskCompletedAt(Date.now());
      }
    }
  };

  return (
    <div className="w-full pt-6 h-full flex flex-col gap-6 select-none relative">
      
      {/* ADD TASK MODAL OVERLAY */}
      {selectedDateStr && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedDateStr(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <XIcon />
            </button>

            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <CalendarIcon size={20} className="text-accent" />
              Schedule Mission
            </h2>
            <p className="text-xs text-gray-400 mb-6">Target Date: <span className="text-accent font-semibold">{selectedDateStr}</span></p>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title</label>
                <input 
                  type="text" 
                  placeholder="What needs to be done?" 
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Type</label>
                  <select 
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                  >
                    <option value="Focus">Focus</option>
                    <option value="Recharge">Recharge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Est. Minutes</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer text-gray-300 hover:text-white transition-colors p-3 rounded-lg border border-gray-800 bg-black">
                  <input 
                    type="checkbox" 
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-700 text-accent focus:ring-accent bg-transparent"
                  />
                  <div className={`p-1 rounded ${isRecurring ? 'bg-accent/20 text-accent' : 'bg-gray-800 text-gray-500'}`}>
                    <Repeat size={16} />
                  </div>
                  <span className="font-medium">Repeat Daily</span>
                </label>

                <div className="text-right">
                  <span className="text-xs text-gray-400 font-bold uppercase block">Reward</span>
                  <span className="text-xl text-accent font-black">+{reward} 💰</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-accent text-black font-bold p-3 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus size={18} /> Schedule Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Header Panel */}
      <header className="bg-surface rounded-2xl p-5 border border-gray-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-accent" size={32} />
            Task Planner
          </h1>
          <p className="text-gray-400 mt-1">Schedule and pace your work days to prevent overloading.</p>
        </div>

        <div className="flex items-center gap-3 bg-black/60 p-2 rounded-xl border border-gray-800/80">
          <button 
            onClick={handlePrevMonth}
            className="p-2 text-gray-400 hover:text-white bg-gray-950/60 rounded-lg hover:bg-gray-900 border border-gray-800 transition-all"
            title="Previous Month"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-lg font-bold text-white min-w-[140px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          
          <button 
            onClick={handleNextMonth}
            className="p-2 text-gray-400 hover:text-white bg-gray-950/60 rounded-lg hover:bg-gray-900 border border-gray-800 transition-all"
            title="Next Month"
          >
            <ChevronRight size={20} />
          </button>

          <div className="h-6 w-[1px] bg-gray-800 mx-1" />

          <button 
            onClick={handleGoToToday}
            className="px-3.5 py-1.5 bg-accent text-black text-xs font-bold rounded-lg hover:bg-yellow-400 transition-all"
          >
            Today
          </button>
        </div>
      </header>

      {/* Weekdays Labels Header */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-[-8px] px-1">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 flex-1 w-full min-h-[500px]">
        {calendarDays.map((day) => {
          const dayTasks = tasksByDate[day.dateStr] || [];
          const isToday = day.dateStr === todayStr;
          
          return (
            <div 
              key={day.dateStr}
              onClick={() => setSelectedDateStr(day.dateStr)}
              className={`bg-surface/50 hover:bg-surface border rounded-xl p-2.5 flex flex-col justify-between items-stretch transition-all cursor-pointer group relative overflow-hidden min-h-[100px] ${
                isToday ? 'border-accent shadow-[0_0_15px_rgba(255,215,0,0.1)] bg-accent/5' : 
                day.isCurrentMonth ? 'border-gray-800' : 'border-gray-900 opacity-40'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-black font-mono leading-none ${isToday ? 'text-accent' : 'text-gray-300'}`}>
                  {day.dayNum}
                </span>

                {/* Inline plus button visible on hover */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDateStr(day.dateStr);
                  }}
                  className="p-1 rounded bg-black/60 text-gray-500 group-hover:text-accent hover:bg-black opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Add task"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Tasks List inside Day Cell */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar select-none z-10 max-h-[85px]">
                {dayTasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTask(task.id, task.completed);
                    }}
                    className={`flex items-center justify-between gap-1 p-1 rounded text-[10px] font-bold border transition-all ${
                      task.completed 
                        ? 'bg-black/30 border-gray-900 text-gray-600 line-through' 
                        : task.type === 'Focus' 
                          ? 'bg-blue-950/20 border-blue-900/30 text-blue-400 hover:bg-blue-950/40' 
                          : 'bg-green-950/20 border-green-900/30 text-green-400 hover:bg-green-950/40'
                    }`}
                    title={`${task.title} (${task.durationMinutes}m) - Click to toggle completion`}
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.completed ? 'bg-gray-600' : task.type === 'Focus' ? 'bg-blue-400' : 'bg-green-400'}`} />
                      <span className="truncate">{task.title}</span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete task "${task.title}"?`)) {
                          deleteTask(task.id);
                        }
                      }}
                      className="text-gray-600 hover:text-red-500 opacity-0 group-hover/task:opacity-100 p-0.5 rounded transition-opacity shrink-0"
                      title="Delete Task"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Day glow background decoration */}
              {isToday && (
                <div className="absolute top-0 right-0 w-12 h-12 bg-accent opacity-5 rounded-bl-full pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple Helper Icon since X is not directly exported in some icons list
function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
