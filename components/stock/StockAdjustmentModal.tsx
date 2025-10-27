import React, { useState, useEffect } from 'react';
import { Component } from '../../types';
import { X } from 'lucide-react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (
    componentId: string, 
    locationId: string, 
    quantity: number, 
    type: 'increase' | 'decrease', 
    reason: string
  ) => void;
  component: Component;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose, onAdjust, component }) => {
  const [type, setType] = useState<'increase' | 'decrease'>('increase');
  const [locationId, setLocationId] = useState(component.stock_breakdown?.[0]?.locationId || '');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const maxQuantity = component.stock_breakdown?.find(l => l.locationId === locationId)?.quantity || 0;

  useEffect(() => {
    if (isOpen) {
      setType('increase');
      setLocationId(component.stock_breakdown?.[0]?.locationId || '');
      setQuantity(1);
      setReason('');
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
    if (type === 'decrease' && quantity > maxQuantity) {
      setError(`Cannot decrease by ${quantity} items. Only ${maxQuantity} available in the selected location.`);
      return;
    }
    if (!locationId) { setError('Please select a location.'); return; }
    if (!reason.trim()) { setError('A reason for the adjustment is required.'); return; }

    onAdjust(component.id, locationId, quantity, type, reason);
    handleClose();
  };

  if (!isOpen) return null;

  const inputClasses = (hasError: boolean) =>
    `block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500`;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ${!isAnimatingOut ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all duration-300 ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Stock Adjustment</h2>
              <button type="button" onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:ring-offset-gray-800"><X size={20}/></button>
            </div>
            <p className="font-semibold text-lg text-gray-800 dark:text-gray-200 my-4">{component.name}</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Adjustment Type</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center">
                    <input type="radio" name="type" value="increase" checked={type === 'increase'} onChange={() => setType('increase')} className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"/>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Increase Stock</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="type" value="decrease" checked={type === 'decrease'} onChange={() => setType('decrease')} className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"/>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Decrease Stock</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <select value={locationId} onChange={e => setLocationId(e.target.value)} className={`mt-1 ${inputClasses(!!error && error.includes('location'))}`}>
                      <option value="" disabled>Select location</option>
                      {component.stock_breakdown?.map(l => <option key={l.locationId} value={l.locationId}>{l.locationName} ({l.quantity})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} max={type === 'decrease' ? maxQuantity : undefined} min="1" className={`mt-1 ${inputClasses(!!error && (error.includes('Quantity') || error.includes('exceeds')))}`} />
                </div>
              </div>
              <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Adjustment</label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Cycle count correction, damaged goods" className={`mt-1 ${inputClasses(!!error && error.includes('reason'))}`} rows={2} />
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none">Confirm Adjustment</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;