import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type ReactNode } from 'react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BentoTileProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const BentoTile = ({ children, className, onClick }: BentoTileProps) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      className={cn(
        "bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden relative group transition-all duration-300",
        "hover:shadow-xl hover:border-gray-200/50",
        className
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};
