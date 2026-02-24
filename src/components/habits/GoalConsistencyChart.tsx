import { useState } from 'react';
import {
    format,
    eachDayOfInterval,
    startOfYear,
    endOfYear,
    getMonth,
    startOfWeek,
    endOfWeek,
    isToday,
    getDay
} from 'date-fns';
import { motion } from 'framer-motion';
import { useHabitStore } from '../../lib/habitStore';
import { Calendar, BarChart2 } from 'lucide-react';

interface GoalConsistencyChartProps {
    habitId: string;
    habitName: string;
}

export const GoalConsistencyChart = ({ habitId, habitName }: GoalConsistencyChartProps) => {
    const [viewMode, setViewMode] = useState<'year' | 'week'>('year');
    const { currentUser, users } = useHabitStore();

    const userData = currentUser ? users[currentUser] : null;
    const completions = userData?.completions || {};

    const isCompleted = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return completions[dateStr]?.[habitId] || false;
    };

    const renderYearView = () => {
        const today = new Date();
        const start = startOfYear(today);
        const end = endOfYear(today);
        const days = eachDayOfInterval({ start, end });

        // Group by month
        const months: Date[][] = Array.from({ length: 12 }, () => []);
        days.forEach(day => {
            months[getMonth(day)].push(day);
        });

        return (
            <div className="overflow-x-auto pb-2 custom-scrollbar">
                <div className="flex gap-4 min-w-max">
                    {months.map((monthDays, monthIndex) => {
                        // Skip future months if empty? No, show whole year structure usually.
                        // But maybe only show up to current month?
                        // Let's show all for layout consistency.

                        // Padding for start of month to align days (Monday start)
                        const dayOfWeek = getDay(monthDays[0]); // 0 = Sunday
                        const paddingCount = (dayOfWeek + 6) % 7;
                        const padding = Array(paddingCount).fill(null);

                        return (
                            <div key={monthIndex} className="flex flex-col gap-1 min-w-[140px]">
                                <span className="text-xs font-bold text-stone-400 dark:text-slate-500 uppercase mb-1">
                                    {format(monthDays[0], 'MMMM')}
                                </span>
                                <div className="grid grid-cols-7 gap-1">
                                    {/* Day Headers (S M T W T F S) - optional but helpful */}
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                                        <div key={d} className="text-[0.5rem] text-center text-stone-300">{d}</div>
                                    ))}
                                    {padding.map((_, i) => <div key={`pad-${i}`} />)}
                                    {monthDays.map(day => {
                                        const active = isCompleted(day);
                                        const isTodayDate = isToday(day);

                                        return (
                                            <div
                                                key={day.toISOString()}
                                                title={format(day, 'yyyy-MM-dd')}
                                                className={`
                                                    w-2.5 h-2.5 rounded-[2px] transition-colors
                                                    ${active
                                                        ? 'bg-emerald-500 dark:bg-emerald-500'
                                                        : 'bg-stone-200 dark:bg-slate-800'}
                                                    ${isTodayDate ? 'ring-1 ring-amber-400 ring-offset-1 dark:ring-offset-slate-900' : ''}
                                                `}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(today, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start, end });

        return (
            <div className="grid grid-cols-7 gap-2">
                {days.map(day => {
                    const active = isCompleted(day);
                    const isTodayDate = isToday(day);

                    return (
                        <div key={day.toISOString()} className="flex flex-col items-center gap-2">
                            <span className="text-xs text-stone-400 dark:text-slate-500 uppercase font-bold">
                                {format(day, 'EEE')}
                            </span>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`
                                    w-full aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-colors
                                    ${active
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
                                        : 'bg-stone-100 dark:bg-slate-800 text-stone-400 dark:text-slate-600'}
                                    ${isTodayDate ? 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-slate-900' : ''}
                                `}
                            >
                                {format(day, 'd')}
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    {habitName}
                </h3>
                <div className="flex bg-stone-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('year')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'year' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-slate-500'}`}
                        title="Year View"
                    >
                        <Calendar size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('week')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'week' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-slate-500'}`}
                        title="Week View"
                    >
                        <BarChart2 size={16} />
                    </button>
                </div>
            </div>

            {viewMode === 'year' ? renderYearView() : renderWeekView()}
        </div>
    );
};
