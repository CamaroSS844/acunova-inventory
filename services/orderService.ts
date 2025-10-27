import { PurchaseOrder } from '../types';
import { getFromStorage, saveToStorage } from './apiService';

const PO_KEY = 'ac_purchase_orders';

export const getPurchaseOrders = (): Promise<PurchaseOrder[]> => getFromStorage(PO_KEY, []);
export const savePurchaseOrders = (purchaseOrders: PurchaseOrder[]): Promise<void> => saveToStorage(PO_KEY, purchaseOrders);