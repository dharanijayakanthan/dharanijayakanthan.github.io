import { eachDayOfInterval, endOfWeek, format, startOfWeek, subWeeks, isSameDay, isToday } from 'date-fns';
import { useHabitStore } from '../../lib/habitStore';
import { motion } from 'framer-motion';

export const Heatmap = () => {
    const { isDayComplete, getCompletionPercentage } = useHabitStore();

    // Generate last 20 weeks for mobile, maybe more for desktop?
    // User said "horizontally scrollable".
    const today = new Date();
    const startDate = startOfWeek(subWeeks(today, 26), { weekStartsOn: 1 }); // 6 months
    const endDate = endOfWeek(today, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Group by week
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    days.forEach((day) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    return (
        <div className="w-full overflow-hidden">
            <h3 className="text-lg font-bold mb-4 text-stone-700 dark:text-stone-300">Consistency</h3>
            <div className="overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-1 min-w-max">
                    {weeks.map((week, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            {week.map((day) => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const isComplete = isDayComplete(dateStr);
                                const percentage = getCompletionPercentage(dateStr);
                                const isTodayDate = isToday(day);

                                // Determine color intensity based on percentage if not complete?
                                // User asked for "Day complete only when ALL goals achieved".
                                // But LeetCode usually has shades.
                                // Let's use shades of green based on percentage, but highlight "Complete" specially?
                                // Or stick to the requirement: "Marked complete only when all...".
                                // I'll use shades for partial progress, but "Complete" is the goal.

                                let colorClass = 'bg-stone-200 dark:bg-slate-800'; // Default empty
                                if (percentage > 0) colorClass = 'bg-emerald-200 dark:bg-emerald-900/40';
                                if (percentage > 40) colorClass = 'bg-emerald-300 dark:bg-emerald-800/60';
                                if (percentage > 70) colorClass = 'bg-emerald-400 dark:bg-emerald-600/80';
                                if (isComplete) colorClass = 'bg-emerald-500 dark:bg-emerald-500';

                                return (
                                    <motion.div
                                        key={day.toISOString()}
                                        whileHover={{ scale: 1.2 }}
                                        title={`${format(day, 'MMM d')}: ${percentage}%`}
                                        className={`
                                            w-3 h-3 sm:w-4 sm:h-4 rounded-sm transition-colors
                                            ${colorClass}
                                            ${isTodayDate ? 'ring-1 ring-amber-400 ring-offset-1 dark:ring-offset-slate-900' : ''}
                                        `}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mt-2">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-stone-200 dark:bg-slate-800" />
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
