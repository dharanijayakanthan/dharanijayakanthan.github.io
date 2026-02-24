import { useEffect } from 'react';
import { useHabitStore } from '../../lib/habitStore';
import { Moon, Sun } from 'lucide-react';



export const HabitLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme, setTheme } = useHabitStore();

  useEffect(() => {
    // Sync with store
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-slate-950 transition-colors duration-500 font-handwriting text-slate-800 dark:text-slate-200 selection:bg-amber-200 dark:selection:bg-indigo-500/30">
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border border-stone-200 dark:border-slate-800 hover:scale-110 active:scale-95 transition-all text-amber-600 dark:text-indigo-400"
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <main className="w-full max-w-xl mx-auto min-h-screen px-4 py-6 md:py-12 relative flex flex-col">
        {children}
      </main>
    </div>
  );
};
