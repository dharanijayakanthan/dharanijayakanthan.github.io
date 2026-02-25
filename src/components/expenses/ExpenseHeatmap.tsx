import { useMemo } from 'react';
import {
    eachDayOfInterval,
    endOfWeek,
    format,
    startOfWeek,
    parseISO,
    min,
    max,
    startOfYear,
    endOfYear
} from 'date-fns';
import { motion } from 'framer-motion';
import type { Expense } from '../../lib/expenseStore';

interface ExpenseHeatmapProps {
    expenses: Expense[];
    year?: string; // If specific year selected, show full year. If not, show range of data?
}

export const ExpenseHeatmap = ({ expenses }: ExpenseHeatmapProps) => {
    // 1. Determine Date Range
    const { startDate, endDate, dailyData } = useMemo(() => {
        if (expenses.length === 0) {
            const now = new Date();
            return {
                startDate: startOfWeek(startOfYear(now)),
                endDate: endOfWeek(endOfYear(now)),
                dailyData: {}
            };
        }

        const dates = expenses.map(e => parseISO(e.Date));
        const minDate = min(dates);
        const maxDate = max(dates);

        // Pad to full weeks
        const start = startOfWeek(minDate, { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(maxDate, { weekStartsOn: 1 });

        // Aggregate cost/count per day
        const data: Record<string, { count: number; cost: number }> = {};
        expenses.forEach(e => {
            const dateStr = format(parseISO(e.Date), 'yyyy-MM-dd');
            if (!data[dateStr]) {
                data[dateStr] = { count: 0, cost: 0 };
            }
            data[dateStr].count += 1;
            data[dateStr].cost += e.Cost;
        });

        return { startDate: start, endDate: end, dailyData: data };
    }, [expenses]);

    // 2. Generate Days
    const days = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [startDate, endDate]);

    // 3. Group by Week
    const weeks = useMemo(() => {
        const weeksArray: Date[][] = [];
        let currentWeek: Date[] = [];

        days.forEach((day) => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
        });
        // Push remaining days if any (shouldn't happen with start/end of week alignment)
        if (currentWeek.length > 0) weeksArray.push(currentWeek);

        return weeksArray;
    }, [days]);

    // 4. Color Scale Logic
    const getColor = (count: number) => {
        if (count === 0) return 'bg-stone-100 dark:bg-stone-800/50';
        // Simple scale based on count for now, or cost?
        // User said "if i have ordered or not".
        // Let's use count intensity.
        if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900/40';
        if (count <= 2) return 'bg-emerald-300 dark:bg-emerald-800/60';
        if (count <= 3) return 'bg-emerald-400 dark:bg-emerald-600/80';
        return 'bg-emerald-500 dark:bg-emerald-500';
    };

    return (
        <div className="w-full overflow-hidden bg-white dark:bg-stone-900/50 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
            <h3 className="text-xl font-handwriting font-bold mb-6 text-stone-700 dark:text-stone-300">
                Order Activity
            </h3>

            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-1 min-w-max">
                    {weeks.map((week, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            {week.map((day) => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const data = dailyData[dateStr];
                                const count = data?.count || 0;
                                const cost = data?.cost || 0;

                                return (
                                    <motion.div
                                        key={day.toISOString()}
                                        whileHover={{ scale: 1.2 }}
                                        title={`${format(day, 'MMM d, yyyy')}: ${count} orders (₹${cost.toFixed(0)})`}
                                        className={`
                                            w-3 h-3 rounded-sm transition-colors cursor-help
                                            ${getColor(count)}
                                        `}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-500 mt-4 justify-end">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-stone-100 dark:bg-stone-800/50" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/40" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800/60" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-600/80" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
};
