import React, { useState, useEffect } from 'react';
import { ClientOrder, Component, OrderItem } from '../../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface ClientOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (co: Omit<ClientOrder, 'id' | 'totalCost' | 'totalValue'> & { id?: string; totalCost: number; totalValue: number }) => void;
  clientOrder: ClientOrder | null;
  components: Component[];
}

const ClientOrderModal: React.FC<ClientOrderModalProps> = ({ isOpen, onClose, onSave, clientOrder, components }) => {
    const getInitialState = () => ({
        clientName: '',
        items: [{ componentId: '', quantity: 1, purchasePrice: 0, salePrice: 0, componentName: '' }],
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(clientOrder || getInitialState());
        }
    }, [clientOrder, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        const currentItem = { ...newItems[index], [field]: value };
        
        if (field === 'componentId') {
            const component = components.find(c => c.id === value);
            currentItem.componentName = component?.name || '';
            currentItem.purchasePrice = component?.default_price || 0;
            if(currentItem.salePrice === 0) currentItem.salePrice = component?.default_price || 0;
        }
        newItems[index] = currentItem;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({ ...prev, items: [...prev.items, { componentId: '', quantity: 1, purchasePrice: 0, salePrice: 0, componentName: '' }] }));
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalCost = formData.items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);
        const totalValue = formData.items.reduce((sum, item) => sum + item.quantity * item.salePrice, 0);

        onSave({ ...formData, id: clientOrder?.id, totalCost, totalValue });
        onClose();
    };

    if (!isOpen) return null;
    const inputClasses = "block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col h-[70vh]">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">{clientOrder ? 'Edit' : 'Add'} Client Order</h2>
                            <button type="button" onClick={onClose}><X size={24}/></button>
                        </div>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto space-y-4">
                        <div>
                            <label className="text-sm font-medium">Client Name</label>
                            <input name="clientName" value={formData.clientName} onChange={handleChange} className={`mt-1 ${inputClasses}`} required />
                        </div>
                        <div>
                            <h3 className="text-md font-semibold">Items</h3>
                            {formData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 mt-2 items-center">
                                    <select value={item.componentId} onChange={e => handleItemChange(index, 'componentId', e.target.value)} className={`col-span-5 ${inputClasses}`}>
                                        <option value="">Select component...</option>
                                        {components.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} placeholder="Qty" className={`col-span-2 ${inputClasses}`}/>
                                    <div className="col-span-2 relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input type="number" step="0.01" value={item.salePrice} onChange={e => handleItemChange(index, 'salePrice', Number(e.target.value))} placeholder="Sale Price" className={`pl-5 ${inputClasses}`}/>
                                    </div>
                                    <p className="col-span-2 text-xs text-center">Cost: ${(item.purchasePrice * item.quantity).toFixed(2)}</p>
                                    <button type="button" onClick={() => removeItem(index)} className="col-span-1 text-red-500"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={addItem} className="mt-2 flex items-center gap-2 text-sm font-medium text-primary-600"><Plus size={16}/> Add Item</button>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
                        <button type="submit" className="w-full py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">Save Client Order</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientOrderModal;
