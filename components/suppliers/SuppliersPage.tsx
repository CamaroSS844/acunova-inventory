import React, { useState, useEffect, useCallback } from 'react';
import { Supplier } from '../../types';
import { getSuppliers, saveSuppliers } from '../../services/supplierService';
import SupplierModal from './SupplierModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError("Failed to load suppliers.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (supplier: Supplier | null = null) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleSaveSupplier = async (supplierData: Omit<Supplier, 'id' | 'totalSpend' | 'lastPurchaseDate'> & { id?: string }) => {
    let updatedSuppliers;
    if (supplierData.id) {
      updatedSuppliers = suppliers.map(s => s.id === supplierData.id ? { ...s, ...supplierData } as Supplier : s);
    } else {
      const newSupplier: Supplier = {
        ...supplierData,
        id: `supp_${Date.now()}`,
        totalSpend: 0,
        lastPurchaseDate: new Date().toISOString(),
      };
      updatedSuppliers = [...suppliers, newSupplier];
    }
    await saveSuppliers(updatedSuppliers);
    setSuppliers(updatedSuppliers);
    handleCloseModal();
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
        const updatedSuppliers = suppliers.filter(s => s.id !== supplierId);
        await saveSuppliers(updatedSuppliers);
        setSuppliers(updatedSuppliers);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading suppliers..." />;
  }

  if (error) {
    return <ErrorDisplay title="Error" message={error} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusCircle className="h-5 w-5" />
          Add Supplier
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Supplier Name</th>
                <th scope="col" className="px-6 py-3">Contact Person</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{supplier.name}</td>
                  <td className="px-6 py-4">{supplier.contactName}</td>
                  <td className="px-6 py-4">{supplier.contactEmail}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${supplier.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-4">
                      <button onClick={() => handleOpenModal(supplier)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDeleteSupplier(supplier.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <SupplierModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveSupplier}
            supplier={editingSupplier}
        />
      )}
    </div>
  );
};

export default SuppliersPage;