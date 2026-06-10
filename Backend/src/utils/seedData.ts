import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem';
import Table from '../models/Table';
import InventoryItem from '../models/InventoryItem';
import Staff from '../models/Staff';

export const seedTemplateData = async (businessId: mongoose.Types.ObjectId, session: mongoose.ClientSession) => {
  // 1. Seed Menu Items
  const menuItems = [
    { businessId, name: 'Margherita Pizza', category: 'Main Course', price: 299, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop', isVegetarian: true, spicyLevel: 1, isAvailable: true },
    { businessId, name: 'Chicken Biryani', category: 'Main Course', price: 349, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=400&fit=crop', isVegetarian: false, spicyLevel: 2, isAvailable: true },
    { businessId, name: 'Paneer Tikka', category: 'Starters', price: 249, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=400&fit=crop', isVegetarian: true, spicyLevel: 2, isAvailable: true },
    { businessId, name: 'Caesar Salad', category: 'Starters', price: 199, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=400&fit=crop', isVegetarian: true, spicyLevel: 1, isAvailable: true },
    { businessId, name: 'Chocolate Brownie', category: 'Desserts', price: 149, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop', isVegetarian: true, spicyLevel: 1, isAvailable: true }
  ];
  await MenuItem.insertMany(menuItems, { session });

  // 2. Seed Tables
  const tables = [
    { businessId, name: 'T1', capacity: 2, status: 'Available' },
    { businessId, name: 'T2', capacity: 4, status: 'Available' },
    { businessId, name: 'T3', capacity: 4, status: 'Available' },
    { businessId, name: 'T4', capacity: 6, status: 'Available' },
    { businessId, name: 'VIP-1', capacity: 8, status: 'Available' }
  ];
  await Table.insertMany(tables, { session });

  // 3. Seed Inventory
  const inventoryItems = [
    { businessId, name: 'Basmati Rice', category: 'Grains', stockCount: 50, unit: 'kg', minStockLevel: 10, costPerUnit: 80, vendorName: 'Local Suppliers Inc' },
    { businessId, name: 'Chicken Breast', category: 'Meat', stockCount: 20, unit: 'kg', minStockLevel: 5, costPerUnit: 250, vendorName: 'Fresh Farms' },
    { businessId, name: 'Tomatoes', category: 'Vegetables', stockCount: 15, unit: 'kg', minStockLevel: 5, costPerUnit: 40, vendorName: 'Green Grocers' },
    { businessId, name: 'Olive Oil', category: 'Oils', stockCount: 10, unit: 'L', minStockLevel: 2, costPerUnit: 600, vendorName: 'Premium Oils' }
  ];
  await InventoryItem.insertMany(inventoryItems, { session });

  // 4. Seed Staff
  const staffMembers = [
    { businessId, firstName: 'Ravi', lastName: 'Kumar', role: 'Chef', email: 'ravi@example.com', phone: '9876543210', status: 'Active', pin: '1234' },
    { businessId, firstName: 'Priya', lastName: 'Sharma', role: 'Waiter', email: 'priya@example.com', phone: '9876543211', status: 'Active', pin: '2345' },
    { businessId, firstName: 'Amit', lastName: 'Singh', role: 'Manager', email: 'amit@example.com', phone: '9876543212', status: 'Active', pin: '3456' }
  ];
  await Staff.insertMany(staffMembers, { session });

  // 5. Seed Customers
  const customers = [
    { businessId, name: 'Ananya Patel', phone: '9876543333', email: 'ananya@example.com', totalVisits: 12, lifetimeSpent: 14500, lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { businessId, name: 'Vikram Singh', phone: '9876544444', email: 'vikram@example.com', totalVisits: 5, lifetimeSpent: 6200, lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { businessId, name: 'Neha Gupta', phone: '9876545555', email: 'neha@example.com', totalVisits: 28, lifetimeSpent: 42000, lastVisit: new Date() },
    { businessId, name: 'Rahul Desai', phone: '9876546666', email: 'rahul@example.com', totalVisits: 1, lifetimeSpent: 1200, lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
  ];
  const Customer = (await import('../models/Customer')).default;
  await Customer.insertMany(customers, { session });
};
