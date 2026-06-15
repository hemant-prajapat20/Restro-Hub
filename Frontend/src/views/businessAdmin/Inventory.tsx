import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ArrowDownToLine, 
  Truck, 
  AlertCircle,
  TrendingDown,
  ChevronRight,
  ClipboardCheck,
  Package,
  X,
  Sparkles,
  Edit3,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_INVENTORY } from '../../mockData';
import { InventoryItem } from '../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const Inventory: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'Stock' | 'Logs'>('Stock');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for stock
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('kg');
  const [newStock, setNewStock] = useState('');
  const [newMinStock, setNewMinStock] = useState('');
  const [newCategory, setNewCategory] = useState('Essentials');

  const { data: inventoryList = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await api.get('/inventory');
      return response.data.map((item: any) => ({
        ...item,
        id: item._id,
        currentStock: item.quantity,
        minStock: item.minThreshold
      }));
    }
  });

  const addInventoryMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/inventory', data);
    },
    onSuccess: () => {
      toast.success('Inventory item added successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setNewName('');
      setNewStock('');
      setNewMinStock('');
      setShowAddModal(false);
    },
    onError: () => toast.error('Failed to add inventory item')
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await api.put(`/inventory/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inventory/${id}`);
    },
    onSuccess: () => {
      toast.success('Inventory item deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setEditingId(null);
    },
    onError: () => toast.error('Failed to delete inventory item')
  });

  const categories = ['All', ...Array.from(new Set(inventoryList.map(item => item.category)))];

  const filteredInventory = inventoryList.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuickAddStock = (id: string) => {
    const item = inventoryList.find(i => i.id === id || i._id === id);
    if (item) {
      const current = item.quantityInStock ?? item.currentStock ?? 0;
      updateInventoryMutation.mutate({ id: item.id || item._id, data: { quantityInStock: current + 10 } });
    }
  };

  const handleQuickDispatch = (id: string) => {
    const item = inventoryList.find(i => i.id === id || i._id === id);
    if (item) {
      const current = item.quantityInStock ?? item.currentStock ?? 0;
      updateInventoryMutation.mutate({ id: item.id || item._id, data: { quantityInStock: Math.max(0, current - 5) } });
    }
  };

  const handleSaveInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newStock || !newMinStock) return;

    const payload = {
      name: newName,
      unit: newUnit,
      quantityInStock: Number(newStock),
      reorderThreshold: Number(newMinStock),
      category: newCategory,
      supplier: 'Local Vendor' // Default vendor since we don't have an input for it
    };

    if (editingId) {
      updateInventoryMutation.mutate({ id: editingId, data: payload }, {
        onSuccess: () => setShowAddModal(false)
      });
    } else {
      addInventoryMutation.mutate(payload);
    }
  };

  // Luxury Inventory KPI metrics
  const totalSkuValue = inventoryList.length * 48500; // Simulating luxury batching valuation
  const lowStockCount = inventoryList.filter(item => (item.quantityInStock ?? item.currentStock ?? 0) <= (item.reorderThreshold ?? item.minStock ?? 0)).length;

  return (
    <div className="px-8 pt-8 pb-0 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[32px] shadow-soft border border-stone-200/80 flex items-center justify-between hover:border-brand-accent transition-all group">
           <div>
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-2 font-display">Total Cellar SKU Valuation</p>
              <h4 className="text-2xl font-semibold text-stone-900">₹{(totalSkuValue / 100000).toFixed(2)}L</h4>
              <p className="text-xs text-brand-success font-semibold mt-2 flex items-center gap-1">
                 <ClipboardCheck size={14} />
                 Ledger synced: Just now
              </p>
           </div>
           <div className="p-4 bg-amber-50 group-hover:bg-brand-primary text-brand-accent rounded-2xl transition-all">
              <Package size={28} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-[32px] shadow-soft border border-stone-200/80 flex items-center justify-between hover:border-brand-accent transition-all group">
           <div>
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-2 font-display">Depleted ingredients alerts</p>
              <h4 className="text-2xl font-semibold text-rose-800">{lowStockCount} Items</h4>
              <p className="text-xs text-brand-danger font-semibold mt-2 flex items-center gap-1 uppercase tracking-widest font-mono">
                 <AlertCircle size={14} className="animate-pulse" />
                 REORDER PROTOCOL REQ.
              </p>
           </div>
           <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl">
              <TrendingDown size={28} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-[32px] shadow-soft border border-stone-200/80 flex items-center justify-between hover:border-brand-accent transition-all group">
           <div>
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-2 font-display">Active Merchant Consignments</p>
              <h4 className="text-2xl font-semibold text-stone-900">03 Cargo</h4>
              <p className="text-xs text-stone-500 font-semibold mt-2 flex items-center gap-1">
                 <Truck size={14} className="text-brand-accent" />
                 Verified luxury importers
              </p>
           </div>
           <div className="p-4 bg-stone-50 text-stone-800 rounded-2xl group-hover:bg-brand-primary group-hover:text-amber-500 transition-all">
              <ArrowDownToLine size={28} />
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-stone-200">
        {['Stock'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Stock' && (
        <>
          {/* Actions & Filters */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-stone-150 shadow-soft">
        <div className="relative flex-1 w-full xl:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 font-medium text-sm text-stone-800"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
           {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all ${
                  selectedCategory === cat 
                    ? 'bg-brand-primary text-brand-accent shadow-md shadow-brand-primary/10' 
                    : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                }`}
              >
                 {cat}
              </button>
           ))}
           <div className="h-6 w-[1px] bg-stone-200 mx-1 hidden xl:block" />
           <button 
             onClick={() => {
               setEditingId(null);
               setNewName('');
               setNewCategory('Essentials');
               setNewUnit('kg');
               setNewStock('');
               setNewMinStock('');
               setShowAddModal(true);
             }}
             className="px-6 py-3 bg-brand-accent text-stone-950 font-semibold rounded-2xl text-xs uppercase tracking-widest hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-brand-accent/20"
           >
              <Plus size={16} strokeWidth={3} />
              Catalog Ingredient
           </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[32px] border border-stone-200 shadow-soft overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-stone-50 border-b border-stone-200">
               <tr>
                  <th className="px-6 py-4 text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Item / Spec Details</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Cellar Category</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-stone-400 uppercase tracking-widest text-center">Batch Status</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-stone-400 uppercase tracking-widest text-center">In Stock Ledger</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-stone-400 uppercase tracking-widest text-center">Safety Limit</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-stone-400 uppercase tracking-widest text-right">Ledger Calibration</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
               {filteredInventory.map((item) => {
                 const currentStock = item.quantityInStock ?? item.currentStock ?? 0;
                 const minStock = item.reorderThreshold ?? item.minStock ?? 0;
                 const isLow = currentStock <= minStock;
                 const displayId = (item.id || item._id || '').slice(-6);
                 return (
                   <tr key={item.id || item._id} className="hover:bg-amber-500/[0.02]/50 transition-all group">
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-400 group-hover:bg-brand-primary group-hover:text-brand-accent transition-all shadow-sm">
                               <Package size={18} />
                            </div>
                            <div>
                               <p className="text-sm font-semibold text-stone-900">{item.name}</p>
                               <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-widest font-mono">SKU: MAISON-ING-{displayId}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className="px-3 py-1 bg-stone-50 border border-stone-200/50 text-stone-600 rounded-xl text-[9px] font-semibold uppercase tracking-wider">
                            {item.category}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${
                            isLow ? 'bg-red-50 text-red-700 border-red-200/40' : 'bg-green-50 text-green-700 border-green-200/40'
                         }`}>
                            {isLow ? 'Critical Limit' : 'Stocked'}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <span className={`text-sm font-semibold ${isLow ? 'text-rose-700 animate-pulse' : 'text-stone-950'}`}>{currentStock} {item.unit}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <span className="text-sm font-semibold text-stone-400 font-mono">{minStock} {item.unit}</span>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleQuickAddStock(item.id || item._id)}
                              className="px-3 py-1.5 bg-stone-50 border border-stone-200 hover:bg-stone-900 hover:text-white rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all"
                            >
                               Receive +10
                            </button>
                            <button 
                               onClick={() => handleQuickDispatch(item.id || item._id)}
                               className="px-3 py-1.5 bg-brand-primary text-white border border-brand-primary hover:bg-brand-accent hover:border-brand-accent rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all"
                             >
                                Dispatch -5
                             </button>
                            <button 
                              onClick={() => {
                                 setEditingId(item.id || item._id);
                                 setNewName(item.name);
                                 setNewCategory(item.category);
                                 setNewUnit(item.unit);
                                 setNewStock(String(currentStock));
                                 setNewMinStock(String(minStock));
                                 setShowAddModal(true);
                              }}
                              className="px-2 py-1.5 bg-stone-50 text-stone-500 border border-stone-200 hover:bg-brand-primary hover:text-brand-accent rounded-lg transition-all"
                              title="Edit Ledger Item"
                            >
                              <Edit3 size={12} />
                            </button>
                         </div>
                      </td>
                   </tr>
                 );
               })}
            </tbody>
         </table>
         {filteredInventory.length === 0 && (
            <div className="py-12 text-center text-stone-400 italic font-medium text-xs">
               No matching ledger SKU elements found in active warehouse files.
            </div>
         )}
      </div>

      {/* AI Prediction Notice */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-primary rounded-2xl p-5 text-white flex flex-col md:flex-row items-center gap-5 relative overflow-hidden shadow-xl"
      >
        <div className="relative z-10 flex-1">
           <h4 className="text-xl font-semibold font-display mb-1 flex items-center gap-2 text-brand-accent uppercase tracking-wide">
              <Sparkles className="text-brand-accent" />
              Pre-reordering intelligence predictions
           </h4>
           <p className="text-stone-400 text-sm max-w-2xl leading-relaxed">
              Automated supply forecasts predict exhaustion spikes in <span className="text-brand-accent font-semibold"> Basmati Rice</span> and <span className="text-brand-accent font-semibold"> Paneer</span> due to high booking loads in PDR cabins. Approve automatic bulk purchase order directly to primary certified suppliers.
           </p>
        </div>
        <div className="relative z-10 flex-shrink-0">
           <button className="px-8 py-4 bg-brand-accent text-stone-950 font-semibold uppercase tracking-wider rounded-2xl text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-accent/25">
              Approve import dispatch
           </button>
        </div>
        <div className="absolute right-[-100px] top-[-50px] w-80 h-80 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* Catalog New Stock Ingredient Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-4 border border-amber-900/10 overflow-hidden"
            >
              <h3 className="text-2xl font-semibold text-stone-900 mb-2 font-display">{editingId ? 'Edit Raw Ingredient' : 'Catalog Raw Ingredient'}</h3>
              <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-6">Incorporate prime raw supplies into warehouse ledgers</p>

              <form onSubmit={handleSaveInventoryItem} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Raw Ingredient Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Saffron Pistils (Organic Grade)" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Stock Category</label>
                    <select 
                      value={newCategory} 
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm text-stone-600"
                    >
                      <option value="Essentials">Essentials</option>
                      <option value="Grains">Grains & Legumes</option>
                      <option value="Meat">Meat & Seafood</option>
                      <option value="Dairy">Ghee, Butter & Dairy</option>
                      <option value="Vegetables">Vegetables & Herbs</option>
                      <option value="Cafeteria Items">Cafeteria Items</option>
                      <option value="Drinks">Drinks & Beverages</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Measuring Unit</label>
                    <select 
                      value={newUnit} 
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm text-stone-600"
                    >
                      <option value="kg">kilograms (kg)</option>
                      <option value="Ltr">Litres (Ltr)</option>
                      <option value="g">Grams (g)</option>
                      <option value="btl">Bottles (btl)</option>
                      <option value="Units">Units</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Starting Stock</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      placeholder="e.g. 100" 
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Minimum Reorder Limit</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      placeholder="e.g. 15" 
                      value={newMinStock}
                      onChange={(e) => setNewMinStock(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  {editingId && (
                     <button 
                       type="button" 
                       onClick={() => { 
                         if(confirm('Are you sure you want to permanently discard this item?')) { 
                           deleteInventoryMutation.mutate(editingId); 
                           setShowAddModal(false); 
                         } 
                       }} 
                       className="px-4 py-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100 hover:border-red-500"
                       title="Delete Item"
                     >
                       <Trash2 size={18} />
                     </button>
                  )}
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-semibold text-stone-400 hover:bg-stone-50 rounded-2xl text-xs uppercase tracking-widest">DISCARD</button>
                  <button type="submit" className="flex-[2] py-4 bg-brand-primary text-brand-accent font-semibold rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 font-sans">
                     {editingId ? 'UPDATE SECURE' : 'SET ITEM SECURE'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      )}


    </div>
  );
};
