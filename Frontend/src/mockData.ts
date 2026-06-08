import { MenuItem, Table, Order, InventoryItem, User } from './types';

export const MOCK_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Paneer Tikka Masala',
    description: 'Grilled paneer cubes in a rich tomato-based gravy',
    price: 320,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1567184109171-9bfe3957eb05?w=200&h=200&fit=crop',
    isVeg: true,
    isAvailable: true,
    taxRate: 0.05
  },
  {
    id: '2',
    name: 'Butter Chicken',
    description: 'Classic Delhi style creamy chicken curry',
    price: 380,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=200&h=200&fit=crop',
    isVeg: false,
    isAvailable: true,
    taxRate: 0.05
  },
  {
    id: '3',
    name: 'Hyderabadi Chicken Biryani',
    description: 'Fragrant basmati rice with spiced chicken and saffron',
    price: 350,
    category: 'Rice & Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=200&h=200&fit=crop',
    isVeg: false,
    isAvailable: true,
    taxRate: 0.05
  },
  {
    id: '4',
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils with cream and butter',
    price: 280,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop',
    isVeg: true,
    isAvailable: true,
    taxRate: 0.05
  },
  {
    id: '5',
    name: 'Masala Dosa',
    description: 'Crispy rice crepe filled with spiced potato mash',
    price: 140,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&h=200&fit=crop',
    isVeg: true,
    isAvailable: true,
    taxRate: 0.05
  },
  {
    id: '6',
    name: 'Mango Lassi',
    description: 'Thick yogurt drink with fresh mango pulp',
    price: 120,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&h=200&fit=crop',
    isVeg: true,
    isAvailable: true,
    taxRate: 0.05
  },
  {
    id: '7',
    name: 'Garlic Naan',
    description: 'Leavened bread with garlic and butter',
    price: 60,
    category: 'Breads',
    image: 'https://images.unsplash.com/photo-1601050638917-3f94ddb41173?w=200&h=200&fit=crop',
    isVeg: true,
    isAvailable: true,
    taxRate: 0.05
  },
  {
    id: '8',
    name: 'Tandoori Chicken',
    description: 'Yogurt-marinated chicken roasted in clay oven',
    price: 450,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&h=200&fit=crop',
    isVeg: false,
    isAvailable: true,
    taxRate: 0.05
  },
  {
    id: '9',
    name: 'Chicken Malai Tikka',
    description: 'Chicken chunks marinated in cream and cheese',
    price: 390,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1626777553732-47306352cb2e?w=200&h=200&fit=crop',
    isVeg: false,
    isAvailable: true,
    taxRate: 0.05
  },
  {
    id: '10',
    name: 'Shahi Paneer',
    description: 'Paneer in a thick gravy of cream, tomatoes and spices from the Indian subcontinent',
    price: 340,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1601050638917-3f94ddb41173?w=200&h=200&fit=crop',
    isVeg: true,
    isAvailable: true,
    taxRate: 0.05
  },
  {
    id: '11',
    name: 'Gulab Jamun',
    description: 'Soft berry-sized balls made with milk solids, flour & a leavening agent',
    price: 120,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=200&h=200&fit=crop',
    isVeg: true,
    isAvailable: true,
    taxRate: 0.05
  }
];

export const MOCK_TABLES: Table[] = [
  { id: 'T1', number: '1', capacity: 2, status: 'Available', floor: 1 },
  { id: 'T2', number: '2', capacity: 2, status: 'Occupied', floor: 1, currentOrderId: 'O1' },
  { id: 'T3', number: '3', capacity: 4, status: 'Reserved', floor: 1 },
  { id: 'T4', number: '4', capacity: 4, status: 'Available', floor: 1 },
  { id: 'T5', number: '5', capacity: 6, status: 'Billing', floor: 1, currentOrderId: 'O2' },
  { id: 'T6', number: '6', capacity: 4, status: 'Cleaning', floor: 1 },
  { id: 'T7', number: '7', capacity: 8, status: 'Available', floor: 2 },
  { id: 'T8', number: '8', capacity: 4, status: 'Available', floor: 2 },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'O1',
    tableId: 'T2',
    type: 'Dine-In',
    status: 'Preparing',
    items: [
      { itemId: '1', name: 'Paneer Tikka Masala', quantity: 1, price: 320 },
      { itemId: '7', name: 'Garlic Naan', quantity: 2, price: 60 }
    ],
    subTotal: 440,
    tax: 22,
    total: 462,
    timestamp: new Date()
  },
  {
    id: 'O2',
    tableId: 'T5',
    type: 'Dine-In',
    status: 'Ready',
    items: [
      { itemId: '3', name: 'Hyderabadi Chicken Biryani', quantity: 2, price: 350 },
      { itemId: '6', name: 'Mango Lassi', quantity: 2, price: 120 }
    ],
    subTotal: 940,
    tax: 47,
    total: 987,
    timestamp: new Date(Date.now() - 3600000)
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'I1', name: 'Basmati Rice', unit: 'kg', currentStock: 45, minStock: 20, category: 'Grains', lastUpdated: new Date() },
  { id: 'I2', name: 'Chicken Breast', unit: 'kg', currentStock: 12, minStock: 15, category: 'Meat', lastUpdated: new Date() },
  { id: 'I3', name: 'Paneer', unit: 'kg', currentStock: 8, minStock: 5, category: 'Dairy', lastUpdated: new Date() },
  { id: 'I4', name: 'Onions', unit: 'kg', currentStock: 80, minStock: 30, category: 'Vegetables', lastUpdated: new Date() },
  { id: 'I5', name: 'Cooking Oil', unit: 'Ltr', currentStock: 25, minStock: 10, category: 'Essentials', lastUpdated: new Date() },
];

export const MOCK_USER: User = {
  id: 'U1',
  name: 'Rajesh Kumar',
  role: 'Admin',
  email: 'rajesh@indiserve.pro',
  branchId: 'B1'
};
