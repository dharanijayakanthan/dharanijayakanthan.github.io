import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Habit {
  id: string;
  name: string;
  createdAt: number;
}

interface HabitState {
  habits: Habit[];
  completions: Record<string, Record<string, boolean>>; // date (YYYY-MM-DD) -> { habitId: boolean }
  theme: 'light' | 'dark';

  // Actions
  addHabit: (name: string) => void;
  removeHabit: (id: string) => void;
  updateHabit: (id: string, name: string) => void;
  toggleHabit: (date: string, habitId: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Getters (Selectors can be used, but helper functions are also fine)
  getCompletionPercentage: (date: string) => number;
  isDayComplete: (date: string) => boolean;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [
        { id: '1', name: 'Meditate', createdAt: Date.now() },
        { id: '2', name: 'Walk', createdAt: Date.now() },
        { id: '3', name: 'Prepare for interview', createdAt: Date.now() },
      ],
      completions: {},
      theme: 'light',

      addHabit: (name) =>
        set((state) => ({
          habits: [
            ...state.habits,
            { id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15), name, createdAt: Date.now() },
          ],
        })),

      removeHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          // Optional: Clean up completions for this habit?
          // Keeping them might be better for history if we ever restore it,
          // but for now let's just leave them as they are harmless.
        })),

      updateHabit: (id, name) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, name } : h
          ),
        })),

      toggleHabit: (date, habitId) =>
        set((state) => {
          const dateCompletions = state.completions[date] || {};
          const isCompleted = dateCompletions[habitId];

          return {
            completions: {
              ...state.completions,
              [date]: {
                ...dateCompletions,
                [habitId]: !isCompleted,
              },
            },
          };
        }),

      setTheme: (theme) => set({ theme }),

      getCompletionPercentage: (date) => {
        const state = get();
        const activeHabits = state.habits;
        if (activeHabits.length === 0) return 0;

        const dateCompletions = state.completions[date] || {};
        const completedCount = activeHabits.reduce((count, habit) => {
          return count + (dateCompletions[habit.id] ? 1 : 0);
        }, 0);

        return Math.round((completedCount / activeHabits.length) * 100);
      },

      isDayComplete: (date) => {
        const state = get();
        const activeHabits = state.habits;
        if (activeHabits.length === 0) return false;

        const dateCompletions = state.completions[date] || {};
        return activeHabits.every((habit) => dateCompletions[habit.id]);
      },
    }),
    {
      name: 'habit-storage',
    }
  )
);
