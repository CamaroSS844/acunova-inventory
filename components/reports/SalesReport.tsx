import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sale, StaffMember } from '../../types';
import { getSales } from '../../services/financeService';
import { getStaff } from '../../services/staffService';
import { DollarSign, Hash, Calculator, TrendingUp, FilterX, Users } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

const SalesReport: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        staffId: 'all',
        customerName: '',
    });

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [salesData, staffData] = await Promise.all([getSales(), getStaff()]);
            setSales(salesData);
            setStaff(staffData);
        } catch (err) {
            setError("Failed to load report data.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const resetFilters = () => {
        setFilters({ startDate: '', endDate: '', staffId: 'all', customerName: '' });
    };

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            if (filters.startDate && saleDate < new Date(filters.startDate)) return false;
            if (filters.endDate) {
                const endDate = new Date(filters.endDate);
                endDate.setHours(23, 59, 59, 999);
                if (saleDate > endDate) return false;
            }
            if (filters.staffId !== 'all' && sale.staffId !== filters.staffId) return false;
            if (filters.customerName && !sale.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) return false;
            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, filters]);

    const reportData = useMemo(() => {
        const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const numSales = filteredSales.length;
        const avgSale = numSales > 0 ? totalSales / numSales : 0;
        const itemCounts = new Map<string, { name: string, quantity: number }>();
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const existing = itemCounts.get(item.componentId);
                itemCounts.set(item.componentId, {
                    name: item.componentName,
                    quantity: (existing?.quantity || 0) + item.quantity
                });
            });
        });
        const topItems = Array.from(itemCounts.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
        return { totalSales, numSales, avgSale, topItems };
    }, [filteredSales]);

    if (isLoading) {
        return <LoadingSpinner message="Loading report data..." />;
    }

    if (error) {
        return <ErrorDisplay title="Error" message={error} />;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Report</h1>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="text-sm font-medium">Start Date</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 w-full input-style"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">End Date</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 w-full input-style"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Staff Member</label>
                        <select name="staffId" value={filters.staffId} onChange={handleFilterChange} className="mt-1 w-full input-style">
                            <option value="all">All Staff</option>
                            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Customer Name</label>
                        <input type="text" name="customerName" value={filters.customerName} onChange={handleFilterChange} placeholder="Search customer..." className="mt-1 w-full input-style"/>
                    </div>
                    <button onClick={resetFilters} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
                        <FilterX size={16}/> Reset
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard icon={DollarSign} title="Total Revenue" value={`$${reportData.totalSales.toFixed(2)}`} />
                <KpiCard icon={Hash} title="Number of Sales" value={reportData.numSales} />
                <KpiCard icon={Calculator} title="Average Sale Value" value={`$${reportData.avgSale.toFixed(2)}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Filtered Sales Transactions</h3>
                    <div className="overflow-auto max-h-96">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th className="p-3 text-left">Date</th>
                                    <th className="p-3 text-left">Customer</th>
                                    <th className="p-3 text-left">Staff</th>
                                    <th className="p-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.length > 0 ? filteredSales.map(sale => (
                                    <tr key={sale.id} className="border-b dark:border-gray-700">
                                        <td className="p-3">{new Date(sale.date).toLocaleDateString()}</td>
                                        <td className="p-3 font-medium dark:text-white">{sale.customerName}</td>
                                        <td className="p-3">{sale.staffName}</td>
                                        <td className="p-3 text-right font-semibold text-green-500">{`$${sale.totalAmount.toFixed(2)}`}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="text-center py-8 text-gray-500">No sales match the current filters.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                     <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><TrendingUp size={20}/> Top Selling Items</h3>
                     <ul className="space-y-3">
                        {reportData.topItems.length > 0 ? reportData.topItems.map(item => (
                            <li key={item.name} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <span className="font-medium truncate pr-2 dark:text-gray-200">{item.name}</span>
                                <span className="font-bold text-primary-600 dark:text-primary-400">{item.quantity} sold</span>
                            </li>
                        )) : (
                           <p className="text-sm text-center py-8 text-gray-500">No sales data for top items.</p>
                        )}
                     </ul>
                </div>
            </div>
        </div>
    );
};

const KpiCard: React.FC<{icon: React.ElementType, title: string, value: string | number}> = ({ icon: Icon, title, value }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-full mr-4">
                <Icon className="h-6 w-6 text-primary-600 dark:text-primary-300" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </div>
);

const style = document.createElement('style');
style.textContent = `
    .input-style {
        background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }
    .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
    .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #3B82F6; border-color: #3B82F6; box-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color); }
`;
document.head.append(style);

export default SalesReport;