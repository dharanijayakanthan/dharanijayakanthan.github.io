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

    // Filters
    selectedYears: string[];
    selectedMonths: string[];

    // Actions
    setTheme: (theme: 'light' | 'dark') => void;
    fetchExpenses: () => Promise<void>;
    setSelectedYears: (years: string[]) => void;
    setSelectedMonths: (months: string[]) => void;
    resetFilters: () => void;
}

export const useExpenseStore = create<ExpenseState>()(
    persist(
        (set) => ({
            theme: 'light',
            expenses: [],
            isLoading: false,
            error: null,
            selectedYears: [],
            selectedMonths: [],

            setTheme: (theme) => set({ theme }),

            fetchExpenses: async () => {
                set({ isLoading: true, error: null });
                try {
                    const baseUrl = import.meta.env.BASE_URL || '/';
                    // Ensure the URL is constructed correctly with base
                    // If BASE_URL is './', we might need to handle it.
                    // Assuming similar logic to previous file, but cleaner.
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

            setSelectedYears: (years) => set({ selectedYears: years }),
            setSelectedMonths: (months) => set({ selectedMonths: months }),
            resetFilters: () => set({ selectedYears: [], selectedMonths: [] }),
        }),
        {
            name: 'expense-storage',
            partialize: (state) => ({ theme: state.theme }), // Only persist theme
        }
    )
);
