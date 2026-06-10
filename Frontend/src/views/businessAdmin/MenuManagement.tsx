import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  MoreVertical, 
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Hash,
  IndianRupee,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_MENU } from '../../mockData';
import { MenuItem } from '../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const MenuManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '', category: '', price: '', description: '', isVeg: true, isAvailable: true, taxRate: 5
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading, isError } = useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const response = await api.get('/menu');
      return response.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/menu/${id}`);
    },
    onSuccess: () => {
      toast.success('Menu item deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
    onError: () => {
      toast.error('Failed to delete menu item');
    }
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/menu', data);
    },
    onSuccess: () => {
      toast.success('Menu item added successfully');
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setIsAddModalOpen(false);
      setNewItem({ name: '', category: '', price: '', description: '', isVeg: true, isAvailable: true, taxRate: 5 });
      setImageFile(null);
    },
    onError: () => {
      toast.error('Failed to add menu item');
    }
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return toast.error("Name and price required");
    
    setIsUploading(true);
    let imageUrl = '';
    
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.url;
      }
      
      addMutation.mutate({
        ...newItem,
        price: Number(newItem.price),
        image: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'
      });
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = menuItems.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (isError) {
    return <div className="flex items-center justify-center h-full text-brand-danger font-semibold">Failed to load menu. Please try again.</div>;
  }

  return (
    <div className="px-8 pt-8 pb-0 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold font-display text-slate-900">Menu Catalog</h3>
          <p className="text-slate-500 font-medium font-sans">Manage dishes, pricing, and availability across all digital platforms.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
            <Layers size={18} />
            Categories
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-brand-accent text-white rounded-2xl text-sm font-semibold shadow-xl shadow-brand-accent/25 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            ADD NEW DISH
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 lg:p-5 rounded-[32px] border border-stone-200/80 shadow-soft flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search menu..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent/10 focus:border-brand-accent transition-all font-medium truncate"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 custom-scrollbar">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setSelectedCategory(cat)}
               className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                 selectedCategory === cat 
                   ? 'bg-brand-primary text-white shadow-md' 
                   : 'text-slate-500 hover:bg-slate-100'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <motion.div 
            layout
            key={item.id} 
            className="bg-white rounded-[32px] border border-stone-200/80 shadow-soft overflow-hidden group hover:border-brand-accent transition-all flex flex-col h-full"
          >
             <div className="relative h-48">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                   <button className="bg-white text-brand-primary p-2 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xl">
                      <ImageIcon size={14} />
                      UPDATE PHOTO
                   </button>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                   <div className={`px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-widest text-white shadow-lg ${item.isVeg ? 'bg-brand-success' : 'bg-brand-danger'}`}>
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                   </div>
                   {item.price > 350 && (
                      <div className="px-2 py-1 bg-brand-primary text-white rounded-lg text-[10px] font-semibold uppercase tracking-widest shadow-lg">
                        Premium
                      </div>
                   )}
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-xl p-1.5 shadow-xl">
                   <div className={`w-3 h-3 rounded-full ${item.isAvailable ? 'bg-brand-success' : 'bg-brand-danger'} animate-pulse`} />
                </div>
             </div>

             <div className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                   <div className="flex-1">
                      <h4 className="text-xl font-semibold text-brand-primary leading-tight hover:text-brand-accent transition-colors cursor-pointer">{item.name}</h4>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-1">{item.category}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-2xl font-semibold text-brand-primary flex items-center justify-end">
                         <span className="text-xs mr-0.5 mt-1">₹</span>{item.price}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">incl. tax</p>
                   </div>
                </div>

                <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                   {item.description}
                </p>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-400" title="KDS Tracking Available">K</div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-400" title="QR Ordering Ready">Q</div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-400" title="Delivery Active">D</div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="p-2.5 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-xl transition-all">
                         <Edit3 size={18} />
                      </button>
                      <button 
                         className="p-2.5 text-slate-400 hover:text-brand-danger hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                         onClick={() => {
                           if(window.confirm('Are you sure you want to delete this item?')) {
                             deleteMutation.mutate(item.id || (item as any)._id);
                           }
                         }}
                         disabled={deleteMutation.isPending}
                      >
                         <Trash2 size={18} />
                      </button>
                   </div>
                </div>
             </div>
          </motion.div>
        ))}

        {/* Add New Placeholder Card */}
        <div 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-brand-accent/50 transition-all"
        >
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Plus className="text-slate-300 group-hover:text-brand-accent" size={32} />
           </div>
           <p className="font-semibold text-slate-400 group-hover:text-brand-primary transition-colors">Add New Catalog Item</p>
           <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-widest mt-1">Industrial Menu System</p>
        </div>
      </div>

      {/* Add Dish Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/60"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Add New Dish</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dish Name</label>
                <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                  <input type="text" placeholder="e.g. Mains" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (₹)</label>
                  <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" rows={3}></textarea>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input type="checkbox" checked={newItem.isVeg} onChange={e => setNewItem({...newItem, isVeg: e.target.checked})} className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent" />
                  Vegetarian
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isUploading || addMutation.isPending}
                className="w-full py-4 mt-4 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
              >
                {isUploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle2 size={20} />}
                {isUploading ? 'UPLOADING...' : 'SAVE DISH'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
      </div>
    
  );
};
