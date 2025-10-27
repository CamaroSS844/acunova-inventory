import React, { useState, useEffect, useCallback } from 'react';
import { Component, StockLocation, StockMovement } from '../../types';
import { getComponents, saveComponents, getLocations, getStockMovements, saveStockMovements } from '../../services/stockService';
import ComponentModal from './ComponentModal';
import StockTransferModal from './StockTransferModal';
import StockBreakdownModal from './StockBreakdownModal';
import StockAdjustmentModal from './StockAdjustmentModal';
import StockMovementsHistoryModal from './StockMovementsHistoryModal';
import { useAuth } from '../auth/AuthContext';
import { PlusCircle, Edit, Trash2, Move, PackageSearch, ClipboardEdit, History, Lock } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

const StockPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [components, setComponents] = useState<Component[]>([]);
    const [locations, setLocations] = useState<Omit<StockLocation, 'quantity'>[]>([]);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
    const [categoryFilter, setCategoryFilter] = useState('All');

    const hasWriteAccess = currentUser?.role === 'Admin' || currentUser?.role === 'Warehouse Staff';

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [componentsData, locationsData, movementsData] = await Promise.all([
                getComponents(),
                getLocations(),
                getStockMovements()
            ]);
            setComponents(componentsData);
            setLocations(locationsData);
            setStockMovements(movementsData);
        } catch (err) {
            setError("Failed to load stock data. Please try refreshing the page.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleOpenModal = (component: Component | null = null) => {
        setSelectedComponent(component);
        setIsModalOpen(true);
    };

    const handleOpenTransferModal = (component: Component) => {
        setSelectedComponent(component);
        setIsTransferModalOpen(true);
    };

    const handleOpenAdjustmentModal = (component: Component) => {
        setSelectedComponent(component);
        setIsAdjustmentModalOpen(true);
    };

    const handleOpenBreakdownModal = (component: Component) => {
        setSelectedComponent(component);
        setIsBreakdownModalOpen(true);
    }

    const handleOpenHistoryModal = () => {
        setIsHistoryModalOpen(true);
    }

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsTransferModalOpen(false);
        setIsAdjustmentModalOpen(false);
        setIsBreakdownModalOpen(false);
        setIsHistoryModalOpen(false);
        setSelectedComponent(null);
    };

    const handleSaveComponent = async (componentData: Omit<Component, 'id'> & { id?: string }) => {
        const calculateTotalStock = (breakdown: StockLocation[] | undefined) => breakdown?.reduce((sum, loc) => sum + loc.quantity, 0) || 0;
        
        let updatedComponents;
        if (componentData.id) {
            updatedComponents = components.map(c => c.id === componentData.id ? { ...c, ...componentData, current_stock: calculateTotalStock(componentData.stock_breakdown) } as Component : c);
        } else {
            const newComponent: Component = {
                ...componentData,
                id: `comp_${Date.now()}`,
                current_stock: calculateTotalStock(componentData.stock_breakdown),
            };
            updatedComponents = [...components, newComponent];
        }
        await saveComponents(updatedComponents);
        setComponents(updatedComponents);
        handleCloseModals();
    };

    const handleDeleteComponent = async (componentId: string) => {
        if (window.confirm('Are you sure you want to delete this component?')) {
            const updatedComponents = components.filter(c => c.id !== componentId);
            await saveComponents(updatedComponents);
            setComponents(updatedComponents);
        }
    };
    
    const handleTransfer = async (componentId: string, fromLocationId: string, toLocationId: string, quantity: number) => {
        const component = components.find(c => c.id === componentId);
        if (!component) return;

        const fromLocation = locations.find(l => l.locationId === fromLocationId);
        const toLocation = locations.find(l => l.locationId === toLocationId);
        if (!fromLocation || !toLocation) return;
        
        const updatedComponents = components.map(c => {
            if (c.id === componentId) {
                const newBreakdown = [...(c.stock_breakdown || [])];
                
                const fromIdx = newBreakdown.findIndex(l => l.locationId === fromLocationId);
                if (fromIdx !== -1) newBreakdown[fromIdx].quantity -= quantity;

                const toIdx = newBreakdown.findIndex(l => l.locationId === toLocationId);
                if (toIdx !== -1) {
                    newBreakdown[toIdx].quantity += quantity;
                } else {
                    const toLocationData = locations.find(l => l.locationId === toLocationId);
                    if (toLocationData) newBreakdown.push({ ...toLocationData, quantity });
                }
                
                const updatedComponent = { ...c, stock_breakdown: newBreakdown.filter(l => l.quantity > 0) };
                updatedComponent.current_stock = updatedComponent.stock_breakdown.reduce((sum, loc) => sum + loc.quantity, 0);
                return updatedComponent;
            }
            return c;
        });
        setComponents(updatedComponents);

        const newMovement: StockMovement = {
            id: `mov_${Date.now()}`,
            type: 'transfer',
            componentName: component.name,
            fromLocationName: fromLocation.locationName,
            toLocationName: toLocation.locationName,
            qty: quantity,
            unit_price: component.default_price,
            total_price: component.default_price * quantity,
            timestamp: new Date().toISOString(),
            createdBy: currentUser?.name || 'System',
        };
        const updatedMovements = [newMovement, ...stockMovements];
        setStockMovements(updatedMovements);

        await Promise.all([saveComponents(updatedComponents), saveStockMovements(updatedMovements)]);
        handleCloseModals();
    };

    const handleStockAdjustment = async (componentId: string, locationId: string, quantity: number, type: 'increase' | 'decrease', reason: string) => {
        const component = components.find(c => c.id === componentId);
        if (!component) return;

        const location = locations.find(l => l.locationId === locationId);
        if (!location) return;

        const updatedComponents = components.map(c => {
            if (c.id === componentId) {
                const newBreakdown = [...(c.stock_breakdown || [])];
                const locationIdx = newBreakdown.findIndex(l => l.locationId === locationId);

                if (locationIdx !== -1) {
                    if (type === 'increase') {
                        newBreakdown[locationIdx].quantity += quantity;
                    } else {
                        newBreakdown[locationIdx].quantity -= quantity;
                    }
                } else if (type === 'increase') {
                    newBreakdown.push({ ...location, quantity });
                }
                
                const updatedComponent = { ...c, stock_breakdown: newBreakdown.filter(l => l.quantity > 0) };
                updatedComponent.current_stock = updatedComponent.stock_breakdown.reduce((sum, loc) => sum + loc.quantity, 0);
                return updatedComponent;
            }
            return c;
        });
        setComponents(updatedComponents);

        const newMovement: StockMovement = {
            id: `mov_${Date.now()}`,
            type: 'adjustment',
            componentName: component.name,
            fromLocationName: type === 'decrease' ? location.locationName : undefined,
            toLocationName: type === 'increase' ? location.locationName : undefined,
            qty: quantity,
            unit_price: component.default_price,
            total_price: component.default_price * quantity,
            timestamp: new Date().toISOString(),
            createdBy: currentUser?.name || 'System',
            reason: reason,
        };
        const updatedMovements = [newMovement, ...stockMovements];
        setStockMovements(updatedMovements);
        
        await Promise.all([saveComponents(updatedComponents), saveStockMovements(updatedMovements)]);
        handleCloseModals();
    };

    const categories = ['All', ...Array.from(new Set(components.map(c => c.category).filter((c): c is string => !!c)))];

    const filteredComponents = components.filter(component =>
        categoryFilter === 'All' || component.category === categoryFilter
    );

    if (isLoading) {
        return <LoadingSpinner message="Loading stock data..." />;
    }

    if (error) {
        return <ErrorDisplay title="Error" message={error} />;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stock Inventory</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenHistoryModal}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-100 dark:text-primary-300 dark:bg-primary-900/50 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <History className="h-5 w-5" />
                        Movement History
                    </button>
                    {hasWriteAccess && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <PlusCircle className="h-5 w-5" />
                            Add Component
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Filter by category:</span>
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setCategoryFilter(category)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                            categoryFilter === category
                            ? 'bg-primary-600 text-white shadow'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">Component Name</th>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">Category</th>
                                <th scope="col" className="px-6 py-3 text-right whitespace-nowrap">Total Stock</th>
                                <th scope="col" className="px-6 py-3 text-right whitespace-nowrap">Reorder Level</th>
                                <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComponents.length > 0 ? (
                                filteredComponents.map((component) => (
                                <tr key={component.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{component.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{component.category}</td>
                                    <td className={`px-6 py-4 text-right font-medium whitespace-nowrap ${component.current_stock < component.reorder_level ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                        {component.current_stock} {component.unit}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">{component.reorder_level} {component.unit}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <div className="flex justify-center items-center gap-2">
                                            <button onClick={() => handleOpenBreakdownModal(component)} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" title="View Stock Breakdown"><PackageSearch className="h-5 w-5" /></button>
                                            {hasWriteAccess ? (
                                                <>
                                                    <button onClick={() => handleOpenTransferModal(component)} className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400" title="Transfer Stock"><Move className="h-5 w-5" /></button>
                                                    <button onClick={() => handleOpenAdjustmentModal(component)} className="p-2 text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400" title="Adjust Stock"><ClipboardEdit className="h-5 w-5" /></button>
                                                    <button onClick={() => handleOpenModal(component)} className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400" title="Edit Component"><Edit className="h-5 w-5" /></button>
                                                    <button onClick={() => handleDeleteComponent(component.id)} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400" title="Delete Component"><Trash2 className="h-5 w-5" /></button>
                                                </>
                                            ) : (
                                                <span title="You don't have permission to perform this action" className="p-2 text-gray-400 dark:text-gray-500 cursor-not-allowed"><Lock className="h-5 w-5" /></span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <PackageSearch className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-200">No Components Found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            There are no components matching the category "{categoryFilter}".
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <ComponentModal isOpen={isModalOpen} onClose={handleCloseModals} onSave={handleSaveComponent} component={selectedComponent} locations={locations} />}
            {isTransferModalOpen && selectedComponent && <StockTransferModal isOpen={isTransferModalOpen} onClose={handleCloseModals} onTransfer={handleTransfer} component={selectedComponent} locations={locations} />}
            {isAdjustmentModalOpen && selectedComponent && <StockAdjustmentModal isOpen={isAdjustmentModalOpen} onClose={handleCloseModals} onAdjust={handleStockAdjustment} component={selectedComponent} />}
            {isBreakdownModalOpen && selectedComponent && <StockBreakdownModal isOpen={isBreakdownModalOpen} onClose={handleCloseModals} component={selectedComponent} />}
            {isHistoryModalOpen && <StockMovementsHistoryModal isOpen={isHistoryModalOpen} onClose={handleCloseModals} movements={stockMovements} components={components} />}
        </div>
    );
};

export default StockPage;