import { useMemo } from 'react';
import { MultiSelect, type MultiSelectOption } from '../ui/MultiSelect';

interface FilterBarProps {
    selectedYears: string[];
    selectedMonths: string[];
    availableYears: string[];
    onYearsChange: (years: string[]) => void;
    onMonthsChange: (months: string[]) => void;
    onReset: () => void;
}

const MONTHS: MultiSelectOption[] = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

export const FilterBar = ({
    selectedYears,
    selectedMonths,
    availableYears,
    onYearsChange,
    onMonthsChange,
    onReset
}: FilterBarProps) => {
    const yearOptions: MultiSelectOption[] = useMemo(() => {
        return availableYears.map(year => ({ value: year, label: year }));
    }, [availableYears]);

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-stone-900/50 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
            <MultiSelect
                label="Year"
                options={yearOptions}
                selected={selectedYears}
                onChange={onYearsChange}
                className="w-full sm:w-auto"
            />

            <MultiSelect
                label="Month"
                options={MONTHS}
                selected={selectedMonths}
                onChange={onMonthsChange}
                className="w-full sm:w-auto"
            />

            <div className="flex-1" />

            <button
                onClick={onReset}
                className="text-sm font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors px-4 py-2"
            >
                Reset Filters
            </button>
        </div>
    );
};
