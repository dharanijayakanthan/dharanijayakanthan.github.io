import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Expense {
    Date: string;
    Restaurant: string;
    Items: string[];
    Cost: number;
}

interface ExpenseState {
    theme: 'light' | 'dark';
    expenses: Expense[];
    isLoading: boolean;
    error: string | null;

    setTheme: (theme: 'light' | 'dark') => void;
    fetchExpenses: () => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>()(
    persist(
        (set) => ({
            theme: 'light',
            expenses: [],
            isLoading: false,
            error: null,

            setTheme: (theme) => set({ theme }),

            fetchExpenses: async () => {
                set({ isLoading: true, error: null });
                try {
                    // Use import.meta.env.BASE_URL to handle relative paths if configured in Vite
                    const baseUrl = import.meta.env.BASE_URL;
                    const url = `${baseUrl}zom-order.json`.replace('//', '/');
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error('Failed to fetch expenses data');
                    }
                    const data = await response.json();
                    set({ expenses: data, isLoading: false });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    });
                }
            },
        }),
        {
            name: 'expense-storage',
            partialize: (state) => ({ theme: state.theme }), // Only persist theme
        }
    )
);
