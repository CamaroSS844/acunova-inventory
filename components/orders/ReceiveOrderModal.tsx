import React, { useState } from 'react';
import { PurchaseOrder } from '../../types';
import { X, PackageCheck } from 'lucide-react';

interface ReceiveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReceipt: (poId: string, receiptNotes: string) => void;
  purchaseOrder: PurchaseOrder;
}

const ReceiveOrderModal: React.FC<ReceiveOrderModalProps> = ({ isOpen, onClose, onConfirmReceipt, purchaseOrder }) => {
    const [receiptNotes, setReceiptNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirmReceipt(purchaseOrder.id, receiptNotes);
    };

    if (!isOpen) return null;

    const allItems = purchaseOrder.isPersonalStockOrder
        ? purchaseOrder.personalStockItems
        : purchaseOrder.clientOrders.flatMap(co => co.items);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"><PackageCheck/>Confirm Order Receipt</h2>
                            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20}/></button>
                        </div>
                        <div className="my-4 space-y-2">
                            <p><strong>PO:</strong> #{purchaseOrder.id.slice(-6)}</p>
                            <p><strong>Supplier:</strong> {purchaseOrder.supplierName}</p>
                            <p><strong>Receiver:</strong> {purchaseOrder.receivingStaffName}</p>
                        </div>
                        <h3 className="font-semibold text-md mb-2">Items to be added to inventory:</h3>
                        <div className="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                            <ul className="text-sm list-disc pl-5">
                                {allItems.map((item, index) => (
                                    <li key={item.componentId + index}>{item.quantity} x {item.componentName}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Receipt Notes (optional)</label>
                            <textarea
                                value={receiptNotes}
                                onChange={e => setReceiptNotes(e.target.value)}
                                placeholder="e.g., All items received in good condition."
                                className="mt-1 block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                                rows={3}
                            />
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Confirm and Update Stock</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReceiveOrderModal;
