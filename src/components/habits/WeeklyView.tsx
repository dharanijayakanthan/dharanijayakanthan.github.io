import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useHabitStore } from '../../lib/habitStore';

interface WeeklyViewProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export const WeeklyView = ({ selectedDate, onDateSelect }: WeeklyViewProps) => {
    const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));
    const { isDayComplete } = useHabitStore();

    const handlePrevWeek = () => onDateSelect(addDays(selectedDate, -7));
    const handleNextWeek = () => onDateSelect(addDays(selectedDate, 7));

    return (
        <div className="flex flex-col gap-6 mb-8 w-full">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-3xl font-bold capitalize text-stone-800 dark:text-stone-100 tracking-tight">
                    {format(startOfCurrentWeek, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-1">
                    <button
                        onClick={handlePrevWeek}
                        className="p-3 hover:bg-stone-100 dark:hover:bg-white/10 rounded-full transition-colors active:scale-90"
                        aria-label="Previous Week"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleNextWeek}
                        className="p-3 hover:bg-stone-100 dark:hover:bg-white/10 rounded-full transition-colors active:scale-90"
                        aria-label="Next Week"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
                {weekDays.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isTodayDate = isToday(date);
                    const isComplete = isDayComplete(format(date, 'yyyy-MM-dd'));

                    return (
                        <motion.button
                            key={date.toISOString()}
                            onClick={() => onDateSelect(date)}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                flex flex-col items-center justify-center py-3 sm:py-4 rounded-2xl transition-all relative overflow-visible
                                ${isSelected
                                    ? 'bg-stone-800 text-white shadow-xl shadow-stone-200 dark:shadow-none dark:bg-indigo-600'
                                    : 'hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-600 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50'}
                                ${isTodayDate && !isSelected ? 'ring-2 ring-amber-400 dark:ring-indigo-400 ring-offset-2 dark:ring-offset-slate-950' : ''}
                            `}
                        >
                            <span className="text-xs sm:text-sm font-semibold uppercase opacity-60 mb-1">
                                {format(date, 'EEE')}
                            </span>
                            <span className={`text-lg sm:text-2xl font-bold ${isSelected ? 'scale-110' : ''}`}>
                                {format(date, 'd')}
                            </span>

                            {/* Completion Indicator */}
                            {isComplete && !isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900"
                                >
                                    <Check size={10} strokeWidth={4} />
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
