import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { Expense } from '../../lib/expenseStore';

interface ExpensePieChartProps {
    expenses: Expense[];
}

const COLORS = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6',
    '#f97316', '#84cc16', '#06b6d4', '#d946ef'
];

export const ExpensePieChart = ({ expenses }: ExpensePieChartProps) => {
    const { data, type } = useMemo(() => {
        if (expenses.length === 0) return { data: [], type: 'None' };

        const years = Array.from(new Set(expenses.map(e => format(parseISO(e.Date), 'yyyy'))));
        const isMultiYear = years.length > 1;

        const groupedData: Record<string, number> = {};

        expenses.forEach(e => {
            const date = parseISO(e.Date);
            const key = isMultiYear
                ? format(date, 'yyyy')
                : format(date, 'MMMM'); // Full month name

            groupedData[key] = (groupedData[key] || 0) + e.Cost;
        });

        // Convert to array and sort
        const chartData = Object.entries(groupedData)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => isMultiYear ? a.name.localeCompare(b.name) : 0); // Sort years, months maybe by index?

        // If months, we might want to sort by month index
        if (!isMultiYear) {
            const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            chartData.sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));
        }

        return { data: chartData, type: isMultiYear ? 'Yearly' : 'Monthly' };
    }, [expenses]);

    if (expenses.length === 0) {
        return (
            <div className="bg-white dark:bg-stone-900/50 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 h-[400px] flex items-center justify-center text-stone-400">
                No data to display
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-stone-900/50 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 h-[400px]">
            <h3 className="text-xl font-handwriting font-bold mb-2 text-stone-700 dark:text-stone-300">
                {type} Spending Distribution
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
