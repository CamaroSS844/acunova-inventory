import { BankAccount, FinanceTransaction, Sale } from '../types';
import { getFromStorage, saveToStorage } from './apiService';
import { initialAccounts, initialTransactions } from '../data/initialData';

const ACCOUNTS_KEY = 'ac_accounts';
const TRANSACTIONS_KEY = 'ac_transactions';
const SALES_KEY = 'ac_sales';

// Accounts
export const getAccounts = (): Promise<BankAccount[]> => getFromStorage(ACCOUNTS_KEY, initialAccounts);
export const saveAccounts = (accounts: BankAccount[]): Promise<void> => saveToStorage(ACCOUNTS_KEY, accounts);

// Transactions
export const getTransactions = (): Promise<FinanceTransaction[]> => getFromStorage(TRANSACTIONS_KEY, initialTransactions);
export const saveTransactions = (transactions: FinanceTransaction[]): Promise<void> => saveToStorage(TRANSACTIONS_KEY, transactions);

// Sales
export const getSales = (): Promise<Sale[]> => getFromStorage(SALES_KEY, []);
export const saveSales = (sales: Sale[]): Promise<void> => saveToStorage(SALES_KEY, sales);