import ReactConfetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, Trophy } from 'lucide-react';

interface CompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MESSAGES = [
    "You're on fire! 🔥",
    "Unstoppable! 🚀",
    "Daily Goal Crushed! 💥",
    "Legendary Consistency! 🏆",
    "One Step Closer! ✨",
    "You Did It! 🎉",
    "Keep The Streak Alive! ⚡"
];

export const CompletionModal = ({ isOpen, onClose }: CompletionModalProps) => {
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);

        if (isOpen) {
            setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
            // Auto close after 4 seconds
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }

        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <ReactConfetti
                        width={windowSize.width}
                        height={windowSize.height}
                        numberOfPieces={500}
                        recycle={false}
                        gravity={0.2}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -50 }}
                        className="bg-white dark:bg-slate-900 border-4 border-amber-400 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 pointer-events-auto max-w-sm mx-4 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

                        <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full text-amber-500 mb-2">
                            <Trophy size={48} />
                        </div>

                        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                            DAY COMPLETE!
                        </h2>

                        <p className="text-xl font-handwriting text-slate-600 dark:text-slate-300 transform -rotate-2">
                            {message}
                        </p>

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
