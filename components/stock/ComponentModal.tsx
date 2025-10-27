import React, { useState, useEffect } from 'react';
import { Component, StockLocation } from '../../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface ComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (component: Omit<Component, 'id' | 'current_stock'> & { id?: string }) => void;
  component: Component | null;
  locations: Omit<StockLocation, 'quantity'>[];
}

const ComponentModal: React.FC<ComponentModalProps> = ({ isOpen, onClose, onSave, component, locations }) => {
    const getInitialState = () => ({
        name: '',
        description: '',
        category: '',
        unit: 'pcs' as Component['unit'],
        default_price: 0,
        reorder_level: 0,
        stock_breakdown: [{ locationId: locations[0]?.locationId || '', locationName: locations[0]?.locationName || '', quantity: 0 }],
    });

    const [formData, setFormData] = useState(getInitialState());
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (component) {
                setFormData({
                    name: component.name,
                    description: component.description,
                    category: component.category || '',
                    unit: component.unit || 'pcs',
                    default_price: component.default_price,
                    reorder_level: component.reorder_level,
                    stock_breakdown: component.stock_breakdown && component.stock_breakdown.length > 0 ? component.stock_breakdown : [{ locationId: locations[0]?.locationId || '', locationName: locations[0]?.locationName || '', quantity: 0 }],
                });
            } else {
                setFormData(getInitialState());
            }
            setErrors({});
        }
    }, [component, isOpen, locations]);
    
    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300);
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Component name is required.';
        if (isNaN(formData.default_price) || formData.default_price <= 0) {
            newErrors.default_price = 'Default price must be a positive number.';
        }
        if (formData.reorder_level < 0) newErrors.reorder_level = 'Reorder level cannot be negative.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['default_price', 'reorder_level'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
        if (errors[name]) setErrors(prev => ({...prev, [name]: ''}));
    };
    
    const handleBreakdownChange = (index: number, field: 'locationId' | 'quantity', value: string | number) => {
        const newBreakdown = [...formData.stock_breakdown];
        if (field === 'locationId') {
            const selectedLocation = locations.find(l => l.locationId === value);
            newBreakdown[index].locationId = value as string;
            newBreakdown[index].locationName = selectedLocation?.locationName || '';
        } else {
            newBreakdown[index].quantity = Math.max(0, Number(value));
        }
        setFormData(prev => ({ ...prev, stock_breakdown: newBreakdown }));
    };

    const addBreakdownRow = () => {
        const availableLocations = locations.filter(l => !formData.stock_breakdown.some(b => b.locationId === l.locationId));
        if(availableLocations.length > 0) {
            setFormData(prev => ({ ...prev, stock_breakdown: [...prev.stock_breakdown, { locationId: availableLocations[0].locationId, locationName: availableLocations[0].locationName, quantity: 0 }] }));
        }
    };
    
    const removeBreakdownRow = (index: number) => {
        setFormData(prev => ({ ...prev, stock_breakdown: prev.stock_breakdown.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({ ...formData, id: component?.id });
            handleClose();
        }
    };

    if (!isOpen) return null;

    const inputClasses = (hasError: boolean) =>
        `block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500`;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ${!isAnimatingOut ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 transform transition-all duration-300 ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{component ? 'Edit Component' : 'Add New Component'}</h2>
                            <button type="button" onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:ring-offset-gray-800"><X size={20}/></button>
                        </div>
                        <div className="space-y-4 mt-4 max-h-[65vh] overflow-y-auto pr-2">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Component Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., ATmega328P" className={`mt-1 ${inputClasses(!!errors.name)}`}/>
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="e.g., 8-bit AVR Microcontroller" className={`mt-1 ${inputClasses(false)}`} rows={2}/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                    <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Microcontrollers" className={`mt-1 ${inputClasses(false)}`}/>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
                                    <select name="unit" value={formData.unit} onChange={handleChange} className={`mt-1 ${inputClasses(false)}`}>
                                        <option value="pcs">pcs</option>
                                        <option value="reel">reel</option>
                                        <option value="kit">kit</option>
                                        <option value="m">m</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Price ($)</label>
                                    <input type="number" step="0.01" name="default_price" value={formData.default_price} onChange={handleChange} className={`mt-1 ${inputClasses(!!errors.default_price)}`}/>
                                    {errors.default_price && <p className="text-red-500 text-xs mt-1">{errors.default_price}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reorder Level</label>
                                    <input type="number" name="reorder_level" value={formData.reorder_level} onChange={handleChange} className={`mt-1 ${inputClasses(!!errors.reorder_level)}`}/>
                                    {errors.reorder_level && <p className="text-red-500 text-xs mt-1">{errors.reorder_level}</p>}
                                </div>
                            </div>

                            <h3 className="text-md font-semibold pt-4 border-t border-gray-200 dark:border-gray-700">Stock Locations</h3>
                            {formData.stock_breakdown.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <select value={item.locationId} onChange={e => handleBreakdownChange(index, 'locationId', e.target.value)} className={`flex-grow ${inputClasses(false)}`}>
                                        {locations.map(loc => <option key={loc.locationId} value={loc.locationId}>{loc.locationName}</option>)}
                                    </select>
                                    <input type="number" min="0" value={item.quantity} onChange={e => handleBreakdownChange(index, 'quantity', e.target.value)} placeholder="Qty" className={`w-28 ${inputClasses(false)}`}/>
                                    <button type="button" onClick={() => removeBreakdownRow(index)} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><Trash2 size={16}/></button>
                                </div>
                            ))}
                             <button type="button" onClick={addBreakdownRow} className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"><Plus size={16}/> Add Location</button>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComponentModal;