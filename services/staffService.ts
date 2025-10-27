import { StaffMember } from '../types';
import { getFromStorage, saveToStorage } from './apiService';
import { initialStaff } from '../data/initialData';

const STAFF_KEY = 'ac_staff';

export const getStaff = (): Promise<StaffMember[]> => getFromStorage(STAFF_KEY, initialStaff);
export const saveStaff = (staff: StaffMember[]): Promise<void> => saveToStorage(STAFF_KEY, staff);