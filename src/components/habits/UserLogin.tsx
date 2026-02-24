import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Book } from 'lucide-react';
import { useHabitStore } from '../../lib/habitStore';

export const UserLogin = () => {
    const [name, setName] = useState('');
    const { login } = useHabitStore();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            login(name.trim());
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] dark:bg-slate-950 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-stone-100 dark:border-slate-800"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-amber-100 dark:bg-indigo-900/30 rounded-full text-amber-600 dark:text-indigo-400">
                        <Book size={48} />
                    </div>
                </div>

                <h1 className="text-3xl font-handwriting font-bold text-center text-stone-800 dark:text-stone-100 mb-2">
                    My Journal
                </h1>
                <p className="text-center text-stone-500 dark:text-stone-400 mb-8">
                    Enter your name to access your goals.
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="What's your name?"
                            className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-400 dark:focus:ring-indigo-500 outline-none transition-all placeholder:text-stone-400"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-stone-800 dark:bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-stone-900 dark:hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Start Tracking</span>
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-stone-400 dark:text-slate-600">
                    Your data is saved locally on this device.
                </div>
            </motion.div>
        </div>
    );
};
