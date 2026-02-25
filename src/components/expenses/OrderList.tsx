import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import type { Expense } from '../../lib/expenseStore';
import { Search } from 'lucide-react';

interface OrderListProps {
    expenses: Expense[];
}

export const OrderList = ({ expenses }: OrderListProps) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 20;

    const filteredExpenses = expenses.filter(exp =>
        exp.Restaurant.toLowerCase().includes(search.toLowerCase()) ||
        exp.Items.some(item => item.toLowerCase().includes(search.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const paginatedExpenses = filteredExpenses.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-stone-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Recent Orders</h3>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search restaurant or items..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 dark:bg-slate-800 text-stone-500 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Date</th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Restaurant</th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Items</th>
                            <th className="px-6 py-3 font-medium text-right whitespace-nowrap">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                        {paginatedExpenses.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-stone-400">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            paginatedExpenses.map((exp, index) => (
                                <tr key={index} className="hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-stone-600 dark:text-slate-300 whitespace-nowrap">
                                        {format(parseISO(exp.Date), 'MMM d, yyyy h:mm a')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-stone-800 dark:text-stone-200">
                                        {exp.Restaurant}
                                    </td>
                                    <td className="px-6 py-4 text-stone-500 dark:text-slate-400 max-w-xs truncate" title={exp.Items.join(', ')}>
                                        {exp.Items.join(', ')}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-stone-800 dark:text-stone-200 whitespace-nowrap">
                                        {formatCurrency(exp.Cost)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-stone-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-sm text-stone-500 dark:text-slate-400">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 rounded-md border border-stone-200 dark:border-slate-700 disabled:opacity-50 hover:bg-stone-50 dark:hover:bg-slate-800 text-stone-600 dark:text-slate-300 transition-colors"
                        >
                            Prev
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 rounded-md border border-stone-200 dark:border-slate-700 disabled:opacity-50 hover:bg-stone-50 dark:hover:bg-slate-800 text-stone-600 dark:text-slate-300 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
