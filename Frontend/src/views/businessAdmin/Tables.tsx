import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Map as MapIcon, 
  Layers,
  CheckCircle2,
  AlertTriangle,
  History,
  Plus,
  X,
  Utensils,
  CreditCard,
  Trash2,
  Edit3,
  MoreHorizontal,
  ChevronRight,
  RefreshCw,
  Search,
  ShoppingCart,
  Receipt,
  Minus,
  PlusCircle,
  Printer,
  UtensilsCrossed,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { MOCK_MENU } from '../../mockData';
import { Table, TableStatus, MenuItem } from '../../types';
import { generateReceiptPDF } from '../../utils/pdfGenerator';

const StatusBadge = ({ status }: { status: TableStatus }) => {
  const styles: Record<TableStatus, string> = {
    'Available': 'bg-brand-success/10 text-brand-success',
    'Occupied': 'bg-brand-danger/10 text-brand-danger',
    'Reserved': 'bg-brand-accent/10 text-brand-accent',
    'Cleaning': 'bg-brand-warning/10 text-brand-warning',
    'Billing': 'bg-blue-100 text-blue-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

export const Tables: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);

  // Form states for new table
  const [newTableIdentifier, setNewTableIdentifier] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [newTableFloor, setNewTableFloor] = useState(1);

  const { data: tables = [], isLoading } = useQuery<Table[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await api.get('/tables');
      return response.data;
    }
  });

  const updateTableMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await api.put(`/tables/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    }
  });

  const addTableMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/tables', data);
    },
    onSuccess: () => {
      toast.success('Table added successfully');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setShowAddTableModal(false);
      setNewTableIdentifier('');
    },
    onError: () => toast.error('Failed to add table')
  });

  // Dynamic table billing state
  const [tableOrders, setTableOrders] = useState<Record<string, { itemId: string; name: string; price: number; quantity: number }[]>>({
    'T2': [
      { itemId: '1', name: 'Paneer Tikka Masala', quantity: 1, price: 320 },
      { itemId: '7', name: 'Garlic Naan', quantity: 2, price: 60 }
    ],
    'T5': [
      { itemId: '3', name: 'Hyderabadi Chicken Biryani', quantity: 2, price: 350 },
      { itemId: '6', name: 'Mango Lassi', quantity: 2, price: 120 }
    ]
  });

  const [modalTab, setModalTab] = useState<'checkout' | 'add_items'>('checkout');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Settle Bill State
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // percentage
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash'>('UPI');
  const [settledReceipt, setSettledReceipt] = useState<any | null>(null);

  const selectedTable = tables.find(t => t.id === selectedTableId) || null;
  const floorTables = tables.filter(t => t.floor === activeFloor);

  // Helper calculations
  const computeTableSubtotal = (tableId: string) => {
    const items = tableOrders[tableId] || [];
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const computeTableTax = (tableId: string) => {
    return Math.round(computeTableSubtotal(tableId) * 0.05); // 5% GST
  };

  const computeTableTotal = (tableId: string) => {
    const subtotal = computeTableSubtotal(tableId);
    if (subtotal === 0) return 0;
    const tax = computeTableTax(tableId);
    const discount = Math.round(subtotal * (appliedDiscount / 100));
    return subtotal + tax - discount;
  };

  // Adding item to order
  const addToTableOrder = (tableId: string, menuItem: MenuItem) => {
    const table = tables.find(t => t.id === tableId);
    if (table && (table.status === 'Available' || table.status === 'Reserved' || table.status === 'Cleaning')) {
      updateTableMutation.mutate({ id: tableId, data: { status: 'Occupied' } });
    }

    setTableOrders(prev => {
      const items = prev[tableId] || [];
      const existing = items.find(item => item.itemId === menuItem.id);
      let updated;
      if (existing) {
        updated = items.map(item => item.itemId === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        updated = [...items, { itemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 }];
      }
      return { ...prev, [tableId]: updated };
    });
  };

  // Removing item from order
  const removeFromTableOrder = (tableId: string, itemId: string) => {
    setTableOrders(prev => {
      const items = prev[tableId] || [];
      const existing = items.find(item => item.itemId === itemId);
      if (!existing) return prev;
      let updated;
      if (existing.quantity > 1) {
        updated = items.map(item => item.itemId === itemId ? { ...item, quantity: item.quantity - 1 } : item);
      } else {
        updated = items.filter(item => item.itemId !== itemId);
      }
      return { ...prev, [tableId]: updated };
    });
  };

  // Completely clear item line
  const clearItemFromOrder = (tableId: string, itemId: string) => {
    setTableOrders(prev => {
      const items = prev[tableId] || [];
      const updated = items.filter(item => item.itemId !== itemId);
      return { ...prev, [tableId]: updated };
    });
  };

  const setTableStatus = (tableId: string, status: TableStatus) => {
    updateTableMutation.mutate({ id: tableId, data: { status } });
  };

  const verifyDiscount = () => {
    const code = discountCode.toUpperCase().trim();
    if (code === 'VIP25') {
      setAppliedDiscount(25);
    } else if (code === 'TASTY10') {
      setAppliedDiscount(10);
    } else if (code === 'WELCOME20') {
      setAppliedDiscount(20);
    } else {
      setAppliedDiscount(0);
      alert('Invalid Privilege promo code.');
    }
  };

  const handleSettleAndClear = (tableId: string) => {
    const total = computeTableTotal(tableId);
    const subtotal = computeTableSubtotal(tableId);

    // Generate physical settlement receipt
    const invoiceNum = 'IND-TBL-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString();
    
    setSettledReceipt({
      invoiceNumber: invoiceNum,
      timestamp: dateStr,
      tableNumber: selectedTable?.number,
      items: tableOrders[tableId] || [],
      subtotal: subtotal,
      tax: computeTableTax(tableId),
      discount: Math.round(subtotal * (appliedDiscount / 100)),
      total: total,
      payment: paymentMethod
    });

    // Reset table order and mark table as 'Cleaning'
    updateTableMutation.mutate({ id: tableId, data: { status: 'Cleaning' } });
    setTableOrders(prev => {
      const copy = { ...prev };
      delete copy[tableId];
      return copy;
    });

    // Reset checkout forms
    setAppliedDiscount(0);
    setDiscountCode('');
  };

  const categories = ['All', 'Main Course', 'South Indian', 'Rice & Biryani', 'Starters', 'Desserts', 'Beverages'];

  const filteredMenuItems = MOCK_MENU.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="p-5 space-y-8 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-soft gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner w-full md:w-auto">
          <button 
            onClick={() => setActiveFloor(1)}
            className={`px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeFloor === 1 ? 'bg-white text-brand-accent shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Ground Floor
          </button>
          <button 
            onClick={() => setActiveFloor(2)}
            className={`px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeFloor === 2 ? 'bg-white text-brand-accent shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Rooftop / Terrace
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
           <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-500 uppercase tracking-widest hover:bg-slate-50">
              <History size={16} />
              Waitlist
           </button>
           <button 
             onClick={() => setShowAddTableModal(true)}
             className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-xs font-semibold uppercase tracking-widest shadow-lg shadow-brand-primary/10 hover:scale-105 transition-all"
           >
              <Plus size={16} strokeWidth={3} />
              ADD NEW TABLE
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {floorTables.map((table) => (
          <motion.div
            layout
            key={table.id}
            onClick={() => {
              setSelectedTableId(table.id);
              setModalTab('checkout');
            }}
            className={`bg-white rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
              selectedTableId === table.id ? 'border-brand-accent ring-2 ring-brand-accent/10 scale-[1.02] z-10' : 'border-slate-200 shadow-soft hover:border-brand-accent/50'
            }`}
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900 group-hover:text-brand-accent transition-colors">#{table.number}</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase flex items-center gap-1">
                  <Users size={12} />
                  {table.capacity} Seater
                </p>
              </div>
              <StatusBadge status={table.status} />
            </div>

            {table.status === 'Occupied' || table.status === 'Billing' ? (
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Dine Sessions
                    </span>
                    <span className="font-mono text-slate-900 font-extrabold">₹{computeTableTotal(table.id).toLocaleString()}</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-danger w-3/4 rounded-full animate-pulse" />
                 </div>
              </div>
            ) : table.status === 'Cleaning' ? (
              <div className="flex flex-col items-center justify-center py-4 rounded-2xl bg-brand-warning/5 border border-brand-warning/10">
                 <RefreshCw className="text-brand-warning animate-spin mb-2" size={20} />
                 <p className="text-[10px] font-semibold text-brand-warning uppercase tracking-widest">Cleaning / Resetting</p>
              </div>
            ) : (
              <div className="h-14 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl">
                 <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Available</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
               <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{table.floor === 1 ? 'Ground Floor' : 'Terrace Rooftop'}</span>
               <button className="text-[10px] font-semibold text-brand-accent hover:opacity-80 uppercase tracking-wider flex items-center gap-1">
                  BILL & ORDER <ChevronRight size={10} strokeWidth={3} />
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Management Modal */}
      <AnimatePresence>
        {selectedTable && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setSelectedTableId(null)}
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative bg-white h-full w-full max-w-lg shadow-2xl flex flex-col"
              >
                 {/* Modal Header */}
                 <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                       <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-primary text-white rounded-2xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                          <h2 className="text-xl sm:text-2xl font-semibold">#{selectedTable.number}</h2>
                       </div>
                       <div>
                          <h3 className="text-xl font-semibold text-slate-900">Table Billing & POS</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <StatusBadge status={selectedTable.status} />
                             <span className="text-xs font-semibold text-slate-400 uppercase">• {selectedTable.floor === 1 ? 'Ground Floor' : 'Terrace Rooftop'}</span>
                          </div>
                       </div>
                    </div>
                    <button onClick={() => setSelectedTableId(null)} className="absolute top-6 right-6 sm:static sm:top-auto sm:right-auto p-2 sm:p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl sm:rounded-2xl transition-all">
                       <X size={24} />
                    </button>
                 </div>

                 {/* Modal Nav Tabs */}
                 <div className="flex bg-slate-50 p-2 mx-8 mt-6 rounded-2xl border border-slate-100">
                   <button
                     onClick={() => setModalTab('checkout')}
                     className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${modalTab === 'checkout' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/55' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     Bill & Checkout
                   </button>
                   <button
                     onClick={() => setModalTab('add_items')}
                     className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${modalTab === 'add_items' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/55' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     Take Order (+ Menu)
                   </button>
                 </div>

                 {/* Modal Content */}
                 <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                   {modalTab === 'checkout' ? (
                     <div className="space-y-6">
                       {/* Table current status state messages */}
                       {selectedTable.status === 'Cleaning' && (
                         <div className="p-4 bg-brand-warning/10 border border-brand-warning/20 text-brand-warning rounded-2xl text-center space-y-3">
                           <RefreshCw className="mx-auto animate-spin" size={28} />
                           <p className="text-xs font-semibold uppercase tracking-wider">Sanitization In Progress</p>
                           <p className="text-xs font-medium text-slate-500">Waiters are preparing and wiping table #{selectedTable.number}. Click 'Complete Reset' below to clear.</p>
                           <button 
                             onClick={() => setTableStatus(selectedTable.id, 'Available')}
                             className="px-5 py-2.5 bg-brand-warning text-white font-semibold text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-brand-warning/10"
                           >
                             Complete Reset & Open Table
                           </button>
                         </div>
                       )}

                       {/* Receipt summary if settled */}
                       {settledReceipt && settledReceipt.tableNumber === selectedTable.number && (
                         <div className="p-4 bg-slate-50 rounded-[32px] border border-dashed border-slate-300 space-y-4">
                           <div className="text-center pb-2 border-b border-dashed border-slate-200">
                             <Receipt size={24} className="mx-auto text-brand-success mb-1" />
                             <p className="text-xs font-semibold uppercase tracking-wider text-slate-900">Settled Receipt Summary</p>
                             <p className="text-[9px] font-mono text-slate-400 mt-0.5">Invoice: {settledReceipt.invoiceNumber}</p>
                           </div>

                           <div className="text-xs font-mono space-y-1.5 text-slate-600">
                             {settledReceipt.items.map((item: any) => (
                               <div key={item.itemId} className="flex justify-between">
                                 <span>{item.name} (x{item.quantity})</span>
                                 <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                               </div>
                             ))}
                             <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between font-semibold text-slate-900">
                               <span>Grand Total Paid ({settledReceipt.payment})</span>
                               <span>₹{settledReceipt.total.toLocaleString()}</span>
                             </div>
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                             <button 
                               onClick={() => {
                                 window.print();
                                }}
                               className="py-2.5 border border-slate-300 text-slate-705 text-stone-700 bg-white hover:bg-slate-50 font-semibold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 hover:scale-102 active:scale-98 transition-all"
                             >
                               <Printer size={12} />
                               Print Receipt
                             </button>
                             <button 
                               onClick={() => {
                                 generateReceiptPDF({
                                   invoiceNumber: settledReceipt.invoiceNumber,
                                   timestamp: settledReceipt.timestamp,
                                   tableName: settledReceipt.tableNumber,
                                   items: settledReceipt.items,
                                   subtotal: settledReceipt.subtotal,
                                   tax: settledReceipt.tax,
                                   discount: settledReceipt.discount,
                                   total: settledReceipt.total,
                                   paymentMethod: settledReceipt.payment
                                 });
                               }}
                               className="py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-accent/10 hover:scale-102 active:scale-98 transition-all"
                             >
                               <FileText size={12} />
                               Download PDF
                             </button>
                           </div>
                         </div>
                       )}

                       {/* Active Order Summary */}
                       {(tableOrders[selectedTable.id]?.length || 0) > 0 ? (
                         <div className="space-y-4">
                           <div className="flex items-center justify-between px-2">
                             <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                               <ShoppingCart size={14} className="text-brand-accent" />
                               Table Order Docket
                             </h4>
                             <button
                               onClick={() => {
                                 if (confirm('Are you sure you want to clear the entire table docket?')) {
                                   setTableOrders(prev => {
                                     const copy = { ...prev };
                                     delete copy[selectedTable.id];
                                     return copy;
                                   });
                                   setTableStatus(selectedTable.id, 'Available');
                                 }
                               }}
                               className="text-[10px] font-semibold text-red-500 hover:underline uppercase"
                             >
                               Reset Order
                             </button>
                           </div>

                           <div className="bg-white border-2 border-slate-100 rounded-[32px] p-4 space-y-4">
                             <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                               {tableOrders[selectedTable.id]?.map(item => (
                                 <div key={item.itemId} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-50/80">
                                   <div className="truncate flex-1">
                                     <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                                     <p className="text-[10px] text-slate-400 font-mono">₹{item.price} each</p>
                                   </div>
                                   <div className="flex items-center gap-2">
                                     <button 
                                       onClick={() => removeFromTableOrder(selectedTable.id, item.itemId)}
                                       className="w-6 h-6 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg flex items-center justify-center font-semibold text-xs"
                                     >
                                       -
                                     </button>
                                     <span className="text-xs font-semibold text-slate-950 font-mono min-w-[14px] text-center">{item.quantity}</span>
                                     <button 
                                       onClick={() => addToTableOrder(selectedTable.id, { id: item.itemId, name: item.name, price: item.price } as MenuItem)}
                                       className="w-6 h-6 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg flex items-center justify-center font-semibold text-xs"
                                     >
                                       +
                                     </button>
                                     <button 
                                       onClick={() => clearItemFromOrder(selectedTable.id, item.itemId)}
                                       className="text-red-450 hover:text-red-600 pl-1"
                                     >
                                       <Trash2 size={13} />
                                     </button>
                                   </div>
                                 </div>
                               ))}
                             </div>

                             {/* Pricing & Ledger Details */}
                             <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-500">
                               <div className="flex justify-between">
                                 <span>Sub-Total</span>
                                 <span className="font-mono text-slate-800">₹{computeTableSubtotal(selectedTable.id).toLocaleString()}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span>GST / Service Tax (5%)</span>
                                 <span className="font-mono text-slate-800">₹{computeTableTax(selectedTable.id).toLocaleString()}</span>
                               </div>
                               {appliedDiscount > 0 && (
                                 <div className="flex justify-between text-brand-success font-semibold">
                                   <span>Membership Discount ({appliedDiscount}%)</span>
                                   <span className="font-mono">-₹{Math.round(computeTableSubtotal(selectedTable.id) * (appliedDiscount / 100)).toLocaleString()}</span>
                                 </div>
                               )}
                               <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-semibold text-slate-900">
                                 <span>Total Billing Balance</span>
                                 <span className="font-display text-brand-primary text-base">₹{computeTableTotal(selectedTable.id).toLocaleString()}</span>
                               </div>
                             </div>

                             {/* Privilege Promotions Form */}
                             <div className="space-y-2 pt-2 border-t border-slate-100">
                               <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Privilege Discount Code</label>
                               <div className="flex gap-2">
                                 <input
                                   type="text"
                                   placeholder="Try VIP25, WELCOME20, TASTY10"
                                   value={discountCode}
                                   onChange={e => setDiscountCode(e.target.value)}
                                   className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold uppercase tracking-widest placeholder-slate-300"
                                 />
                                 <button
                                   onClick={verifyDiscount}
                                   className="px-4 py-2 bg-slate-900 text-brand-accent text-[10px] font-semibold uppercase tracking-wider rounded-xl hover:bg-slate-800"
                                 >
                                   Apply
                                 </button>
                               </div>
                             </div>

                             {/* Payment Method Selector */}
                             <div className="space-y-2 pt-2">
                               <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Settlement Option</label>
                               <div className="grid grid-cols-3 gap-2">
                                 {(['UPI', 'Card', 'Cash'] as const).map(mode => (
                                   <button
                                     key={mode}
                                     onClick={() => setPaymentMethod(mode)}
                                     className={`py-2 px-3 border rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${paymentMethod === mode ? 'border-brand-accent text-brand-accent bg-brand-accent/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                   >
                                     {mode}
                                   </button>
                                 ))}
                               </div>
                             </div>
                           </div>
                         </div>
                       ) : (
                         <div className="py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center gap-3">
                           <UtensilsCrossed size={36} className="text-slate-400" />
                           <div>
                             <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">No Active Billing</p>
                             <p className="text-[10px] text-slate-400 max-w-[240px] mt-1 font-medium">There are no items recorded yet. Choose "Take Order (+ Menu)" to register customers' dining dockets.</p>
                           </div>
                           <button 
                             onClick={() => setModalTab('add_items')}
                             className="px-4 py-2 mt-2 bg-brand-primary text-white text-[10px] font-semibold uppercase tracking-widest rounded-xl shadow-md shadow-brand-primary/10 hover:scale-[1.03] transition-all"
                           >
                             Take Table Order
                           </button>
                         </div>
                       )}

                       {/* Status Override */}
                       <div className="space-y-3">
                         <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Lifecycle Management</h4>
                         <div className="grid grid-cols-4 gap-2">
                           {(['Available', 'Occupied', 'Reserved', 'Cleaning'] as TableStatus[]).map(status => (
                             <button
                               key={status}
                               onClick={() => setTableStatus(selectedTable.id, status)}
                               className={`py-2 text-[10px] font-semibold uppercase rounded-lg border text-center transition-all ${selectedTable.status === status ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                             >
                               {status}
                             </button>
                           ))}
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div className="space-y-6">
                       {/* Search & Filter Component */}
                       <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input
                           type="text"
                           placeholder="Search recipes..."
                           value={searchQuery}
                           onChange={e => setSearchQuery(e.target.value)}
                           className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold leading-relaxed placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-accent/10"
                         />
                       </div>

                       {/* Categories Scroll */}
                       <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                         {categories.map(cat => (
                           <button
                             key={cat}
                             onClick={() => setSelectedCategory(cat)}
                             className={`px-4 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-brand-primary text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200/50'}`}
                           >
                             {cat}
                           </button>
                         ))}
                       </div>

                       {/* Menu Selection List */}
                       <div className="space-y-3 max-h-[365px] overflow-y-auto custom-scrollbar pr-1">
                         {filteredMenuItems.map(dish => {
                           const quantity = tableOrders[selectedTable.id]?.find(i => i.itemId === dish.id)?.quantity || 0;
                           return (
                             <div key={dish.id} className="p-3 bg-white border border-slate-150 rounded-2xl flex items-center gap-4 hover:border-brand-accent/40 transition-all">
                               <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
                                 <img src={dish.image} className="w-full h-full object-cover animate-fade-in" alt={dish.name} />
                               </div>
                               <div className="flex-1 min-w-0">
                                 <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider ${dish.isVeg ? 'bg-green-50 text-green-600 border border-green-200/50' : 'bg-red-50 text-red-600 border border-red-200/50'}`}>
                                   {dish.category}
                                 </span>
                                 <h5 className="text-xs font-semibold text-slate-800 truncate mt-1">{dish.name}</h5>
                                 <p className="text-xs font-mono text-slate-500 font-semibold mb-0.5">₹{dish.price}</p>
                               </div>
                               <div className="flex items-center gap-2">
                                 {quantity > 0 ? (
                                   <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                                     <button
                                       onClick={() => removeFromTableOrder(selectedTable.id, dish.id)}
                                       className="px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                                     >
                                       -
                                     </button>
                                     <span className="px-2 text-xs font-semibold text-slate-800 font-mono">{quantity}</span>
                                     <button
                                       onClick={() => addToTableOrder(selectedTable.id, dish)}
                                       className="px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                                     >
                                       +
                                     </button>
                                   </div>
                                 ) : (
                                   <button
                                     onClick={() => addToTableOrder(selectedTable.id, dish)}
                                     className="px-3 py-1.5 bg-brand-accent text-white text-[10px] font-semibold uppercase tracking-wider rounded-lg hover:scale-105 active:scale-95 transition-all"
                                   >
                                     ADD +
                                   </button>
                                 )}
                               </div>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Modal Footer */}
                 <div className="p-5 border-t border-slate-100 flex gap-4">
                    <button 
                      onClick={() => handleSettleAndClear(selectedTable.id)}
                      disabled={(tableOrders[selectedTable.id]?.length || 0) === 0}
                      className="flex-1 bg-brand-success text-white py-5 rounded-[24px] font-semibold text-sm shadow-xl shadow-brand-success/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                       <CheckCircle2 size={20} strokeWidth={3} />
                       SETTLE & PRINT RECEIPT
                    </button>
                    <button 
                      onClick={() => setSelectedTableId(null)}
                      className="w-20 bg-slate-100 text-slate-400 rounded-[24px] flex items-center justify-center hover:bg-slate-200 transition-all"
                    >
                       <X size={20} />
                    </button>
                 </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Table Modal Placeholder */}
      <AnimatePresence>
         {showAddTableModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                 onClick={() => setShowAddTableModal(false)}
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.9, opacity: 0 }}
                 className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-4"
               >
                  <h3 className="text-2xl font-semibold text-slate-900 mb-8">New Table Entity</h3>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Table Identifier</label>
                        <input 
                           type="text" 
                           placeholder="e.g. 15, V1, T10" 
                           value={newTableIdentifier}
                           onChange={e => setNewTableIdentifier(e.target.value)}
                           className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold text-xl" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Guest Capacity</label>
                        <select 
                           value={newTableCapacity}
                           onChange={e => setNewTableCapacity(Number(e.target.value))}
                           className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold text-xl"
                        >
                           <option value={2}>2 Seater</option>
                           <option value={4}>4 Seater</option>
                           <option value={6}>6 Seater</option>
                           <option value={8}>8 Seater (Royal)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Floor Assignment</label>
                        <div className="flex gap-2">
                           <button 
                              onClick={() => setNewTableFloor(1)}
                              className={`flex-1 py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest ${newTableFloor === 1 ? 'bg-brand-primary text-white' : 'bg-slate-50 text-slate-400'}`}
                           >
                              Ground
                           </button>
                           <button 
                              onClick={() => setNewTableFloor(2)}
                              className={`flex-1 py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest ${newTableFloor === 2 ? 'bg-brand-primary text-white' : 'bg-slate-50 text-slate-400'}`}
                           >
                              Terrace
                           </button>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-4 mt-10">
                     <button onClick={() => setShowAddTableModal(false)} className="flex-1 py-4 font-semibold text-slate-400">DISCARD</button>
                     <button 
                        onClick={() => {
                           if (!newTableIdentifier) return toast.error('Table Identifier is required');
                           addTableMutation.mutate({
                              number: newTableIdentifier,
                              capacity: newTableCapacity,
                              floor: newTableFloor,
                              status: 'Available'
                           });
                        }}
                        disabled={addTableMutation.isPending}
                        className="flex-[2] py-4 bg-brand-accent text-white font-semibold rounded-2xl shadow-xl shadow-brand-accent/20"
                     >
                        {addTableMutation.isPending ? 'PROVISIONING...' : 'PROVISION TABLE'}
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Reservation & Waitlist Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
         <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
               <h4 className="text-xl font-semibold font-display uppercase tracking-tight text-slate-800">Advanced Reservations</h4>
               <button className="px-6 py-2.5 bg-slate-50 text-slate-500 rounded-2xl text-xs font-semibold border border-slate-100 hover:bg-slate-100 transition-all uppercase tracking-widest">View Archives</button>
            </div>
            <div className="space-y-4">
               {[
                 { name: 'Amit Sharma', guests: 4, time: '19:30', phone: '+91 98XXX XXX54', status: 'Confirmed' },
                 { name: 'Priya Verma', guests: 2, time: '20:15', phone: '+91 88XXX XXX12', status: 'Awaiting' },
                 { name: 'Dr. Mehra', guests: 8, time: '21:00', phone: '+91 70XXX XXX99', status: 'Delayed' },
               ].map((res) => (
                 <div key={res.name} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                       <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center font-semibold text-brand-primary text-sm border border-slate-100 flex-shrink-0">
                       {res.time}
                    </div>
                    <div className="flex-1">
                       <h6 className="font-semibold text-slate-900 group-hover:text-brand-accent transition-colors">{res.name}</h6>
                       <p className="text-xs text-slate-500 font-medium">{res.phone} • {res.guests} Guests</p>
                    </div>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-3 mt-2 sm:mt-0 sm:ml-auto">
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider ${
                         res.status === 'Confirmed' ? 'bg-brand-success/10 text-brand-success' : 
                         res.status === 'Awaiting' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-danger/10 text-brand-danger'
                       }`}>
                          {res.status}
                       </span>
                       <button className="p-3 bg-white text-slate-400 hover:text-brand-success rounded-xl shadow-sm border border-slate-100 transition-all">
                          <CheckCircle2 size={20} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-brand-sidebar rounded-2xl p-5 text-white relative overflow-hidden shadow-xl-deep">
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                     <MapIcon className="text-brand-accent" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold font-display uppercase tracking-tight text-white">System Controls</h4>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                     <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-200">Smart Mapping</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Auto-allocate sessions</p>
                     </div>
                     <div className="w-12 h-6 bg-brand-accent rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                     </div>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                     <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-200">KDS Webhook</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Push updates to kitchen</p>
                     </div>
                     <div className="w-12 h-6 bg-slate-700 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                     </div>
                  </div>
                  
                  <div className="pt-8 text-center bg-white/5 rounded-[32px] p-4 border border-white/5">
                     <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-4">Floor Utilization</p>
                     <div className="flex items-center justify-between px-4">
                        <div className="text-center">
                           <p className="text-3xl font-semibold text-brand-accent font-display">82</p>
                           <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest">Active %</p>
                        </div>
                        <div className="w-[1px] h-12 bg-white/10" />
                        <div className="text-center">
                           <p className="text-3xl font-semibold text-brand-success font-display">18</p>
                           <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest">Available %</p>
                        </div>
                        <div className="w-[1px] h-12 bg-white/10" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
