import { create } from 'zustand';

export interface TimerData {
  id: string;
  selectedEsteira: string;
  selectedAnalista: string;
  observacao: string;
  isRunning: boolean;
  elapsedTime: number;
  startTime: number | null;
  horaInicioAbsoluta: number | null;
}

interface TimerStore {
  timers: TimerData[];
  addTimer: () => void;
  removeTimer: (id: string) => void;
  updateTimer: (id: string, data: Partial<TimerData>) => void;
  tick: () => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
  timers: [
    {
      id: '1',
      selectedEsteira: '',
      selectedAnalista: '',
      observacao: '',
      isRunning: false,
      elapsedTime: 0,
      startTime: null,
      horaInicioAbsoluta: null,
    }
  ],
  addTimer: () => set((state) => ({
    timers: [
      ...state.timers,
      {
        id: Math.random().toString(36).substr(2, 9),
        selectedEsteira: '',
        selectedAnalista: '',
        observacao: '',
        isRunning: false,
        elapsedTime: 0,
        startTime: null,
        horaInicioAbsoluta: null,
      }
    ]
  })),
  removeTimer: (id) => set((state) => ({
    timers: state.timers.filter(t => t.id !== id)
  })),
  updateTimer: (id, data) => set((state) => ({
    timers: state.timers.map(t => t.id === id ? { ...t, ...data } : t)
  })),
  tick: () => set((state) => ({
    timers: state.timers.map(t => t.isRunning && t.startTime ? {
      ...t,
      elapsedTime: Date.now() - t.startTime
    } : t)
  }))
}));
