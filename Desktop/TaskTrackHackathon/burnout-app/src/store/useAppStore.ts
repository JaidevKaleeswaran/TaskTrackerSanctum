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
  dueDate?: string; // YYYY-MM-DD for calendar support
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
  generateMockTasks: () => void;
  generateMockTrajectory: () => void;
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

  generateMockTasks: () => set((state) => {
    const todayStr = getTodayDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const mockTasks: Task[] = [
      { id: 'mock-t1', title: 'Complete Aegis Slideshow', type: 'Focus', isRecurring: false, completed: false, durationMinutes: 45, reward: 135, dueDate: todayStr },
      { id: 'mock-t2', title: 'Deep Breathing Session', type: 'Recharge', isRecurring: false, completed: false, durationMinutes: 15, reward: 15, dueDate: todayStr },
      { id: 'mock-t3', title: 'Refactor Village Canvas', type: 'Focus', isRecurring: false, completed: false, durationMinutes: 90, reward: 270, dueDate: yesterdayStr },
      { id: 'mock-t4', title: 'Hydrate & Stretch', type: 'Recharge', isRecurring: true, completed: false, durationMinutes: 5, reward: 5 },
      { id: 'mock-t5', title: 'Plan Next Week\'s Milestones', type: 'Focus', isRecurring: false, completed: false, durationMinutes: 60, reward: 180, dueDate: tomorrowStr }
    ];
    return { tasks: [...state.tasks, ...mockTasks] };
  }),

  generateMockTrajectory: () => set((state) => {
    const mockInsights: BurnoutInsight[] = [
      { detected_emotion: 'calm', pattern_diagnosed: 'Healthy Pacing', burnout_score: 30, action_directive: 'Maintain current rest schedules.', timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000 },
      { detected_emotion: 'tired', pattern_diagnosed: 'Linear Output', burnout_score: 45, action_directive: 'Take a break after focus sessions.', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
      { detected_emotion: 'exhausted', pattern_diagnosed: 'Overexertion Spike', burnout_score: 78, action_directive: 'High load detected. Step away from screen.', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
      { detected_emotion: 'recovering', pattern_diagnosed: 'Somatic Pacing Response', burnout_score: 55, action_directive: 'Recharge tasks logged. Recovery in progress.', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
      { detected_emotion: 'focused', pattern_diagnosed: 'Paced Flow State', burnout_score: 25, action_directive: 'Excellent pacing and recovery habits.', timestamp: Date.now() }
    ];
    return {
      latestInsight: mockInsights[mockInsights.length - 1],
      insightHistory: [...state.insightHistory, ...mockInsights]
    };
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
