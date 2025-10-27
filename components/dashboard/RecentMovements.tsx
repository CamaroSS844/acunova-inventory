
import React from 'react';
import { StockMovement } from '../../types';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';

interface RecentMovementsProps {
  movements: StockMovement[];
}

const MovementIcon = ({ type }: { type: StockMovement['type'] }) => {
  switch (type) {
    case 'purchase':
      return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
    case 'sale':
    case 'loan_out':
      return <ArrowUpRight className="h-5 w-5 text-red-500" />;
    case 'transfer':
      return <ArrowRightLeft className="h-5 w-5 text-blue-500" />;
    default:
      return <ArrowRightLeft className="h-5 w-5 text-gray-500" />;
  }
};

const MovementDescription = ({ movement }: { movement: StockMovement }) => {
    switch (movement.type) {
        case 'purchase':
            return `Purchased from ${movement.createdBy}`;
        case 'sale':
            return `Sold to customer`;
        case 'transfer':
            return `Moved from ${movement.fromLocationName} to ${movement.toLocationName}`;
        default:
            return `Adjustment by ${movement.createdBy}`;
    }
}

const RecentMovements: React.FC<RecentMovementsProps> = ({ movements }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Stock Movements</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-3">Component</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3 text-right">Quantity</th>
              <th scope="col" className="px-4 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="mr-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <MovementIcon type={movement.type} />
                    </div>
                    <div>
                        <p>{movement.componentName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            <MovementDescription movement={movement} />
                        </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    movement.type === 'purchase' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    movement.type === 'sale' || movement.type === 'loan_out' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    {movement.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">{movement.qty}</td>
                <td className="px-4 py-3 text-right">{new Date(movement.timestamp).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentMovements;
