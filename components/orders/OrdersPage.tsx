import React, { useState, useEffect, useCallback } from 'react';
import { PurchaseOrder, Supplier, StaffMember, Component, StockLocation, StockMovement, OrderItem } from '../../types';
import { getPurchaseOrders, savePurchaseOrders } from '../../services/orderService';
import { getSuppliers } from '../../services/supplierService';
import { getStaff } from '../../services/staffService';
import { getComponents, saveComponents, getLocations, getStockMovements, saveStockMovements } from '../../services/stockService';
import PurchaseOrderModal from './PurchaseOrderModal';
import ReceiveOrderModal from './ReceiveOrderModal';
import { PlusCircle, PackageCheck, Truck, FilePenLine, Check, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

const OrdersPage: React.FC = () => {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [components, setComponents] = useState<Component[]>([]);
    const [locations, setLocations] = useState<Omit<StockLocation, 'quantity'>[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isPoModalOpen, setIsPoModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
    const [expandedPo, setExpandedPo] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [poData, suppliersData, staffData, componentsData, locationsData] = await Promise.all([
                getPurchaseOrders(),
                getSuppliers(),
                getStaff(),
                getComponents(),
                getLocations()
            ]);
            setPurchaseOrders(poData);
            setSuppliers(suppliersData);
            setStaff(staffData);
            setComponents(componentsData);
            setLocations(locationsData);
        } catch (err) {
            setError("Failed to load order management data.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleOpenPoModal = (po: PurchaseOrder | null = null) => {
        setSelectedPo(po);
        setIsPoModalOpen(true);
    };

    const handleOpenReceiveModal = (po: PurchaseOrder) => {
        setSelectedPo(po);
        setIsReceiveModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsPoModalOpen(false);
        setIsReceiveModalOpen(false);
        setSelectedPo(null);
    };

    const handleSavePo = async (poData: Omit<PurchaseOrder, 'id'> & { id?: string }) => {
        let updatedPOs;
        if (poData.id) {
            updatedPOs = purchaseOrders.map(p => p.id === poData.id ? { ...p, ...poData } as PurchaseOrder : p);
        } else {
            const newPo: PurchaseOrder = { ...poData, id: `po_${Date.now()}` };
            updatedPOs = [newPo, ...purchaseOrders].sort((a, b) => (b.datePlaced || '').localeCompare(a.datePlaced || ''));
        }
        await savePurchaseOrders(updatedPOs);
        setPurchaseOrders(updatedPOs);
        handleCloseModals();
    };

    const handlePlaceOrder = async (poId: string) => {
        // FIX: Explicitly cast the 'status' property to match the PurchaseOrder type and resolve type inference issue.
        const updatedPOs = purchaseOrders.map(p => p.id === poId ? { ...p, status: 'placed' as PurchaseOrder['status'], datePlaced: new Date().toISOString() } : p);
        await savePurchaseOrders(updatedPOs);
        setPurchaseOrders(updatedPOs);
    };

    const handleConfirmReceipt = async (poId: string, receiptNotes: string) => {
        const po = purchaseOrders.find(p => p.id === poId);
        if (!po) return;

        const allItems: OrderItem[] = po.isPersonalStockOrder ? po.personalStockItems : po.clientOrders.flatMap(co => co.items);
        const receivingStaffLocation = locations.find(l => l.locationId === `${po.receivingStaffId}_stock`);
        if (!receivingStaffLocation) {
            alert(`Error: Staff member ${po.receivingStaffName} does not have an associated stock location.`);
            return;
        }

        const currentComponents = await getComponents();
        let updatedComponents = [...currentComponents];
        const newMovements: StockMovement[] = [];

        allItems.forEach(item => {
            const compIndex = updatedComponents.findIndex(c => c.id === item.componentId);
            if (compIndex > -1) {
                const component = updatedComponents[compIndex];
                const breakdown = component.stock_breakdown || [];
                const locIndex = breakdown.findIndex(l => l.locationId === receivingStaffLocation.locationId);

                if (locIndex > -1) breakdown[locIndex].quantity += item.quantity;
                else breakdown.push({ ...receivingStaffLocation, quantity: item.quantity });

                component.stock_breakdown = breakdown;
                component.current_stock = breakdown.reduce((sum, loc) => sum + loc.quantity, 0);
                updatedComponents[compIndex] = component;

                newMovements.push({
                    id: `mov_po_${po.id.slice(-4)}_${item.componentId}`, type: 'purchase', componentName: item.componentName,
                    toLocationName: receivingStaffLocation.locationName, qty: item.quantity, unit_price: item.purchasePrice,
                    total_price: item.purchasePrice * item.quantity, timestamp: new Date().toISOString(),
                    createdBy: po.receivingStaffName, reason: `PO from ${po.supplierName}`,
                });
            }
        });

        const currentMovements = await getStockMovements();
        const updatedMovements = [...newMovements, ...currentMovements];
        // FIX: Explicitly cast the 'status' property to match the PurchaseOrder type and resolve type inference issue.
        const updatedPOs = purchaseOrders.map(p =>
            p.id === poId
                ? { ...p, status: 'received' as PurchaseOrder['status'], receiptNotes, dateReceived: new Date().toISOString() }
                : p
        );
        
        await Promise.all([
            saveComponents(updatedComponents),
            saveStockMovements(updatedMovements),
            savePurchaseOrders(updatedPOs)
        ]);

        setComponents(updatedComponents);
        setPurchaseOrders(updatedPOs);
        handleCloseModals();
    };

    const StatusBadge = ({ status }: { status: PurchaseOrder['status'] }) => {
        const base = "flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-full";
        if (status === 'draft') return <span className={`${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}><FilePenLine size={14}/>Draft</span>;
        if (status === 'placed') return <span className={`${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}><Truck size={14}/>Placed</span>;
        if (status === 'received') return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}><Check size={14}/>Received</span>;
        return null;
    };
    
    if (isLoading) {
        return <LoadingSpinner message="Loading order data..." />;
    }

    if (error) {
        return <ErrorDisplay title="Error" message={error} />;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
                <button
                    onClick={() => handleOpenPoModal()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none"
                >
                    <PlusCircle className="h-5 w-5" />
                    Create Purchase Order
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="p-4 w-10"></th>
                                <th className="p-4">PO ID</th>
                                <th className="p-4">Supplier</th>
                                <th className="p-4">Date Placed</th>
                                <th className="p-4">Receiver</th>
                                <th className="p-4 text-right">Total Cost</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrders.map(po => (
                                <React.Fragment key={po.id}>
                                    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                        <td className="p-4">
                                            <button onClick={() => setExpandedPo(expandedPo === po.id ? null : po.id)}>
                                                {expandedPo === po.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                            </button>
                                        </td>
                                        <td className="p-4 font-medium dark:text-white">#{po.id.slice(-6)}</td>
                                        <td className="p-4">{po.supplierName}</td>
                                        <td className="p-4">{po.datePlaced ? new Date(po.datePlaced).toLocaleDateString() : 'N/A'}</td>
                                        <td className="p-4">{po.receivingStaffName}</td>
                                        <td className="p-4 text-right font-semibold">${po.totalCost.toFixed(2)}</td>
                                        <td className="p-4 text-center"><StatusBadge status={po.status} /></td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                {po.status === 'draft' && <button onClick={() => handlePlaceOrder(po.id)} className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Place Order</button>}
                                                {po.status === 'placed' && <button onClick={() => handleOpenReceiveModal(po)} className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700"><PackageCheck size={14}/>Receive</button>}
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedPo === po.id && (
                                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                                            <td colSpan={8} className="p-4">
                                                <h4 className="font-bold mb-2">Order Details</h4>
                                                {po.isPersonalStockOrder ? (
                                                    <div>
                                                        <p className="font-semibold text-sm">For Internal Stock:</p>
                                                        <ul className="list-disc pl-5 mt-1 text-xs">
                                                            {po.personalStockItems.map(item => <li key={item.componentId}>{item.quantity} x {item.componentName}</li>)}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    po.clientOrders.map(co => (
                                                        <div key={co.id} className="mb-2">
                                                            <p className="font-semibold text-sm">Client: {co.clientName} (Cost: ${co.totalCost.toFixed(2)} | Value: ${co.totalValue.toFixed(2)})</p>
                                                            <ul className="list-disc pl-5 mt-1 text-xs">
                                                                {co.items.map(item => <li key={item.componentId}>{item.quantity} x {item.componentName}</li>)}
                                                            </ul>
                                                        </div>
                                                    ))
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPoModalOpen && (
                <PurchaseOrderModal
                    isOpen={isPoModalOpen}
                    onClose={handleCloseModals}
                    onSave={handleSavePo}
                    purchaseOrder={selectedPo}
                    suppliers={suppliers}
                    staff={staff}
                    components={components}
                />
            )}
            {isReceiveModalOpen && selectedPo && (
                <ReceiveOrderModal
                    isOpen={isReceiveModalOpen}
                    onClose={handleCloseModals}
                    onConfirmReceipt={handleConfirmReceipt}
                    purchaseOrder={selectedPo}
                />
            )}
        </div>
    );
};

export default OrdersPage;