import React, { useState } from 'react';
import { Component } from '../../types';
import { X } from 'lucide-react';

interface StockBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  component: Component;
}

const StockBreakdownModal: React.FC<StockBreakdownModalProps> = ({ isOpen, onClose, component }) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  if (!isOpen) return null;
  
  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
        onClose();
        setIsAnimatingOut(false);
    }, 300);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ${!isAnimatingOut ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Stock Breakdown</h2>
            <button type="button" onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:ring-offset-gray-800"><X size={20}/></button>
          </div>
          <p className="font-semibold text-lg text-gray-800 dark:text-gray-200 my-4">{component.name}</p>
          <ul className="space-y-2">
            {(component.stock_breakdown || []).map(loc => (
              <li key={loc.locationId} className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                <span className="text-sm text-gray-700 dark:text-gray-300">{loc.locationName}</span>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{loc.quantity} {component.unit}</span>
              </li>
            ))}
            <li className="flex justify-between p-3 border-t-2 mt-3 pt-3 dark:border-gray-600">
              <span className="font-bold text-gray-900 dark:text-white">Total Stock</span>
              <span className="font-bold text-primary-600 dark:text-primary-400">{component.current_stock} {component.unit}</span>
            </li>
          </ul>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end rounded-b-lg">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none">Close</button>
        </div>
      </div>
    </div>
  );
};

export default StockBreakdownModal;
