import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Habit {
  id: string;
  name: string;
  createdAt: number;
}

interface UserData {
  habits: Habit[];
  completions: Record<string, Record<string, boolean>>; // date (YYYY-MM-DD) -> { habitId: boolean }
  theme: 'light' | 'dark';
}

interface HabitState {
  currentUser: string | null;
  users: Record<string, UserData>;

  // Actions
  login: (username: string) => void;
  logout: () => void;

  addHabit: (name: string) => void;
  removeHabit: (id: string) => void;
  updateHabit: (id: string, name: string) => void;
  toggleHabit: (date: string, habitId: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Getters (Selectors can be used, but helper functions are also fine)
  getCompletionPercentage: (date: string) => number;
  isDayComplete: (date: string) => boolean;
}

const DEFAULT_USER_DATA: UserData = {
  habits: [
    { id: '1', name: 'Meditate', createdAt: Date.now() },
    { id: '2', name: 'Walk', createdAt: Date.now() },
    { id: '3', name: 'Prepare for interview', createdAt: Date.now() },
  ],
  completions: {},
  theme: 'light',
};

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: {},

      login: (username) => {
        const state = get();
        if (!state.users[username]) {
          // New user
          set((state) => ({
            currentUser: username,
            users: {
              ...state.users,
              [username]: { ...DEFAULT_USER_DATA },
            },
          }));
        } else {
          // Existing user
          set({ currentUser: username });
        }
      },

      logout: () => set({ currentUser: null }),

      addHabit: (name) =>
        set((state) => {
          const user = state.currentUser;
          if (!user) return state;

          const userData = state.users[user];
          const newHabit: Habit = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
            name,
            createdAt: Date.now()
          };

          return {
            users: {
              ...state.users,
              [user]: {
                ...userData,
                habits: [...userData.habits, newHabit],
              },
            },
          };
        }),

      removeHabit: (id) =>
        set((state) => {
          const user = state.currentUser;
          if (!user) return state;

          const userData = state.users[user];
          return {
            users: {
              ...state.users,
              [user]: {
                ...userData,
                habits: userData.habits.filter((h) => h.id !== id),
              },
            },
          };
        }),

      updateHabit: (id, name) =>
        set((state) => {
          const user = state.currentUser;
          if (!user) return state;

          const userData = state.users[user];
          return {
            users: {
              ...state.users,
              [user]: {
                ...userData,
                habits: userData.habits.map((h) =>
                  h.id === id ? { ...h, name } : h
                ),
              },
            },
          };
        }),

      toggleHabit: (date, habitId) =>
        set((state) => {
          const user = state.currentUser;
          if (!user) return state;

          const userData = state.users[user];
          const dateCompletions = userData.completions[date] || {};
          const isCompleted = dateCompletions[habitId];

          return {
            users: {
              ...state.users,
              [user]: {
                ...userData,
                completions: {
                  ...userData.completions,
                  [date]: {
                    ...dateCompletions,
                    [habitId]: !isCompleted,
                  },
                },
              },
            },
          };
        }),

      setTheme: (theme) =>
        set((state) => {
          const user = state.currentUser;
          if (!user) return state;

          const userData = state.users[user];
          return {
            users: {
              ...state.users,
              [user]: {
                ...userData,
                theme,
              },
            },
          };
        }),

      getCompletionPercentage: (date) => {
        const state = get();
        const user = state.currentUser;
        if (!user) return 0;

        const userData = state.users[user];
        const activeHabits = userData.habits;
        if (activeHabits.length === 0) return 0;

        const dateCompletions = userData.completions[date] || {};
        const completedCount = activeHabits.reduce((count, habit) => {
          return count + (dateCompletions[habit.id] ? 1 : 0);
        }, 0);

        return Math.round((completedCount / activeHabits.length) * 100);
      },

      isDayComplete: (date) => {
        const state = get();
        const user = state.currentUser;
        if (!user) return false;

        const userData = state.users[user];
        const activeHabits = userData.habits;
        if (activeHabits.length === 0) return false;

        const dateCompletions = userData.completions[date] || {};
        return activeHabits.every((habit) => dateCompletions[habit.id]);
      },
    }),
    {
      name: 'habit-storage-v2', // Changed storage key to force migration/reset
      version: 1,
    }
  )
);
