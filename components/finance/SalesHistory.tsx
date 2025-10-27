import React from 'react';
import { Sale } from '../../types';
import { ShoppingCart } from 'lucide-react';

interface SalesHistoryProps {
  sales: Sale[];
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ sales }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Sales</h3>
      <div className="overflow-y-auto h-[480px]">
        {sales.length > 0 ? (
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                    <tr>
                        <th scope="col" className="px-4 py-3">Date</th>
                        <th scope="col" className="px-4 py-3">Customer</th>
                        <th scope="col" className="px-4 py-3">Staff</th>
                        <th scope="col" className="px-4 py-3">Items</th>
                        <th scope="col" className="px-4 py-3 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                    {sales.map(sale => (
                        <tr key={sale.id}>
                            <td className="px-4 py-3 whitespace-nowrap">{new Date(sale.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{sale.customerName}</td>
                            <td className="px-4 py-3">{sale.staffName}</td>
                            <td className="px-4 py-3">
                                <ul className="text-xs">
                                {sale.items.map(item => (
                                    <li key={item.componentId}>
                                        {item.quantity}x {item.componentName}
                                    </li>
                                ))}
                                </ul>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-green-500">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(sale.totalAmount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <ShoppingCart className="h-12 w-12 mb-4" />
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">No Sales Recorded Yet</h4>
                <p className="text-sm">Use the form to record a new sale.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;
