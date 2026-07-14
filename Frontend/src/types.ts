export type UserRole = 'Owner' | 'Admin' | 'Cashier' | 'Waiter' | 'Kitchen' | 'Franchise';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  branchId: string;
}

export interface MenuItem {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  taxRate: number; // e.g., 0.05 for 5% GST
  variants?: { name: string; price: number }[];
  addons?: { name: string; price: number }[];
  isCombo?: boolean;
  comboItems?: string[];
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Completed' | 'Cancelled';

export interface OrderItem {
  itemId: string;
  name: string;
  category?: string;
  quantity: number;
  price: number;
  notes?: string;
  variant?: { name: string; price: number };
  addons?: { name: string; price: number }[];
}

export interface Order {
  id: string;
  tableId?: string;
  type: 'Dine-In' | 'Takeaway' | 'Delivery';
  status: OrderStatus;
  items: OrderItem[];
  subTotal: number;
  tax: number;
  total: number;
  timestamp: Date;
  customerId?: string;
  paymentMethod?: 'Cash' | 'Card' | 'UPI' | 'Wallet';
}

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Billing';

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  floor: number;
}

export interface InventoryItem {
  id: string;
  _id?: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  quantityInStock?: number;
  reorderThreshold?: number;
  category: string;
  lastUpdated: Date;
}
