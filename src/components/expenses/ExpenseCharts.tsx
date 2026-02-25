import { useMemo, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { format, parseISO, getHours } from 'date-fns';
import type { Expense } from '../../lib/expenseStore';

interface ExpenseChartsProps {
    expenses: Expense[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ExpenseCharts = ({ expenses }: ExpenseChartsProps) => {
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

    // 1. Monthly Data
    const monthlyData = useMemo(() => {
        const data: Record<string, number> = {};
        expenses.forEach(exp => {
            const date = parseISO(exp.Date);
            const monthKey = format(date, 'yyyy-MM'); // Sortable key
            data[monthKey] = (data[monthKey] || 0) + exp.Cost;
        });

        return Object.keys(data).sort().map(key => {
            const [y, m] = key.split('-');
            const date = new Date(parseInt(y), parseInt(m) - 1);
            return {
                name: format(date, 'MMM yyyy'),
                value: data[key]
            };
        });
    }, [expenses]);

    // 2. Yearly Data
    const yearlyData = useMemo(() => {
        const data: Record<string, number> = {};
        expenses.forEach(exp => {
            const date = parseISO(exp.Date);
            const yearKey = format(date, 'yyyy');
            data[yearKey] = (data[yearKey] || 0) + exp.Cost;
        });
        return Object.entries(data)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [expenses]);

    // 3. Night vs Day
    const timeData = useMemo(() => {
        let night = 0;
        let day = 0;
        expenses.forEach(exp => {
            const date = parseISO(exp.Date);
            const hour = getHours(date);
            // Night: 11pm (23) to 6am (0-5)
            if (hour >= 23 || hour < 6) {
                night += exp.Cost;
            } else {
                day += exp.Cost;
            }
        });
        return [
            { name: 'Day (6am - 11pm)', value: day },
            { name: 'Night (11pm - 6am)', value: night },
        ];
    }, [expenses]);

    // 4. Top Restaurants
    const restaurantData = useMemo(() => {
        const data: Record<string, number> = {};
        expenses.forEach(exp => {
            data[exp.Restaurant] = (data[exp.Restaurant] || 0) + exp.Cost;
        });
        return Object.entries(data)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [expenses]);

    if (expenses.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-stone-100 dark:border-slate-800 text-center text-stone-400">
                No data to display charts.
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-stone-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
                            {viewMode === 'monthly' ? 'Monthly' : 'Yearly'} Spending
                        </h3>
                        <div className="flex space-x-1 bg-stone-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('monthly')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'monthly' ? 'bg-white dark:bg-slate-600 shadow text-stone-800 dark:text-white' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setViewMode('yearly')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'yearly' ? 'bg-white dark:bg-slate-600 shadow text-stone-800 dark:text-white' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'}`}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>

                    <div className="h-64 flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart key={viewMode} data={viewMode === 'monthly' ? monthlyData : yearlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                                <XAxis dataKey="name" fontSize={12} stroke="#9ca3af" tick={{fill: '#9ca3af'}} />
                                <YAxis fontSize={12} stroke="#9ca3af" tick={{fill: '#9ca3af'}} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Time Split */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-stone-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Day vs Night Spending</h3>
                    <div className="h-64 flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={timeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="50%"
                                    outerRadius="70%"
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {timeData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Restaurants */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-stone-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Top 5 Restaurants by Spend</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={restaurantData} layout="vertical" margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                            <XAxis type="number" fontSize={12} stroke="#9ca3af" tick={{fill: '#9ca3af'}} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={180}
                                fontSize={11}
                                stroke="#9ca3af"
                                tick={{fill: '#9ca3af'}}
                                interval={0}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
