import { useState, useMemo } from 'react';
import { format, parseISO, getHours, startOfDay, endOfDay } from 'date-fns';
import { useExpenseStore } from '../../lib/expenseStore';
import { FilterBar } from './FilterBar';
import { SummaryCards } from './SummaryCards';
import { ExpenseCharts } from './ExpenseCharts';
import { OrderList } from './OrderList';

export const ExpenseDashboard = () => {
    const { expenses, isLoading } = useExpenseStore();

    // Filters state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [isNightTime, setIsNightTime] = useState(false);

    // Derived data for filters
    const availableYears = useMemo(() => {
        const years = new Set(expenses.map(e => format(parseISO(e.Date), 'yyyy')));
        return Array.from(years).sort().reverse();
    }, [expenses]);

    // Filter Logic
    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            const date = parseISO(exp.Date);

            // Date Range
            if (startDate) {
                if (date < startOfDay(parseISO(startDate))) return false;
            }
            if (endDate) {
                if (date > endOfDay(parseISO(endDate))) return false;
            }

            // Month
            if (selectedMonth) {
                // Month is 1-based string
                if ((date.getMonth() + 1).toString() !== selectedMonth) return false;
            }

            // Year
            if (selectedYear) {
                if (format(date, 'yyyy') !== selectedYear) return false;
            }

            // Night Time (11 PM - 6 AM)
            if (isNightTime) {
                const hour = getHours(date);
                // Night is 23, 0, 1, 2, 3, 4, 5
                if (!(hour >= 23 || hour < 6)) return false;
            }

            return true;
        });
    }, [expenses, startDate, endDate, selectedMonth, selectedYear, isNightTime]);

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setSelectedMonth('');
        setSelectedYear('');
        setIsNightTime(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <header>
                <h1 className="text-4xl sm:text-5xl font-handwriting font-bold text-stone-800 dark:text-stone-100 tracking-tight mb-2">
                    Expense Tracker
                </h1>
                <p className="text-stone-500 dark:text-slate-400">
                    Analyze your food delivery expenses and spending habits.
                </p>
            </header>

            <FilterBar
                startDate={startDate}
                endDate={endDate}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                isNightTime={isNightTime}
                availableYears={availableYears}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
                onNightTimeToggle={() => setIsNightTime(!isNightTime)}
                onReset={handleReset}
            />

            <SummaryCards expenses={filteredExpenses} />

            <ExpenseCharts expenses={filteredExpenses} />

            <OrderList expenses={filteredExpenses} />
        </div>
    );
};
