import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types';
import { X } from 'lucide-react';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Omit<Supplier, 'id' | 'totalSpend' | 'lastPurchaseDate'> & { id?: string }) => void;
  supplier: Supplier | null;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, onSave, supplier }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    status: 'active' as Supplier['status'],
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (supplier) {
          setFormData({
            name: supplier.name,
            contactName: supplier.contactName || '',
            contactEmail: supplier.contactEmail || '',
            status: supplier.status || 'active',
          });
        } else {
          setFormData({ name: '', contactName: '', contactEmail: '', status: 'active' });
        }
        setErrors({});
    }
  }, [supplier, isOpen]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
        onClose();
        setIsAnimatingOut(false);
    }, 300);
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required.';
    }
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Email address is invalid.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({ ...formData, id: supplier?.id });
      handleClose();
    }
  };

  if (!isOpen) return null;

  const inputClasses = (hasError: boolean) =>
    `block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500`;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ${!isAnimatingOut ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all duration-300 ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {supplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>
              <button type="button" onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:ring-offset-gray-800"><X size={20}/></button>
            </div>
            
            <div className="space-y-4 mt-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={`mt-1 ${inputClasses(!!errors.name)}`} />
                {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Name</label>
                    <input type="text" name="contactName" id="contactName" value={formData.contactName} onChange={handleChange} className={`mt-1 ${inputClasses(false)}`}/>
                </div>
                 <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email</label>
                    <input type="email" name="contactEmail" id="contactEmail" value={formData.contactEmail} onChange={handleChange} className={`mt-1 ${inputClasses(!!errors.contactEmail)}`} />
                    {errors.contactEmail && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.contactEmail}</p>}
                </div>
              </div>
               <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select name="status" id="status" value={formData.status} onChange={handleChange} className={`mt-1 ${inputClasses(false)}`}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none">Save Supplier</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
