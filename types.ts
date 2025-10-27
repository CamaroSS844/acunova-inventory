export type Role = 'Admin' | 'Warehouse Staff' | 'Sales Rep';

export interface KPIs {
  totalStockValue: number;
  totalCashOnHand: number;
  totalBankBalance: number;
  outstandingLoans: number;
}

export interface Component {
  id: string;
  name: string;
  description: string;
  unit: 'pcs' | 'reel' | 'kit' | 'm';
  default_price: number;
  reorder_level: number;
  current_stock: number;
  stock_breakdown?: StockLocation[];
  supplierId?: string;
  category?: string;
}

export interface StockLocation {
    locationId: string;
    locationName: string;
    quantity: number;
}

export interface StockMovement {
  id: string;
  type: 'purchase' | 'sale' | 'transfer' | 'adjustment' | 'loan_out' | 'loan_in';
  componentName: string;
  fromLocationName?: string;
  toLocationName?: string;
  qty: number;
  unit_price: number;
  total_price: number;
  timestamp: string; // ISO 8601
  createdBy: string;
  reason?: string;
}

export interface Supplier {
  id: string;
  name: string;
  totalSpend: number;
  lastPurchaseDate: string; // ISO 8601
  contactName?: string;
  contactEmail?: string;
  status?: 'active' | 'inactive';
}

export interface DashboardData {
  kpis: KPIs;
  lowStockComponents: Component[];
  recentMovements: StockMovement[];
  supplierPerformance: Supplier[];
}

export interface BankAccount {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'cash';
    balance: number;
}

export interface FinanceTransaction {
    id:string;
    type: 'deposit' | 'withdrawal' | 'transfer' | 'expense' | 'revenue';
    description: string;
    amount: number;
    date: string; // ISO 8601
    fromAccountId?: string;
    toAccountId?: string;
    category?: string;
}

export interface SaleItem {
    componentId: string;
    componentName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Sale {
    id: string;
    staffId: string;
    staffName: string;
    customerName: string;
    items: SaleItem[];
    totalAmount: number;
    date: string; // ISO 8601
    paymentToAccountId: string;
    fromLocationId: string; // Location stock is sold from
}

export interface StaffMember {
    id: string;
    name: string;
    role: Role;
    email: string;
    phone: string;
    status: 'active' | 'on_leave' | 'terminated';
}

// Order Management System Types
export interface OrderItem {
  componentId: string;
  componentName: string;
  quantity: number;
  purchasePrice: number; // Cost per unit
  salePrice: number; // Price per unit for the client (can be same as purchasePrice for internal stock)
}

export interface ClientOrder {
  id: string;
  clientName: string;
  items: OrderItem[];
  totalCost: number;
  totalValue: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  clientOrders: ClientOrder[];
  isPersonalStockOrder: boolean;
  personalStockItems: OrderItem[];
  status: 'draft' | 'placed' | 'received';
  datePlaced?: string; // ISO 8601
  dateReceived?: string; // ISO 8601
  receivingStaffId: string;
  receivingStaffName: string;
  notes?: string;
  receiptNotes?: string;
  totalCost: number;
}
