import { Component, StockLocation, StaffMember, Supplier, BankAccount, FinanceTransaction, Role } from '../types';

export const initialLocations: Omit<StockLocation, 'quantity'>[] = [
    { locationId: 'loc_main_wh', locationName: 'Main Warehouse' },
    { locationId: 'loc_shop_fl', locationName: 'Shop Floor' },
    { locationId: 'staff_1_stock', locationName: "Alice (Warehouse)'s Pocket" },
    { locationId: 'staff_2_stock', locationName: "Bob (Sales)'s Pocket" },
];

export const initialComponents: Component[] = [
    { 
        id: 'c1', name: 'ATmega328P Microcontroller', description: '8-bit AVR MCU', unit: 'pcs', default_price: 2.5, reorder_level: 50, current_stock: 75, category: 'Microcontrollers', 
        stock_breakdown: [
            {locationId: 'loc_main_wh', locationName: 'Main Warehouse', quantity: 65},
            {locationId: 'staff_1_stock', locationName: "Alice (Warehouse)'s Pocket", quantity: 10},
        ] 
    },
    { 
        id: 'c2', name: '10k Ohm Resistor (0.25W)', description: 'Carbon film resistor', unit: 'reel', default_price: 0.01, reorder_level: 1000, current_stock: 850, category: 'Passive Components', 
        stock_breakdown: [{locationId: 'loc_main_wh', locationName: 'Main Warehouse', quantity: 850}] 
    },
    { 
        id: 'c3', name: 'ESP32-WROOM-32', description: 'WiFi + Bluetooth Module', unit: 'pcs', default_price: 3.5, reorder_level: 100, current_stock: 120, category: 'Modules', 
        stock_breakdown: [
            {locationId: 'loc_main_wh', locationName: 'Main Warehouse', quantity: 100}, 
            {locationId: 'staff_2_stock', locationName: "Bob (Sales)'s Pocket", quantity: 20},
        ] 
    },
    {
        id: 'c4', name: 'Raspberry Pi 4 Model B (4GB)', description: 'Single-board computer', unit: 'pcs', default_price: 55, reorder_level: 10, current_stock: 8, category: 'Computers',
        stock_breakdown: [{locationId: 'loc_main_wh', locationName: 'Main Warehouse', quantity: 8}]
    },
    {
        id: 'c5', name: 'SG90 Micro Servo', description: '9g servo motor', unit: 'pcs', default_price: 1.99, reorder_level: 40, current_stock: 55, category: 'Motors',
        stock_breakdown: [
            {locationId: 'loc_main_wh', locationName: 'Main Warehouse', quantity: 40},
            {locationId: 'staff_1_stock', locationName: "Alice (Warehouse)'s Pocket", quantity: 15},
        ]
    }
];

export const initialStaff: StaffMember[] = [
    { id: 'admin_user', name: 'Admin User', role: 'Admin', email: 'admin@acunova.com', phone: '123-456-7890', status: 'active' },
    { id: 'staff_1', name: 'Alice (Warehouse)', role: 'Warehouse Staff', email: 'alice@acunova.com', phone: '123-456-7891', status: 'active' },
    { id: 'staff_2', name: 'Bob (Sales)', role: 'Sales Rep', email: 'bob@acunova.com', phone: '123-456-7892', status: 'on_leave' },
];

export const initialSuppliers: Supplier[] = [
    { id: 's1', name: 'ComponentSource Inc.', contactName: 'Jane Doe', contactEmail: 'jane.d@csource.com', status: 'active', totalSpend: 12500, lastPurchaseDate: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 's2', name: 'ChipWorld', contactName: 'John Smith', contactEmail: 'j.smith@chipworld.dev', status: 'active', totalSpend: 8900, lastPurchaseDate: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 's3', name: 'Global Connectors', contactName: 'Peter Jones', contactEmail: 'p.jones@gconnectors.com', status: 'inactive', totalSpend: 2300, lastPurchaseDate: new Date(Date.now() - 86400000 * 90).toISOString() },
    { id: 's4', name: 'Allied Parts', contactName: 'Sarah Miller', contactEmail: 's.miller@allied.com', status: 'active', totalSpend: 21450, lastPurchaseDate: new Date(Date.now() - 86400000 * 12).toISOString() },
    { id: 's5', name: 'Digi-Key', contactName: 'Mark Brown', contactEmail: 'mark.b@digikey.com', status: 'active', totalSpend: 17800, lastPurchaseDate: new Date(Date.now() - 86400000 * 3).toISOString() },
];

export const initialAccounts: BankAccount[] = [
    { id: 'acc_main_check', name: 'Main Checking Account', type: 'checking', balance: 52300 },
    { id: 'acc_petty_cash', name: 'Petty Cash', type: 'cash', balance: 1500 },
];

export const initialTransactions: FinanceTransaction[] = [
    { id: 't1', type: 'deposit', description: 'Client Payment - Project X', amount: 5000, date: new Date(Date.now() - 86400000 * 2).toISOString(), toAccountId: 'acc_main_check' },
    { id: 't2', type: 'expense', description: 'Supplier Payment - ComponentSource', amount: 3200, date: new Date(Date.now() - 86400000 * 3).toISOString(), fromAccountId: 'acc_main_check' },
];
