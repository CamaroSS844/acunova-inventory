import React, { useState, useEffect } from 'react';
import { StaffMember, Role } from '../../types';
import { X } from 'lucide-react';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffMember: Omit<StaffMember, 'id'> & { id?: string }) => void;
  staffMember: StaffMember | null;
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSave, staffMember }) => {
    const initialState = {
        name: '',
        role: 'Sales Rep' as Role,
        email: '',
        phone: '',
        status: 'active' as StaffMember['status'],
    };
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(staffMember || initialState);
            setErrors({});
        }
    }, [staffMember, isOpen]);
    
    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300);
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required.';
        if (!formData.role.trim()) newErrors.role = 'Role is required.';
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'A valid email is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({...prev, [name]: ''}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({ ...formData, id: staffMember?.id });
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
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{staffMember ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
                            <button type="button" onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"><X size={20} /></button>
                        </div>
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input name="name" value={formData.name} onChange={handleChange} className={`mt-1 ${inputClasses(!!errors.name)}`} />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                    <select name="role" value={formData.role} onChange={handleChange} className={`mt-1 ${inputClasses(!!errors.role)}`}>
                                        <option value="Admin">Admin</option>
                                        <option value="Warehouse Staff">Warehouse Staff</option>
                                        <option value="Sales Rep">Sales Rep</option>
                                    </select>
                                    {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`mt-1 ${inputClasses(!!errors.email)}`} />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} className={`mt-1 ${inputClasses(false)}`} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className={`mt-1 ${inputClasses(false)}`}>
                                        <option value="active">Active</option>
                                        <option value="on_leave">On Leave</option>
                                        <option value="terminated">Terminated</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex flex-row-reverse rounded-b-lg gap-3">
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none">Save</button>
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StaffModal;