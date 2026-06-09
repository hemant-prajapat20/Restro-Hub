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

export const MenuManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...Array.from(new Set(MOCK_MENU.map(item => item.category)))];

  const filteredItems = MOCK_MENU.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black font-display text-slate-900">Menu Catalog</h3>
          <p className="text-slate-500 font-medium font-sans">Manage dishes, pricing, and availability across all digital platforms.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Layers size={18} />
            Categories
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-brand-accent text-white rounded-2xl text-sm font-black shadow-xl shadow-brand-accent/25 hover:scale-105 active:scale-95 transition-all">
            <Plus size={18} strokeWidth={3} />
            ADD NEW DISH
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 lg:p-8 rounded-[32px] border border-stone-200/80 shadow-soft flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by Dish Name or Description..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent/10 focus:border-brand-accent transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 custom-scrollbar">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setSelectedCategory(cat)}
               className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <motion.div 
            layout
            key={item.id} 
            className="bg-white rounded-[32px] border border-stone-200/80 shadow-soft overflow-hidden group hover:border-brand-accent transition-all flex flex-col h-full"
          >
             <div className="relative h-48">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                   <button className="bg-white text-brand-primary p-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xl">
                      <ImageIcon size={14} />
                      UPDATE PHOTO
                   </button>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                   <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${item.isVeg ? 'bg-brand-success' : 'bg-brand-danger'}`}>
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                   </div>
                   {item.price > 350 && (
                      <div className="px-2 py-1 bg-brand-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
                        Premium
                      </div>
                   )}
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-xl p-1.5 shadow-xl">
                   <div className={`w-3 h-3 rounded-full ${item.isAvailable ? 'bg-brand-success' : 'bg-brand-danger'} animate-pulse`} />
                </div>
             </div>

             <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                   <div className="flex-1">
                      <h4 className="text-xl font-black text-brand-primary leading-tight hover:text-brand-accent transition-colors cursor-pointer">{item.name}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{item.category}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-2xl font-black text-brand-primary flex items-center justify-end">
                         <span className="text-xs mr-0.5 mt-1">₹</span>{item.price}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">incl. tax</p>
                   </div>
                </div>

                <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                   {item.description}
                </p>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400" title="KDS Tracking Available">K</div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400" title="QR Ordering Ready">Q</div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400" title="Delivery Active">D</div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="p-2.5 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-xl transition-all">
                         <Edit3 size={18} />
                      </button>
                      <button className="p-2.5 text-slate-400 hover:text-brand-danger hover:bg-red-50 rounded-xl transition-all">
                         <Trash2 size={18} />
                      </button>
                   </div>
                </div>
             </div>
          </motion.div>
        ))}

        {/* Add New Placeholder Card */}
        <div className="bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-brand-accent/50 transition-all">
           <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Plus className="text-slate-300 group-hover:text-brand-accent" size={32} />
           </div>
           <p className="font-bold text-slate-400 group-hover:text-brand-primary transition-colors">Add New Catalog Item</p>
           <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Industrial Menu System</p>
        </div>
      </div>
    </div>
  );
};
