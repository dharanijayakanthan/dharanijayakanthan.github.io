import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface MultiSelectOption {
    value: string;
    label: string;
}

interface MultiSelectProps {
    label: string;
    options: MultiSelectOption[];
    selected: string[];
    onChange: (values: string[]) => void;
    className?: string;
}

export const MultiSelect = ({
    label,
    options,
    selected,
    onChange,
    className
}: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleOption = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter(v => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const selectAll = () => {
        onChange(options.map(o => o.value));
    };

    const clearAll = () => {
        onChange([]);
    };

    const getButtonLabel = () => {
        if (selected.length === 0) return label;
        if (selected.length === options.length) return `All ${label}s`;
        if (selected.length === 1) {
            const opt = options.find(o => o.value === selected[0]);
            return opt ? opt.label : label;
        }
        return `${selected.length} ${label}s`;
    };

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between gap-2 px-4 py-2 bg-white dark:bg-stone-800 border rounded-xl text-sm font-medium transition-all shadow-sm w-full md:w-auto min-w-[140px]",
                    isOpen ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600",
                    selected.length > 0 ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : "text-stone-700 dark:text-stone-300"
                )}
            >
                <span className="truncate">{getButtonLabel()}</span>
                <ChevronDown
                    size={16}
                    className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 w-56 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="p-2 border-b border-stone-100 dark:border-stone-700 flex gap-2">
                            <button
                                onClick={selectAll}
                                className="flex-1 text-xs bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 px-2 py-1.5 rounded-md transition-colors"
                            >
                                Select All
                            </button>
                            <button
                                onClick={clearAll}
                                className="flex-1 text-xs bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 px-2 py-1.5 rounded-md transition-colors"
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                            {options.map((option) => {
                                const isSelected = selected.includes(option.value);
                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => toggleOption(option.value)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-stone-50 dark:hover:bg-stone-700",
                                            isSelected ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10" : "text-stone-700 dark:text-stone-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                                            isSelected ? "bg-indigo-600 border-indigo-600" : "border-stone-300 dark:border-stone-600"
                                        )}>
                                            {isSelected && <Check size={10} className="text-white" />}
                                        </div>
                                        <span className="truncate">{option.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
