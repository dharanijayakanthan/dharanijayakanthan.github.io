import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

interface FilterDropdownProps {
    label: string;
    options: FilterOption[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    multiple?: boolean;
    searchable?: boolean;
    className?: string;
}

export const FilterDropdown = ({
    label,
    options,
    selectedValues,
    onChange,
    multiple = false,
    searchable = false,
    className
}: FilterDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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

    const handleSelect = (value: string) => {
        if (multiple) {
            if (selectedValues.includes(value)) {
                onChange(selectedValues.filter(v => v !== value));
            } else {
                onChange([...selectedValues, value]);
            }
        } else {
            onChange([value]);
            setIsOpen(false);
        }
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getButtonLabel = () => {
        if (selectedValues.length === 0) return label;
        if (!multiple) {
            const selectedOption = options.find(opt => opt.value === selectedValues[0]);
            return selectedOption ? selectedOption.label : label;
        }
        if (selectedValues.length === 1) {
            const selectedOption = options.find(opt => opt.value === selectedValues[0]);
            return selectedOption ? selectedOption.label : label;
        }
        return `${label} (${selectedValues.length})`;
    };

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-xl text-sm font-medium transition-all shadow-sm w-full md:w-auto min-w-[160px]",
                    isOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                    selectedValues.length > 0 ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" : "text-gray-700 dark:text-gray-300"
                )}
            >
                <span className="truncate max-w-[140px]">{getButtonLabel()}</span>
                <div className="flex items-center gap-1">
                    {selectedValues.length > 0 && (
                        <div
                            role="button"
                            onClick={clearSelection}
                            className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors mr-1"
                        >
                            <X size={14} />
                        </div>
                    )}
                    <ChevronDown
                        size={16}
                        className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")}
                    />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
                    >
                        {searchable && (
                            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={`Search ${label}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? filteredOptions.map((option) => {
                                const isSelected = selectedValues.includes(option.value);
                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => handleSelect(option.value)}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors",
                                            isSelected
                                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {multiple && (
                                                <div className={cn(
                                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                                                    isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 dark:border-gray-600"
                                                )}>
                                                    {isSelected && <Check size={10} className="text-white" />}
                                                </div>
                                            )}
                                            <span className="truncate">{option.label}</span>
                                        </div>
                                        {option.count !== undefined && (
                                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                                                {option.count}
                                            </span>
                                        )}
                                    </div>
                                );
                            }) : (
                                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                    No options found
                                </div>
                            )}
                        </div>

                        {multiple && (
                            <div className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                                <button
                                    onClick={() => onChange([])}
                                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium px-2 py-1"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
