import { type ReactNode, useState, useEffect } from 'react';
// import { NavLink } from 'react-router-dom';
// import { clsx, type ClassValue } from 'clsx';
// import { twMerge } from 'tailwind-merge';
import { Moon, Sun } from 'lucide-react';

// function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch (e) {
        // Fallback if localStorage access fails
        console.warn('LocalStorage access failed:', e);
        return false;
      }
    }
    return false;
  });
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('theme', 'dark');
      } catch (e) { /* ignore */ }
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('theme', 'light');
      } catch (e) { /* ignore */ }
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Theme Toggle Button - Fixed Bottom Right */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
        aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Dharani Jayakanthan. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
