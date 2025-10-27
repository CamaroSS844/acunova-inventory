import React, { useState, useEffect } from 'react';
import { PurchaseOrder, Supplier, StaffMember, Component, ClientOrder, OrderItem } from '../../types';
import ClientOrderModal from './ClientOrderModal';
import { X, Plus, Trash2, Edit, Package, User } from 'lucide-react';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (po: Omit<PurchaseOrder, 'id'> & { id?: string }) => void;
  purchaseOrder: PurchaseOrder | null;
  suppliers: Supplier[];
  staff: StaffMember[];
  components: Component[];
}

const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ isOpen, onClose, onSave, purchaseOrder, suppliers, staff, components }) => {
    const getInitialState = () => ({
        supplierId: suppliers[0]?.id || '',
        receivingStaffId: staff[0]?.id || '',
        isPersonalStockOrder: false,
        clientOrders: [],
        personalStockItems: [],
        notes: '',
        status: 'draft' as PurchaseOrder['status'],
    });

    const [formData, setFormData] = useState<any>(getInitialState());
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [editingClientOrder, setEditingClientOrder] = useState<ClientOrder | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(purchaseOrder || getInitialState());
        }
    }, [purchaseOrder, isOpen, suppliers, staff]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSaveClientOrder = (clientOrder: Omit<ClientOrder, 'id'> & {id?: string}) => {
        if (clientOrder.id) {
            setFormData((prev: any) => ({ ...prev, clientOrders: prev.clientOrders.map((co: ClientOrder) => co.id === clientOrder.id ? clientOrder : co) }));
        } else {
            const newClientOrder = { ...clientOrder, id: `co_${Date.now()}` };
            setFormData((prev: any) => ({ ...prev, clientOrders: [...prev.clientOrders, newClientOrder] }));
        }
    };
    
    const handlePersonalItemChange = (index: number, field: string, value: any) => {
        const newItems = [...formData.personalStockItems];
        const currentItem = { ...newItems[index], [field]: value };
        if (field === 'componentId') {
            const component = components.find(c => c.id === value);
            currentItem.componentName = component?.name || '';
            currentItem.purchasePrice = component?.default_price || 0;
            currentItem.salePrice = component?.default_price || 0;
        }
        newItems[index] = currentItem;
        setFormData((prev: any) => ({ ...prev, personalStockItems: newItems }));
    };
    
    const addPersonalItem = () => setFormData((prev:any) => ({...prev, personalStockItems: [...prev.personalStockItems, {componentId: '', quantity: 1, purchasePrice: 0, salePrice: 0}]}));
    const removePersonalItem = (index: number) => setFormData((prev:any) => ({...prev, personalStockItems: prev.personalStockItems.filter((_:any, i:number) => i !== index)}));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const supplier = suppliers.find(s => s.id === formData.supplierId);
        const staffMember = staff.find(s => s.id === formData.receivingStaffId);

        const totalCost = formData.isPersonalStockOrder
            ? formData.personalStockItems.reduce((sum: number, item: OrderItem) => sum + item.quantity * item.purchasePrice, 0)
            : formData.clientOrders.reduce((sum: number, co: ClientOrder) => sum + co.totalCost, 0);

        const finalPo = {
            ...formData,
            supplierName: supplier?.name || 'Unknown',
            receivingStaffName: staffMember?.name || 'Unknown',
            totalCost
        };
        onSave({ ...finalPo, id: purchaseOrder?.id });
    };

    if (!isOpen) return null;
    const inputClasses = "block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none";

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl m-4 flex flex-col h-[90vh]">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <div className="p-6 border-b dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">{purchaseOrder ? 'Edit' : 'Create'} Purchase Order</h2>
                                <button type="button" onClick={onClose}><X size={24}/></button>
                            </div>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Supplier</label>
                                    <select name="supplierId" value={formData.supplierId} onChange={handleChange} className={`mt-1 ${inputClasses}`}>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Receiving Staff Member</label>
                                    <select name="receivingStaffId" value={formData.receivingStaffId} onChange={handleChange} className={`mt-1 ${inputClasses}`}>
                                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" name="isPersonalStockOrder" checked={formData.isPersonalStockOrder} onChange={handleChange} className="h-4 w-4 rounded"/>
                                    This is an order for internal stock (not for a specific client)
                                </label>
                            </div>
                            <div className="pt-4 border-t dark:border-gray-700">
                                {formData.isPersonalStockOrder ? (
                                    <>
                                        <h3 className="font-semibold flex items-center gap-2"><Package size={18}/> Items for Stock</h3>
                                        {formData.personalStockItems.map((item: any, index: number) => (
                                            <div key={index} className="grid grid-cols-12 gap-2 mt-2 items-center">
                                                <select value={item.componentId} onChange={e => handlePersonalItemChange(index, 'componentId', e.target.value)} className={`col-span-8 ${inputClasses}`}>
                                                    <option value="">Select component...</option>
                                                    {components.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                                <input type="number" min="1" value={item.quantity} onChange={e => handlePersonalItemChange(index, 'quantity', Number(e.target.value))} className={`col-span-3 ${inputClasses}`}/>
                                                <button type="button" onClick={() => removePersonalItem(index)} className="col-span-1 text-red-500"><Trash2 size={16}/></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addPersonalItem} className="mt-2 flex items-center gap-2 text-sm font-medium text-primary-600"><Plus size={16}/> Add Item</button>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="font-semibold flex items-center gap-2"><User size={18}/> Client Orders</h3>
                                        {formData.clientOrders.map((co: ClientOrder) => (
                                            <div key={co.id} className="p-2 my-2 bg-gray-100 dark:bg-gray-700/50 rounded-md flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{co.clientName}</p>
                                                    <p className="text-xs">{co.items.length} item(s) - Value: ${co.totalValue.toFixed(2)}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => { setEditingClientOrder(co); setIsClientModalOpen(true); }}><Edit size={16}/></button>
                                                    <button type="button" onClick={() => setFormData((prev:any) => ({...prev, clientOrders: prev.clientOrders.filter((c:ClientOrder) => c.id !== co.id)}))}><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => { setEditingClientOrder(null); setIsClientModalOpen(true); }} className="mt-2 flex items-center gap-2 text-sm font-medium text-primary-600"><Plus size={16}/> Add Client Order</button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
                            <button type="submit" className="w-full py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">Save Purchase Order</button>
                        </div>
                    </form>
                </div>
            </div>
            {isClientModalOpen && (
                <ClientOrderModal
                    isOpen={isClientModalOpen}
                    onClose={() => setIsClientModalOpen(false)}
                    onSave={handleSaveClientOrder}
                    clientOrder={editingClientOrder}
                    components={components}
                />
            )}
        </>
    );
};

export default PurchaseOrderModal;
