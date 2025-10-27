import React, { useState, useEffect, useCallback } from 'react';
import { StaffMember, BankAccount, StockLocation } from '../../types';
import { getStaff, saveStaff } from '../../services/staffService';
import { getAccounts, saveAccounts } from '../../services/financeService';
import { getLocations, saveLocations } from '../../services/stockService';
import StaffModal from './StaffModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

const StaffPage: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const staffData = await getStaff();
            setStaff(staffData);
        } catch (err) {
            setError("Failed to load staff data.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (staffMember: StaffMember | null = null) => {
        setEditingStaff(staffMember);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    const handleSaveStaff = async (staffData: Omit<StaffMember, 'id'> & { id?: string }) => {
        let updatedStaff;
        if (staffData.id) { // Editing existing staff
            updatedStaff = staff.map(s => s.id === staffData.id ? { ...s, ...staffData } as StaffMember : s);
            await saveStaff(updatedStaff);
            setStaff(updatedStaff);
        } else { // Adding new staff
            const newStaffMember: StaffMember = { ...staffData, id: `staff_${Date.now()}` };
            updatedStaff = [...staff, newStaffMember];
            
            const [currentAccounts, currentLocations] = await Promise.all([getAccounts(), getLocations()]);
            
            const newCashAccount: BankAccount = {
                id: `${newStaffMember.id}_cash`, name: `${newStaffMember.name}'s Cash on Hand`, type: 'cash', balance: 0,
            };
            const newStockLocation: Omit<StockLocation, 'quantity'> = {
                locationId: `${newStaffMember.id}_stock`, locationName: `${newStaffMember.name}'s Pocket`,
            };

            await Promise.all([
                saveStaff(updatedStaff),
                saveAccounts([...currentAccounts, newCashAccount]),
                saveLocations([...currentLocations, newStockLocation]),
            ]);
            setStaff(updatedStaff);
        }
        handleCloseModal();
    };

    const handleDeleteStaff = async (staffId: string) => {
        if (window.confirm('Are you sure you want to delete this staff member? This will also remove their associated cash and stock locations.')) {
            const updatedStaff = staff.filter(s => s.id !== staffId);
            
            const [currentAccounts, currentLocations] = await Promise.all([getAccounts(), getLocations()]);

            const updatedAccounts = currentAccounts.filter(acc => acc.id !== `${staffId}_cash`);
            const updatedLocations = currentLocations.filter(loc => loc.locationId !== `${staffId}_stock`);

            await Promise.all([
                saveStaff(updatedStaff),
                saveAccounts(updatedAccounts),
                saveLocations(updatedLocations)
            ]);
            setStaff(updatedStaff);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Loading staff data..." />;
    }

    if (error) {
        return <ErrorDisplay title="Error" message={error} />;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg"
                >
                    <PlusCircle className="h-5 w-5" />
                    Add Staff
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((member) => (
                                <tr key={member.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                    <td className="px-6 py-4 font-medium whitespace-nowrap dark:text-white">{member.name}</td>
                                    <td className="px-6 py-4">{member.role}</td>
                                    <td className="px-6 py-4">{member.email}</td>
                                    <td className="px-6 py-4">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        member.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                        member.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                                      }`}>
                                        {member.status.replace('_', ' ')}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-4">
                                            <button onClick={() => handleOpenModal(member)} className="text-primary-600 hover:text-primary-800"><Edit className="h-5 w-5" /></button>
                                            <button onClick={() => handleDeleteStaff(member.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-5 w-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <StaffModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveStaff} staffMember={editingStaff} />}
        </div>
    );
};

export default StaffPage;