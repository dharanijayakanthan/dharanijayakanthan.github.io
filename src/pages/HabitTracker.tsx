import { useState, useEffect } from 'react';
import { format, isToday } from 'date-fns';
import { Settings } from 'lucide-react';

import { useHabitStore } from '../lib/habitStore';
import { HabitLayout } from '../components/habits/HabitLayout';
import { WeeklyView } from '../components/habits/WeeklyView';
import { HabitItem } from '../components/habits/HabitItem';
import { Heatmap } from '../components/habits/Heatmap';
import { SettingsPanel } from '../components/habits/SettingsPanel';
import { CompletionModal } from '../components/habits/CompletionModal';

export const HabitTracker = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const { habits, completions, toggleHabit, isDayComplete } = useHabitStore();

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayHabits = habits; // All habits are daily for now

    // Close confetti when selecting a new date
    useEffect(() => {
        setShowConfetti(false);
    }, [selectedDate]);

    const handleToggle = (habitId: string) => {
        // Toggle the habit
        toggleHabit(dateStr, habitId);

        // Check for completion immediately after update
        // We use setTimeout to allow state to propagate if needed, though zustand is sync.
        // Also gives a slight delay for the check animation to start.
        setTimeout(() => {
            const isNowComplete = useHabitStore.getState().isDayComplete(dateStr);
            if (isNowComplete && isToday(selectedDate)) {
                 setShowConfetti(true);
            }
        }, 100);
    };

    return (
        <HabitLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-handwriting font-bold text-stone-800 dark:text-stone-100 tracking-tight">
                    My Journal
                </h1>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-3 bg-stone-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-all text-stone-600 dark:text-stone-300 shadow-sm"
                    aria-label="Settings"
                >
                    <Settings size={24} />
                </button>
            </div>

            <WeeklyView selectedDate={selectedDate} onDateSelect={setSelectedDate} />

            <div className="flex-1 mb-12">
                <h3 className="text-xl font-bold mb-4 text-stone-700 dark:text-stone-200">
                    Goals for {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMMM do')}
                </h3>

                <div className="space-y-3">
                    {dayHabits.map(habit => (
                        <HabitItem
                            key={habit.id}
                            habit={habit}
                            isCompleted={completions[dateStr]?.[habit.id] || false}
                            onToggle={() => handleToggle(habit.id)}
                            enableEdit={false} // Edit via settings
                        />
                    ))}
                    {dayHabits.length === 0 && (
                         <div className="text-center p-8 bg-stone-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-stone-300 dark:border-slate-700 text-stone-400">
                            No habits set for today. <br/>
                            <button onClick={() => setIsSettingsOpen(true)} className="text-indigo-500 underline mt-2 font-bold">Add some goals</button>
                         </div>
                    )}
                </div>
            </div>

            <div className="mt-auto">
                <Heatmap />
            </div>

            <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <CompletionModal isOpen={showConfetti} onClose={() => setShowConfetti(false)} />
        </HabitLayout>
    );
};
