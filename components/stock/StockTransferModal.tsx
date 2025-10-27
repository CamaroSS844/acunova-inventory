import React, { useState, useEffect } from 'react';
import { Component, StockLocation } from '../../types';
import { X } from 'lucide-react';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (componentId: string, fromLocationId: string, toLocationId: string, quantity: number) => void;
  component: Component;
  locations: Omit<StockLocation, 'quantity'>[];
}

const StockTransferModal: React.FC<StockTransferModalProps> = ({ isOpen, onClose, onTransfer, component, locations }) => {
  const [fromLocationId, setFromLocationId] = useState(component.stock_breakdown?.[0]?.locationId || '');
  const [toLocationId, setToLocationId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
  const maxQuantity = component.stock_breakdown?.find(l => l.locationId === fromLocationId)?.quantity || 0;

  useEffect(() => {
    if (isOpen) {
      setFromLocationId(component.stock_breakdown?.[0]?.locationId || '');
      setToLocationId('');
      setQuantity(1);
      setError('');
    }
  }, [isOpen, component]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
        onClose();
        setIsAnimatingOut(false);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (quantity <= 0) { setError('Quantity must be positive.'); return; }
    if (quantity > maxQuantity) { 
        setError(`Cannot transfer ${quantity} items. Only ${maxQuantity} available in the selected location.`);
        return; 
    }
    if (fromLocationId === toLocationId) { setError('Cannot transfer to the same location.'); return; }
    if (!fromLocationId || !toLocationId) { setError('Please select both locations.'); return; }

    onTransfer(component.id, fromLocationId, toLocationId, quantity);
    handleClose();
  };

  if (!isOpen) return null;
  
  const selectClasses = (hasError: boolean) =>
    `block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ${!isAnimatingOut ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all duration-300 ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transfer Stock</h2>
              <button type="button" onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:ring-offset-gray-800"><X size={20}/></button>
            </div>
            <p className="font-semibold text-lg text-gray-800 dark:text-gray-200 my-4">{component.name}</p>
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
                        <select value={fromLocationId} onChange={e => setFromLocationId(e.target.value)} className={`mt-1 ${selectClasses(!!error)}`}>
                            <option value="" disabled>Select location</option>
                            {component.stock_breakdown?.map(l => <option key={l.locationId} value={l.locationId}>{l.locationName} ({l.quantity})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
                        <select value={toLocationId} onChange={e => setToLocationId(e.target.value)} className={`mt-1 ${selectClasses(!!error)}`}>
                            <option value="" disabled>Select location</option>
                            {locations.filter(l => l.locationId !== fromLocationId).map(l => <option key={l.locationId} value={l.locationId}>{l.locationName}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity to Transfer</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} max={maxQuantity} min="1" className={`mt-1 ${selectClasses(!!error)}`} />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none">Confirm Transfer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockTransferModal;