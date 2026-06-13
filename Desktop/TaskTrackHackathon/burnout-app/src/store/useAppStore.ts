import { create } from 'zustand';

export type TaskType = 'Focus' | 'Recharge';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  isRecurring: boolean;
  completed: boolean;
  durationMinutes: number;
  reward: number; // Added
}

export interface DayStats {
  date: string; // YYYY-MM-DD
  focus_minutes: number;
  recharge_minutes: number;
  break_intervals: number[]; // Array of focus minutes before a manual pause/break
}

export interface BurnoutInsight {
  detected_emotion: string;
  pattern_diagnosed: string;
  burnout_score: number;
  action_directive: string;
  timestamp: number;
}

interface AppState {
  tasks: Task[];
  recentHistory: DayStats[];
  latestInsight: BurnoutInsight | null;
  insightHistory: BurnoutInsight[];
  
  // Continuous Timer State
  isFocusing: boolean;
  focusSeconds: number;
  activeTaskId: string | null;

  // Adaptive Stamina System
  burnoutTimeLimit: number; // in minutes

  addTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  updateStats: (type: TaskType, minutes: number) => void;
  recordBreakInterval: (minutes: number) => void;
  setLatestInsight: (insight: BurnoutInsight) => void;
  
  setIsFocusing: (val: boolean) => void;
  setFocusSeconds: (val: number | ((prev: number) => number)) => void;
  setActiveTaskId: (id: string | null) => void;
  resetTimer: () => void;
  
  adjustBurnoutLimit: (changeMinutes: number) => void;
  setBurnoutTimeLimit: (minutes: number) => void;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const useAppStore = create<AppState>((set) => ({
  tasks: [],
  recentHistory: [
    { date: getTodayDateString(), focus_minutes: 0, recharge_minutes: 0, break_intervals: [] }
  ],
  latestInsight: null,
  insightHistory: [],

  isFocusing: false,
  focusSeconds: 0,
  activeTaskId: null,

  burnoutTimeLimit: 30, // Default 30 minutes

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  deleteTask: (id) => set((state) => ({ 
    tasks: state.tasks.filter(t => t.id !== id),
    activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
    isFocusing: state.activeTaskId === id ? false : state.isFocusing
  })),

  toggleTaskCompletion: (id) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  })),

  updateStats: (type, minutes) => set((state) => {
    const today = getTodayDateString();
    const historyCopy = [...state.recentHistory];
    let todayStats = historyCopy.find(h => h.date === today);

    if (!todayStats) {
      todayStats = { date: today, focus_minutes: 0, recharge_minutes: 0, break_intervals: [] };
      historyCopy.push(todayStats);
    }

    if (type === 'Focus') {
      todayStats.focus_minutes += minutes;
    } else {
      todayStats.recharge_minutes += minutes;
    }

    return { recentHistory: historyCopy };
  }),

  recordBreakInterval: (minutes) => set((state) => {
    if (minutes < 1) return state; // Ignore very short accidental pauses
    const today = getTodayDateString();
    const historyCopy = [...state.recentHistory];
    let todayStats = historyCopy.find(h => h.date === today);
    if (!todayStats) {
      todayStats = { date: today, focus_minutes: 0, recharge_minutes: 0, break_intervals: [] };
      historyCopy.push(todayStats);
    }
    todayStats.break_intervals.push(minutes);
    return { recentHistory: historyCopy };
  }),

  setLatestInsight: (insight) => set((state) => ({
    latestInsight: insight,
    insightHistory: [...state.insightHistory, insight]
  })),

  setIsFocusing: (val) => set({ isFocusing: val }),
  
  setFocusSeconds: (val) => set((state) => ({ 
    focusSeconds: typeof val === 'function' ? val(state.focusSeconds) : val 
  })),

  setActiveTaskId: (id) => set({ activeTaskId: id }),

  resetTimer: () => set({ focusSeconds: 0, isFocusing: false, activeTaskId: null }),

  adjustBurnoutLimit: (changeMinutes) => set((state) => ({
    burnoutTimeLimit: Math.max(5, state.burnoutTimeLimit + changeMinutes) // Minimum limit of 5 mins
  })),
  
  setBurnoutTimeLimit: (minutes) => set({ burnoutTimeLimit: minutes }),
}));
