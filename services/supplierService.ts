import { Supplier } from '../types';
import { getFromStorage, saveToStorage } from './apiService';
import { initialSuppliers } from '../data/initialData';

const SUPPLIERS_KEY = 'ac_suppliers';

export const getSuppliers = (): Promise<Supplier[]> => getFromStorage(SUPPLIERS_KEY, initialSuppliers);
export const saveSuppliers = (suppliers: Supplier[]): Promise<void> => saveToStorage(SUPPLIERS_KEY, suppliers);