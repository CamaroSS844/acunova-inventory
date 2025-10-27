import React, { useState, useMemo } from 'react';
import { StockMovement, Component } from '../../types';
import { X, History } from 'lucide-react';

interface StockMovementsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  movements: StockMovement[];
  components: Component[];
}

const StockMovementsHistoryModal: React.FC<StockMovementsHistoryModalProps> = ({ isOpen, onClose, movements, components }) => {
  const [filterComponent, setFilterComponent] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300);
  };

  const resetFilters = () => {
    setFilterComponent('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const filteredMovements = useMemo(() => {
    return movements
      .filter(movement => {
        if (filterComponent && movement.componentName !== filterComponent) {
          return false;
        }
        const movementDate = new Date(movement.timestamp);
        if (filterStartDate && movementDate < new Date(filterStartDate)) {
          return false;
        }
        if (filterEndDate) {
          const endDate = new Date(filterEndDate);
          endDate.setHours(23, 59, 59, 999); // Include the whole end day
          if (movementDate > endDate) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [movements, filterComponent, filterStartDate, filterEndDate]);

  if (!isOpen) return null;

  const getMovementDetails = (movement: StockMovement): string => {
    switch(movement.type) {
      case 'transfer':
        return `${movement.fromLocationName} → ${movement.toLocationName}`;
      case 'adjustment':
        return `${movement.fromLocationName || movement.toLocationName} (${movement.reason})`;
      case 'purchase':
        return `To: ${movement.toLocationName}`;
      case 'sale':
        return `From: ${movement.fromLocationName}`;
      default:
        return '-';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ${!isAnimatingOut ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl m-4 flex flex-col transform transition-all duration-300 ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{height: '90vh'}}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Stock Movement History</h2>
            <button type="button" onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"><X size={20}/></button>
          </div>
        </div>
        
        <div className="p-6 space-y-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Component</label>
                    <select value={filterComponent} onChange={e => setFilterComponent(e.target.value)} className="mt-1 block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                        <option value="">All Components</option>
                        {components.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                    <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                    <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <button onClick={resetFilters} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">Reset Filters</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            {filteredMovements.length > 0 ? (
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Component</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                            <th scope="col" className="px-6 py-3 text-right">Quantity</th>
                            <th scope="col" className="px-6 py-3">User</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredMovements.map(movement => (
                            <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(movement.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{movement.componentName}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        movement.type === 'purchase' || movement.type === 'loan_in' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                        movement.type === 'sale' || movement.type === 'loan_out' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                        movement.type === 'transfer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    }`}>
                                        {movement.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{getMovementDetails(movement)}</td>
                                <td className="px-6 py-4 text-right font-semibold">{movement.qty}</td>
                                <td className="px-6 py-4">{movement.createdBy}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <History className="w-16 h-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-200">No Movements Found</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no stock movements matching your filters.</p>
                </div>
            )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none">Close</button>
        </div>
      </div>
    </div>
  );
};

export default StockMovementsHistoryModal;