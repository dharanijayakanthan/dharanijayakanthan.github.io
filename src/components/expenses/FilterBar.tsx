import { Moon, Sun } from 'lucide-react';

interface FilterBarProps {
    startDate: string;
    endDate: string;
    selectedMonth: string;
    selectedYear: string;
    isNightTime: boolean;
    availableYears: string[];
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onMonthChange: (month: string) => void;
    onYearChange: (year: string) => void;
    onNightTimeToggle: () => void;
    onReset: () => void;
}

export const FilterBar = ({
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
    isNightTime,
    availableYears,
    onStartDateChange,
    onEndDateChange,
    onMonthChange,
    onYearChange,
    onNightTimeToggle,
    onReset
}: FilterBarProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-100 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">

                {/* Date Range */}
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <div className="flex flex-col">
                        <label className="text-xs text-stone-400 dark:text-slate-500 font-bold ml-1">From</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs text-stone-400 dark:text-slate-500 font-bold ml-1">To</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            className="bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="h-8 w-px bg-stone-200 dark:bg-slate-800 hidden sm:block"></div>

                {/* Month & Year */}
                <div className="flex gap-2">
                    <div className="flex flex-col">
                        <label className="text-xs text-stone-400 dark:text-slate-500 font-bold ml-1">Month</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => onMonthChange(e.target.value)}
                            className="bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">All Months</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={String(i + 1)}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs text-stone-400 dark:text-slate-500 font-bold ml-1">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => onYearChange(e.target.value)}
                            className="bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">All Years</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Night Time Toggle */}
                <button
                    onClick={onNightTimeToggle}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl border transition-all
                        ${isNightTime
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                            : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-700'}
                    `}
                >
                    {isNightTime ? <Moon size={18} /> : <Sun size={18} />}
                    <span className="font-bold text-sm">Night Orders</span>
                </button>

                <button
                    onClick={onReset}
                    className="text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 underline underline-offset-2"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};
