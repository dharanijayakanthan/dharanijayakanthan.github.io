import { useState, useEffect } from 'react';
import { format, isToday } from 'date-fns';
import { Settings, LogOut } from 'lucide-react';

import { useHabitStore } from '../lib/habitStore';
import { HabitLayout } from '../components/habits/HabitLayout';
import { WeeklyView } from '../components/habits/WeeklyView';
import { HabitItem } from '../components/habits/HabitItem';
import { GoalConsistencyChart } from '../components/habits/GoalConsistencyChart';
import { UserLogin } from '../components/habits/UserLogin';
import { SettingsPanel } from '../components/habits/SettingsPanel';
import { CompletionModal } from '../components/habits/CompletionModal';

export const HabitTracker = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const { currentUser, users, toggleHabit, logout } = useHabitStore();

    // Derived state
    const userData = currentUser ? users[currentUser] : null;
    const habits = userData?.habits || [];
    const completions = userData?.completions || {};

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
        setTimeout(() => {
            const isNowComplete = useHabitStore.getState().isDayComplete(dateStr);
            if (isNowComplete && isToday(selectedDate)) {
                setShowConfetti(true);
            }
        }, 100);
    };

    if (!currentUser) {
        return (
            <HabitLayout>
                <UserLogin />
            </HabitLayout>
        );
    }

    return (
        <HabitLayout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

                {/* Left Column: Controls & Daily Checklist */}
                <div className="lg:col-span-5 flex flex-col gap-8 h-full">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <h1 className="text-4xl sm:text-5xl font-handwriting font-bold text-stone-800 dark:text-stone-100 tracking-tight">
                                My Journal
                            </h1>
                            <span className="text-stone-400 dark:text-slate-500 font-medium ml-1">
                                Hello, {currentUser}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-3 bg-stone-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-all text-stone-600 dark:text-stone-300 shadow-sm"
                                aria-label="Settings"
                                title="Settings"
                            >
                                <Settings size={20} />
                            </button>
                            <button
                                onClick={logout}
                                className="p-3 bg-stone-100 dark:bg-slate-800 rounded-full hover:bg-stone-200 dark:hover:bg-slate-700 transition-all text-stone-600 dark:text-stone-300 shadow-sm"
                                aria-label="Log out"
                                title="Log out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>

                    <WeeklyView selectedDate={selectedDate} onDateSelect={setSelectedDate} />

                    <div className="flex-1 bg-white dark:bg-slate-900/50 rounded-3xl p-6 shadow-sm border border-stone-100 dark:border-slate-800">
                        <h3 className="text-xl font-bold mb-6 text-stone-700 dark:text-stone-200 flex items-center gap-2">
                            <span>Goals for {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM do')}</span>
                            <span className="text-xs font-normal text-stone-400 bg-stone-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                {dayHabits.filter(h => completions[dateStr]?.[h.id]).length}/{dayHabits.length}
                            </span>
                        </h3>

                        <div className="space-y-3">
                            {dayHabits.map(habit => (
                                <HabitItem
                                    key={habit.id}
                                    habit={habit}
                                    isCompleted={completions[dateStr]?.[habit.id] || false}
                                    onToggle={() => handleToggle(habit.id)}
                                    enableEdit={false}
                                />
                            ))}
                            {dayHabits.length === 0 && (
                                <div className="text-center p-8 bg-stone-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-stone-300 dark:border-slate-700 text-stone-400">
                                    No habits set for today. <br />
                                    <button onClick={() => setIsSettingsOpen(true)} className="text-indigo-500 underline mt-2 font-bold">Add some goals</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Analytics */}
                <div className="lg:col-span-7 space-y-6">
                    <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-2">
                        Consistency & History
                    </h3>

                    {habits.length === 0 ? (
                         <div className="text-center p-12 bg-stone-50 dark:bg-slate-900 rounded-3xl border border-stone-100 dark:border-slate-800 text-stone-400">
                            Start adding habits to see your progress charts here.
                        </div>
                    ) : (
                        habits.map(habit => (
                            <GoalConsistencyChart
                                key={habit.id}
                                habitId={habit.id}
                                habitName={habit.name}
                            />
                        ))
                    )}
                </div>
            </div>

            <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <CompletionModal isOpen={showConfetti} onClose={() => setShowConfetti(false)} />
        </HabitLayout>
    );
};
