import type { Expense } from '../../lib/expenseStore';
import { Wallet, ShoppingBag, Receipt, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
    expenses: Expense[];
}

export const SummaryCards = ({ expenses }: SummaryCardsProps) => {
    const totalSpend = expenses.reduce((sum, exp) => sum + exp.Cost, 0);
    const totalOrders = expenses.length;
    const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;

    // Find max spend in a single order
    const maxOrder = expenses.reduce((max, exp) => (exp ? (exp.Cost > max.Cost ? exp : max) : max), expenses[0] || { Cost: 0 });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
    };

    const cards = [
        {
            title: 'Total Spend',
            value: formatCurrency(totalSpend),
            icon: <Wallet className="text-emerald-500" size={24} />,
            color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
        },
        {
            title: 'Total Orders',
            value: totalOrders,
            icon: <ShoppingBag className="text-blue-500" size={24} />,
            color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
        },
        {
            title: 'Avg Order Value',
            value: formatCurrency(avgOrderValue),
            icon: <Receipt className="text-purple-500" size={24} />,
            color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
        },
        {
            title: 'Highest Order',
            value: formatCurrency(maxOrder.Cost || 0),
            icon: <TrendingUp className="text-amber-500" size={24} />,
            color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <div key={index} className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-stone-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-stone-400 dark:text-slate-500 text-sm font-bold uppercase mb-1">{card.title}</p>
                        <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{card.value}</h3>
                    </div>
                    <div className={`p-3 rounded-full ${card.color}`}>
                        {card.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};
