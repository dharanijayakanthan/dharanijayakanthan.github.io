import { create } from 'zustand';

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
  userId: number | null; // Database ID
  users: Record<string, UserData>; // Local cache

  // Actions
  login: (username: string) => Promise<void>;
  logout: () => void;

  addHabit: (name: string) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  updateHabit: (id: string, name: string) => Promise<void>;
  toggleHabit: (date: string, habitId: string) => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;

  // Getters
  getCompletionPercentage: (date: string) => number;
  isDayComplete: (date: string) => boolean;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  currentUser: null,
  userId: null,
  users: {},

  login: async (username) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const userData = await res.json();

      const currentUsername = userData.username;
      const currentUserId = userData.id;

      // Fetch habits
      const habitsRes = await fetch(`/api/habits?userId=${currentUserId}`);
      const habitsData = await habitsRes.json();

      // Transform API response
      const habits: Habit[] = habitsData.map((h: any) => ({
        id: h.id,
        name: h.name,
        createdAt: h.created_at || Date.now()
      }));

      const completions: Record<string, Record<string, boolean>> = {};
      habitsData.forEach((h: any) => {
        if (h.completedDates) {
           h.completedDates.forEach((date: string) => {
             if (!completions[date]) completions[date] = {};
             completions[date][h.id] = true;
           });
        }
        // Also handle legacy `completions` object if API changed
        if (h.completions) {
             Object.keys(h.completions).forEach(date => {
                if (!completions[date]) completions[date] = {};
                completions[date][h.id] = true;
             });
        }
      });

      set((state) => ({
        currentUser: currentUsername,
        userId: currentUserId,
        users: {
          ...state.users,
          [currentUsername]: {
            habits,
            completions,
            theme: 'light' // Default, TODO: fetch settings
          }
        }
      }));

    } catch (err) {
      console.error('Login failed:', err);
    }
  },

  logout: () => set({ currentUser: null, userId: null }),

  addHabit: async (name) => {
    const { userId, currentUser } = get();
    if (!userId || !currentUser) return;

    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name }),
      });
      const newHabit = await res.json();

      set((state) => {
        const userData = state.users[currentUser];
        return {
          users: {
            ...state.users,
            [currentUser]: {
              ...userData,
              habits: [...userData.habits, { id: newHabit.id, name: newHabit.name, createdAt: newHabit.createdAt }],
            },
          },
        };
      });
    } catch (err) {
      console.error('Add habit failed:', err);
    }
  },

  removeHabit: async (id) => {
    const { currentUser } = get();
    if (!currentUser) return;

    // Optimistic update
    set((state) => {
        const userData = state.users[currentUser];
        return {
          users: {
            ...state.users,
            [currentUser]: {
              ...userData,
              habits: userData.habits.filter((h) => h.id !== id),
            },
          },
        };
    });

    try {
        await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    } catch (err) {
        console.error('Remove habit failed:', err);
    }
  },

  updateHabit: async (id, name) => {
    const { currentUser } = get();
    if (!currentUser) return;

    set((state) => {
        const userData = state.users[currentUser];
        return {
          users: {
            ...state.users,
            [currentUser]: {
              ...userData,
              habits: userData.habits.map((h) =>
                h.id === id ? { ...h, name } : h
              ),
            },
          },
        };
    });

    try {
        await fetch(`/api/habits/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
    } catch (err) {
        console.error('Update habit failed:', err);
    }
  },

  toggleHabit: async (date, habitId) => {
    const { currentUser } = get();
    if (!currentUser) return;

    set((state) => {
        const userData = state.users[currentUser];
        const dateCompletions = userData.completions[date] || {};
        const isCompleted = dateCompletions[habitId];

        return {
          users: {
            ...state.users,
            [currentUser]: {
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
    });

    try {
        await fetch(`/api/habits/${habitId}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date }),
        });
    } catch (err) {
        console.error('Toggle habit failed:', err);
    }
  },

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
}));
