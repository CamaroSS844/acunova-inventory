import React, { useState, useEffect } from 'react';
import { FinanceTransaction, BankAccount } from '../../types';
import { X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<FinanceTransaction, 'id'> & { id?: string }) => void;
  transaction: FinanceTransaction | null;
  accounts: BankAccount[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transaction, accounts }) => {
  const [formData, setFormData] = useState({
    type: 'deposit' as FinanceTransaction['type'],
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    fromAccountId: '',
    toAccountId: '',
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (transaction) {
          setFormData({
            type: transaction.type,
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date.split('T')[0],
            fromAccountId: transaction.fromAccountId || '',
            toAccountId: transaction.toAccountId || '',
          });
        } else {
          setFormData({
            type: 'deposit',
            description: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            fromAccountId: '',
            toAccountId: accounts[0]?.id || '',
          });
        }
        setErrors({});
    }
  }, [transaction, isOpen, accounts]);
  
  useEffect(() => {
    const { type } = formData;
    const firstAccountId = accounts[0]?.id || '';
    
    if (type === 'deposit') {
        setFormData(prev => ({...prev, fromAccountId: '', toAccountId: prev.toAccountId || firstAccountId}));
    } else if (type === 'withdrawal') {
        setFormData(prev => ({...prev, toAccountId: '', fromAccountId: prev.fromAccountId || firstAccountId}));
    } else { // transfer
        setFormData(prev => ({...prev, 
            fromAccountId: prev.fromAccountId || firstAccountId,
            toAccountId: prev.toAccountId || accounts[1]?.id || firstAccountId
        }));
    }
  }, [formData.type, accounts]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
        onClose();
        setIsAnimatingOut(false);
    }, 300);
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (formData.amount <= 0) newErrors.amount = 'Amount must be positive.';
    if (!formData.date) newErrors.date = 'Date is required.';

    if (formData.type === 'deposit' && !formData.toAccountId) newErrors.toAccountId = 'Select a deposit account.';
    if (formData.type === 'withdrawal' && !formData.fromAccountId) newErrors.fromAccountId = 'Select a withdrawal account.';
    if (formData.type === 'transfer') {
        if (!formData.fromAccountId) newErrors.fromAccountId = 'Select a source account.';
        if (!formData.toAccountId) newErrors.toAccountId = 'Select a destination account.';
        if (formData.fromAccountId && formData.fromAccountId === formData.toAccountId) {
            newErrors.toAccountId = 'Accounts cannot be the same.';
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = name === 'amount';
    setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
    if (errors[name]) setErrors(prev => ({...prev, [name]: ''}));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const finalData: Omit<FinanceTransaction, 'id'> = {
        type: formData.type,
        description: formData.description,
        amount: formData.amount,
        date: new Date(formData.date).toISOString(),
        fromAccountId: formData.type !== 'deposit' ? formData.fromAccountId : undefined,
        toAccountId: formData.type !== 'withdrawal' ? formData.toAccountId : undefined,
      };
      onSave({ ...finalData, id: transaction?.id });
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{transaction ? 'Edit Transaction' : 'New Transaction'}</h2>
              <button type="button" onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"><X size={20}/></button>
            </div>
            
            <div className="space-y-4 mt-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <select name="type" id="type" value={formData.type} onChange={handleChange} className={`mt-1 ${inputClasses(false)}`}>
                    <option value="deposit">Deposit / Revenue</option>
                    <option value="withdrawal">Withdrawal / Expense</option>
                    <option value="transfer">Transfer</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required className={`mt-1 ${inputClasses(!!errors.description)}`}/>
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ($)</label>
                  <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" className={`mt-1 ${inputClasses(!!errors.amount)}`}/>
                  {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                  <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className={`mt-1 ${inputClasses(!!errors.date)}`}/>
                  {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
                </div>
              </div>
              
              {formData.type === 'transfer' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fromAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
                    <select name="fromAccountId" id="fromAccountId" value={formData.fromAccountId} onChange={handleChange} className={`mt-1 ${inputClasses(!!errors.fromAccountId)}`}>
                      {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                    {errors.fromAccountId && <p className="mt-1 text-xs text-red-600">{errors.fromAccountId}</p>}
                  </div>
                   <div>
                    <label htmlFor="toAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
                    <select name="toAccountId" id="toAccountId" value={formData.toAccountId} onChange={handleChange} className={`mt-1 ${inputClasses(!!errors.toAccountId)}`}>
                      {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                    {errors.toAccountId && <p className="mt-1 text-xs text-red-600">{errors.toAccountId}</p>}
                  </div>
                </div>
              )}
              
              {(formData.type === 'deposit' || formData.type === 'revenue') && (
                <div>
                  <label htmlFor="toAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account</label>
                  <select name="toAccountId" id="toAccountId" value={formData.toAccountId} onChange={handleChange} className={`mt-1 ${inputClasses(!!errors.toAccountId)}`}>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                  {errors.toAccountId && <p className="mt-1 text-xs text-red-600">{errors.toAccountId}</p>}
                </div>
              )}

              {(formData.type === 'withdrawal' || formData.type === 'expense') && (
                <div>
                  <label htmlFor="fromAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account</label>
                  <select name="fromAccountId" id="fromAccountId" value={formData.fromAccountId} onChange={handleChange} className={`mt-1 ${inputClasses(!!errors.fromAccountId)}`}>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                  {errors.fromAccountId && <p className="mt-1 text-xs text-red-600">{errors.fromAccountId}</p>}
                </div>
              )}

            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium rounded-md shadow-sm border focus:outline-none">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none">Save Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
