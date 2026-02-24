import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useHabitStore } from '../../lib/habitStore';
import { createPortal } from 'react-dom';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
    const { habits, addHabit, removeHabit } = useHabitStore();
    const [newHabit, setNewHabit] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 640);
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleAdd = () => {
        if (newHabit.trim()) {
            addHabit(newHabit.trim());
            setNewHabit('');
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={isMobile ? { y: '100%' } : { x: '100%' }}
                        animate={isMobile ? { y: 0 } : { x: 0 }}
                        exit={isMobile ? { y: '100%' } : { x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`
                            fixed z-50 bg-white dark:bg-slate-900 shadow-2xl flex flex-col
                            ${isMobile
                                ? 'bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl'
                                : 'top-0 right-0 h-screen w-96 rounded-l-2xl'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-stone-100 dark:border-slate-800">
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                                <History className="text-indigo-500" />
                                Settings
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <h3 className="text-lg font-semibold mb-4 text-stone-600 dark:text-stone-300">Manage Habits</h3>

                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={newHabit}
                                    onChange={(e) => setNewHabit(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                    placeholder="Add new habit..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-stone-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-stone-400"
                                />
                                <button
                                    onClick={handleAdd}
                                    disabled={!newHabit.trim()}
                                    className="bg-indigo-600 disabled:bg-stone-300 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {habits.length === 0 && (
                                    <div className="text-center text-stone-400 py-8 italic">
                                        No habits tracked. Add one above!
                                    </div>
                                )}
                                {habits.map((habit) => (
                                    <motion.div
                                        layout
                                        key={habit.id}
                                        className="flex justify-between items-center p-4 bg-stone-50 dark:bg-slate-800/50 rounded-xl border border-stone-100 dark:border-slate-700/50"
                                    >
                                        <span className="font-medium text-stone-700 dark:text-stone-200">{habit.name}</span>
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this habit? This cannot be undone.')) removeHabit(habit.id);
                                            }}
                                            className="text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-amber-50 dark:bg-indigo-900/20 rounded-xl text-sm text-amber-800 dark:text-indigo-300 border border-amber-100 dark:border-indigo-800/30">
                                <p>Tip: Complete all habits to mark a day as "Perfect"!</p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
