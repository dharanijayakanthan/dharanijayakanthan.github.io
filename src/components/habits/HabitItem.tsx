import { motion, useAnimation } from 'framer-motion';
import { Check, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useHabitStore } from '../../lib/habitStore';

interface HabitItemProps {
    habit: { id: string; name: string };
    isCompleted: boolean;
    onToggle: () => void;
    enableEdit?: boolean;
}

export const HabitItem = ({ habit, isCompleted, onToggle, enableEdit = false }: HabitItemProps) => {
    const controls = useAnimation();
    const { removeHabit, updateHabit } = useHabitStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(habit.name);

    const handleCheck = async () => {
        if (!isCompleted) {
            await controls.start({
                scale: [1, 1.2, 0.9, 1.1, 1],
                transition: { type: 'spring', stiffness: 500, damping: 15 }
            });
        }
        onToggle();
    };

    const handleSave = () => {
        if (editName.trim()) {
            updateHabit(habit.id, editName.trim());
            setIsEditing(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`
                group flex items-center justify-between p-4 mb-3 rounded-2xl border-2 transition-all cursor-pointer select-none
                ${isCompleted
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                    : 'bg-white border-stone-100 dark:bg-slate-900 dark:border-slate-800 hover:border-stone-200 dark:hover:border-slate-700 shadow-sm'}
            `}
            onClick={isEditing ? undefined : handleCheck}
        >
            <div className="flex items-center gap-4 flex-1">
                <motion.div
                    animate={controls}
                    className={`
                        w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                        ${isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-transparent border-stone-300 dark:border-slate-600 text-transparent group-hover:border-emerald-400'}
                    `}
                >
                    <Check size={18} strokeWidth={4} />
                </motion.div>

                {isEditing ? (
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        className="bg-transparent border-b border-stone-300 dark:border-slate-600 focus:outline-none w-full text-lg font-medium"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span
                        className={`
                            text-lg sm:text-xl font-medium transition-all
                            ${isCompleted
                                ? 'text-stone-400 dark:text-slate-500 line-through decoration-2 decoration-emerald-500/50'
                                : 'text-stone-700 dark:text-slate-200'}
                        `}
                    >
                        {habit.name}
                    </span>
                )}
            </div>

            {enableEdit && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-2 text-stone-400 hover:text-indigo-500 transition-colors"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Delete this habit?')) removeHabit(habit.id);
                        }}
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}
        </motion.div>
    );
};
