import React, { useState, useEffect, useCallback } from 'react';
import { BankAccount, FinanceTransaction, Sale, StaffMember, Component, StockLocation, StockMovement } from '../../types';
import { getAccounts, saveAccounts, getTransactions, saveTransactions, getSales, saveSales } from '../../services/financeService';
import { getStaff } from '../../services/staffService';
import { getComponents, saveComponents, getLocations, getStockMovements, saveStockMovements } from '../../services/stockService';
import TransactionModal from './TransactionModal';
import SalesForm from './SalesForm';
import SalesHistory from './SalesHistory';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

const FinancePage: React.FC = () => {
    const { currentUser } = useAuth();
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [components, setComponents] = useState<Component[]>([]);
    const [locations, setLocations] = useState<Omit<StockLocation, 'quantity'>[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);

    const isAdmin = currentUser?.role === 'Admin';

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [
                accountsData, 
                transactionsData, 
                salesData, 
                staffData, 
                componentsData, 
                locationsData
            ] = await Promise.all([
                getAccounts(),
                getTransactions(),
                getSales(),
                getStaff(),
                getComponents(),
                getLocations(),
            ]);

            setAccounts(accountsData);
            setTransactions(transactionsData);
            setSales(salesData);
            setStaff(staffData);
            setComponents(componentsData);
            setLocations(locationsData);

        } catch (err) {
            setError("Failed to load financial data. Please try refreshing.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenTransactionModal = (transaction: FinanceTransaction | null = null) => {
        setEditingTransaction(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsTransactionModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSaveTransaction = async (transactionData: Omit<FinanceTransaction, 'id'> & { id?: string }) => {
        let updatedTransactions;
        const newTransaction: FinanceTransaction = { ...transactionData, id: `trans_${Date.now()}` };

        if (transactionData.id) {
            // Note: Editing transactions should handle balance rollbacks, which is complex.
            // For this implementation, we'll just update the transaction record.
            updatedTransactions = transactions.map(t => t.id === transactionData.id ? { ...t, ...transactionData } as FinanceTransaction : t);
        } else {
            updatedTransactions = [newTransaction, ...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        const updateBalances = (prevAccounts: BankAccount[], tx: FinanceTransaction) => {
            return prevAccounts.map(acc => {
                if (acc.id === tx.fromAccountId) return { ...acc, balance: acc.balance - tx.amount };
                if (acc.id === tx.toAccountId) return { ...acc, balance: acc.balance + tx.amount };
                return acc;
            });
        };

        const updatedAccounts = updateBalances(accounts, newTransaction);

        await Promise.all([
            saveTransactions(updatedTransactions),
            saveAccounts(updatedAccounts)
        ]);
        
        setTransactions(updatedTransactions);
        setAccounts(updatedAccounts);
        handleCloseModal();
    };
    
    const handleSaveSale = async (saleData: Omit<Sale, 'id'>) => {
        const newSale: Sale = { ...saleData, id: `sale_${Date.now()}` };
        
        // 1. Prepare Finance Update
        const newTransaction: FinanceTransaction = {
            id: `trans_sale_${newSale.id}`,
            type: 'revenue',
            description: `Sale to ${newSale.customerName}`,
            amount: newSale.totalAmount,
            date: newSale.date,
            toAccountId: newSale.paymentToAccountId,
            category: 'Sales'
        };
        const updatedTransactions = [newTransaction, ...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const updatedAccounts = accounts.map(acc => 
            acc.id === newSale.paymentToAccountId 
            ? { ...acc, balance: acc.balance + newSale.totalAmount } 
            : acc
        );

        // 2. Prepare Stock and Movements Update
        let updatedComponents = [...components];
        const newMovements: StockMovement[] = [];
        const fromLocation = locations.find(l => l.locationId === newSale.fromLocationId);

        for (const itemSold of newSale.items) {
            const componentIndex = updatedComponents.findIndex(c => c.id === itemSold.componentId);
            if (componentIndex === -1) continue;

            let componentToUpdate = { ...updatedComponents[componentIndex] };
            
            const newBreakdown = (componentToUpdate.stock_breakdown || []).map(loc => {
                if (loc.locationId === newSale.fromLocationId) {
                    return { ...loc, quantity: loc.quantity - itemSold.quantity };
                }
                return loc;
            }).filter(loc => loc.quantity > 0);

            const newMovement: StockMovement = {
                id: `mov_sale_${newSale.id}_${componentToUpdate.id}`, type: 'sale', componentName: componentToUpdate.name, fromLocationName: fromLocation?.locationName,
                qty: itemSold.quantity, unit_price: itemSold.unitPrice, total_price: itemSold.totalPrice, timestamp: newSale.date, createdBy: newSale.staffName,
            };
            newMovements.push(newMovement);
            
            componentToUpdate = { ...componentToUpdate, stock_breakdown: newBreakdown, current_stock: (componentToUpdate.current_stock || 0) - itemSold.quantity };
            updatedComponents[componentIndex] = componentToUpdate;
        }
        
        const currentMovements = await getStockMovements();
        const updatedMovements = [...newMovements, ...currentMovements];
        const updatedSales = [newSale, ...sales].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // 3. Save all changes
        await Promise.all([
            saveTransactions(updatedTransactions),
            saveAccounts(updatedAccounts),
            saveComponents(updatedComponents),
            saveStockMovements(updatedMovements),
            saveSales(updatedSales)
        ]);

        // 4. Update local state
        setTransactions(updatedTransactions);
        setAccounts(updatedAccounts);
        setComponents(updatedComponents);
        setSales(updatedSales);
    };

    if (isLoading) {
        return <LoadingSpinner message="Loading financial data..." />;
    }

    if (error) {
        return <ErrorDisplay title="Error" message={error} />;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finance</h1>
                {isAdmin && (
                    <button
                        onClick={() => handleOpenTransactionModal()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg"
                    >
                        <PlusCircle className="h-5 w-5" />
                        Add Transaction
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {accounts.map(acc => (
                    <div key={acc.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-600 dark:text-gray-300 truncate">{acc.name}</h3>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(acc.balance)}</p>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                    <SalesForm 
                        staff={staff}
                        components={components}
                        accounts={accounts}
                        locations={locations}
                        onSave={handleSaveSale}
                        currentStaffId={currentUser?.id}
                    />
                </div>
                <div className="lg:col-span-3">
                     <SalesHistory sales={sales} />
                </div>
            </div>

            {isAdmin && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Financial Ledger</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr className="border-b dark:border-gray-700">
                                    <th className="text-left p-3">Date</th>
                                    <th className="text-left p-3">Description</th>
                                    <th className="text-left p-3">Account</th>
                                    <th className="text-right p-3">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                        <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                                        <td className="p-3 font-medium dark:text-white">{t.description}</td>
                                        <td className="p-3 text-gray-500 dark:text-gray-400">
                                            {t.type === 'transfer' ? `${accounts.find(a=>a.id === t.fromAccountId)?.name} → ${accounts.find(a=>a.id === t.toAccountId)?.name}` :
                                            (accounts.find(a => a.id === t.fromAccountId || a.id === t.toAccountId)?.name)}
                                        </td>
                                        <td className={`p-3 text-right font-semibold ${t.type === 'deposit' || t.type === 'revenue' ? 'text-green-500' : 'text-red-500'}`}>
                                            {t.type !== 'deposit' && t.type !== 'revenue' && '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isTransactionModalOpen && <TransactionModal isOpen={isTransactionModalOpen} onClose={handleCloseModal} onSave={handleSaveTransaction} transaction={editingTransaction} accounts={accounts} />}
        </div>
    );
};

export default FinancePage;