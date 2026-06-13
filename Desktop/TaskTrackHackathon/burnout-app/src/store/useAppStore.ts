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

export interface Session {
  id: string;
  type: TaskType;
  durationMinutes: number;
  completedAt: string;
}

interface AppState {
  tasks: Task[];
  sessions: Session[];
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
  addSession: (session: Session) => void;
  deleteSession: (id: string) => void;
  updateSession: (id: string, durationMinutes: number) => void;
  generateMockSessions: () => void;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const useAppStore = create<AppState>((set) => ({
  tasks: [],
  sessions: [],
  recentHistory: [
    { date: getTodayDateString(), focus_minutes: 0, recharge_minutes: 0, break_intervals: [] }
  ],
  latestInsight: null,
  insightHistory: [],

  isFocusing: false,
  focusSeconds: 0,
  activeTaskId: null,

  burnoutTimeLimit: 1, // Default 1 minute for testing

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
  
  deleteSession: (id) => set((state) => ({ sessions: state.sessions.filter(s => s.id !== id) })),
  
  updateSession: (id, durationMinutes) => set((state) => ({
    sessions: state.sessions.map(s => s.id === id ? { ...s, durationMinutes } : s)
  })),

  generateMockSessions: () => set((state) => {
    const types: TaskType[] = ['Focus', 'Recharge'];
    const mockSessions: Session[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `mock-${Date.now()}-${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      durationMinutes: Math.floor(Math.random() * 45) + 15,
      completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
    // sort descending by completedAt
    const combined = [...mockSessions, ...state.sessions].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    return { sessions: combined };
  }),
  
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
