
import React from 'react';
import { Component } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface LowStockAlertsProps {
  components: Component[];
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ components }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h3>
      </div>
      <ul className="space-y-4">
        {components.map((component) => (
          <li key={component.id}>
            <p className="font-semibold text-sm truncate">{component.name}</p>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>
                Stock: <span className="font-bold text-red-500">{component.current_stock}</span> / {component.reorder_level} {component.unit}
              </span>
              <button className="px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                Reorder
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlerts;
