import React, { useState, useEffect, useMemo } from 'react';
import { Sale, StaffMember, Component, BankAccount, StockLocation } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface SalesFormProps {
  staff: StaffMember[];
  components: Component[];
  accounts: BankAccount[];
  locations: Omit<StockLocation, 'quantity'>[];
  onSave: (sale: Omit<Sale, 'id'>) => void;
  currentStaffId?: string;
}

const SalesForm: React.FC<SalesFormProps> = ({ staff, components, accounts, locations, onSave, currentStaffId }) => {
  const initialItem = { componentId: '', quantity: 1, unitPrice: 0 };
  const getInitialState = () => ({
    staffId: currentStaffId || staff[0]?.id || '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    paymentToAccountId: accounts.find(a => a.type === 'cash')?.id || accounts[0]?.id || '',
    // FIX: Corrected property access from '.id' to '.locationId'
    fromLocationId: locations.find(l => l.locationId === 'loc_main_wh')?.locationId || locations[0]?.locationId || '',
    items: [initialItem],
  });

  const [formData, setFormData] = useState(getInitialState());
  const [error, setError] = useState('');

  useEffect(() => { // Reset if props change
    setFormData(getInitialState());
  }, [staff, components, accounts, locations, currentStaffId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    const currentItem = { ...newItems[index], [field]: value };
    
    if (field === 'componentId') {
      const component = components.find(c => c.id === value);
      currentItem.unitPrice = component?.default_price || 0;
    }
    newItems[index] = currentItem;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, initialItem] });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };
  
  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [formData.items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.staffId || !formData.customerName.trim() || !formData.paymentToAccountId || !formData.fromLocationId) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.items.length === 0 || formData.items.some(i => !i.componentId || i.quantity <= 0)) {
        setError('Please add valid items to the sale.');
        return;
    }

    for (const item of formData.items) {
      const component = components.find(c => c.id === item.componentId);
      const stockAtLocation = component?.stock_breakdown?.find(l => l.locationId === formData.fromLocationId)?.quantity || 0;
      if (item.quantity > stockAtLocation) {
        setError(`Not enough stock for ${component?.name}. Available: ${stockAtLocation}.`);
        return;
      }
    }
    
    const staffMember = staff.find(s => s.id === formData.staffId);
    if (!staffMember) {
      setError('Invalid staff member selected.');
      return;
    }

    const saleData: Omit<Sale, 'id'> = {
      ...formData,
      staffName: staffMember.name,
      totalAmount,
      items: formData.items.map(item => {
        const component = components.find(c => c.id === item.componentId);
        return {
          componentId: item.componentId,
          componentName: component?.name || 'Unknown',
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.quantity) * Number(item.unitPrice)
        };
      })
    };

    onSave(saleData);
    setFormData(getInitialState());
  };
  
  const inputClasses = "block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500";
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Record a New Sale</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-sm font-medium">Staff Member</label>
                <select name="staffId" value={formData.staffId} onChange={handleInputChange} className={`mt-1 ${inputClasses}`}>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm font-medium">Customer Name</label>
                <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder="e.g., John Doe" className={`mt-1 ${inputClasses}`} />
            </div>
            <div>
                <label className="text-sm font-medium">Sell From Location</label>
                <select name="fromLocationId" value={formData.fromLocationId} onChange={handleInputChange} className={`mt-1 ${inputClasses}`}>
                    {locations.map(l => <option key={l.locationId} value={l.locationId}>{l.locationName}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm font-medium">Payment To Account</label>
                <select name="paymentToAccountId" value={formData.paymentToAccountId} onChange={handleInputChange} className={`mt-1 ${inputClasses}`}>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
            </div>
        </div>

        <div>
            <h4 className="text-md font-semibold mt-4 mb-2">Items Sold</h4>
            <div className="space-y-2">
            {formData.items.map((item, index) => {
              const component = components.find(c => c.id === item.componentId);
              const stockAtLocation = component?.stock_breakdown?.find(l => l.locationId === formData.fromLocationId)?.quantity || 0;
              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                        <select value={item.componentId} onChange={(e) => handleItemChange(index, 'componentId', e.target.value)} className={inputClasses}>
                            <option value="" disabled>Select component</option>
                            {components.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="col-span-3">
                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className={inputClasses} placeholder="Qty" min="1" max={stockAtLocation} />
                        <p className="text-xs text-gray-500 text-center">Max: {stockAtLocation}</p>
                    </div>
                    <div className="col-span-3">
                        <input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className={inputClasses} placeholder="Price" step="0.01" />
                    </div>
                    <div className="col-span-1">
                        <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                </div>
              );
            })}
            </div>
            <button type="button" onClick={addItem} className="mt-2 flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800">
                <Plus size={16} /> Add Item
            </button>
        </div>
        
        <div className="pt-4 border-t dark:border-gray-700">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">Total:</h4>
                <p className="text-lg font-bold text-primary-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount)}</p>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button type="submit" className="w-full mt-4 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
                Record Sale
            </button>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;