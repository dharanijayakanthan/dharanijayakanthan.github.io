import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useExpenseStore } from '../../lib/expenseStore';
import { FilterBar } from './FilterBar';
import { SummaryCards } from './SummaryCards';
import { ExpenseHeatmap } from './ExpenseHeatmap';
import { ExpensePieChart } from './ExpensePieChart';
import { OrderList } from './OrderList';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ExpenseDashboard = () => {
    const {
        expenses,
        isLoading,
        selectedYears,
        selectedMonths,
        setSelectedYears,
        setSelectedMonths,
        resetFilters
    } = useExpenseStore();

    // Derived data for filters
    const availableYears = useMemo(() => {
        const years = new Set(expenses.map(e => format(parseISO(e.Date), 'yyyy')));
        return Array.from(years).sort().reverse();
    }, [expenses]);

    // Filter Logic
    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            const date = parseISO(exp.Date);

            // Year Filter (Multi-select)
            // If empty selectedYears, treat as "All" OR treat as "None"?
            // User requested "dropdown for each year and one additional for all year".
            // Typically empty means "All" or explicit "All".
            // Let's assume if selectedYears is empty, we show all (default behavior often).
            // But user might want explicit selection.
            // If I default selectedYears to [] in store, it means "All" initially?
            // Or should I default to availableYears?
            // If I select "Clear All", it becomes empty.
            // If empty, show nothing? Or show all?
            // Usually, "Clear All" means show nothing in strict filtering, but "Reset" means show all.
            // Let's make empty = show all for better UX, or strictly follow "filter".
            // If I uncheck all years, showing nothing is correct.
            // But initial state is empty.
            // I'll make empty = All. But wait, user said "select 2025...".
            // If I default to All, then user has to unselect others?
            // With "Select All" button in MultiSelect, it's easy.
            // Let's make empty = All for now to avoid empty dashboard on load.
            const year = format(date, 'yyyy');
            if (selectedYears.length > 0 && !selectedYears.includes(year)) {
                return false;
            }

            // Month Filter (Multi-select)
            // Month is 1-based string '1'..'12' in our options.
            const month = (date.getMonth() + 1).toString();
            if (selectedMonths.length > 0 && !selectedMonths.includes(month)) {
                return false;
            }

            return true;
        });
    }, [expenses, selectedYears, selectedMonths]);

    const handleReset = () => {
        resetFilters();
    };

    // Top 5 Restaurants Logic (retained)
    const topRestaurants = useMemo(() => {
        const restaurantSpend: Record<string, number> = {};
        filteredExpenses.forEach(e => {
            restaurantSpend[e.Restaurant] = (restaurantSpend[e.Restaurant] || 0) + e.Cost;
        });
        return Object.entries(restaurantSpend)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredExpenses]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header>
                <h1 className="text-4xl sm:text-5xl font-handwriting font-bold text-stone-800 dark:text-stone-100 tracking-tight mb-2">
                    Expense Tracker
                </h1>
                <p className="text-stone-500 dark:text-slate-400">
                    Analyze your food delivery expenses and spending habits.
                </p>
            </header>

            <FilterBar
                selectedYears={selectedYears}
                selectedMonths={selectedMonths}
                availableYears={availableYears}
                onYearsChange={setSelectedYears}
                onMonthsChange={setSelectedMonths}
                onReset={handleReset}
            />

            <SummaryCards expenses={filteredExpenses} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribution Pie Chart */}
                <ExpensePieChart expenses={filteredExpenses} />

                {/* Top Restaurants (Retained) */}
                <div className="bg-white dark:bg-stone-900/50 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 h-[400px]">
                     <h3 className="text-xl font-handwriting font-bold mb-6 text-stone-700 dark:text-stone-300">Top 5 Restaurants by Spend</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={topRestaurants}
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Heatmap (Full Width) */}
            <ExpenseHeatmap expenses={filteredExpenses} />

            <OrderList expenses={filteredExpenses} />
        </div>
    );
};
