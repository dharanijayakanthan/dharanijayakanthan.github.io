import { useEffect } from 'react';
import { ExpenseLayout } from '../components/expenses/ExpenseLayout';
import { ExpenseDashboard } from '../components/expenses/ExpenseDashboard';
import { useExpenseStore } from '../lib/expenseStore';

export const ExpenseTracker = () => {
    const { fetchExpenses } = useExpenseStore();

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    return (
        <ExpenseLayout>
            <ExpenseDashboard />
        </ExpenseLayout>
    );
};
