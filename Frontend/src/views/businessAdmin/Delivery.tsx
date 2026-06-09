import React from 'react';
import { 
  ShoppingBag, 
  Smartphone, 
  Cloud, 
  Bike, 
  Clock, 
  ChevronRight,
  RefreshCw,
  Plus,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_MENU } from '../../mockData';

export const Delivery: React.FC = () => {
  const [showAddOrder, setShowAddOrder] = React.useState(false);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
       <div className="flex items-center justify-between">
          <div className="flex gap-4">
             <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-bold flex items-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/Zomato_logo.png" className="w-5 h-5 rounded" alt="Zomato" />
                Zomato: <span className="text-brand-success font-black">Connected</span>
             </div>
             <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-bold flex items-center gap-2">
                <img src="https://static.vecteezy.com/system/resources/previews/016/505/309/original/swiggy-logo-on-transparent-background-free-png.png" className="w-5 h-5 object-contain" alt="Swiggy" />
                Swiggy: <span className="text-brand-success font-black">Connected</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
               <RefreshCw size={18} />
               Sync Portals
            </button>
            <button 
              onClick={() => setShowAddOrder(true)}
              className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-2xl text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-brand-accent/20"
            >
               <Plus size={18} strokeWidth={3} />
               PLACE NEW ORDER
            </button>
          </div>
       </div>

       {/* Manual Order Modal (Simplified) */}
       {showAddOrder && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddOrder(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl p-10"
            >
               <h3 className="text-3xl font-black text-slate-900 mb-8">Create Delivery Order</h3>
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Customer Name</label>
                        <input type="text" placeholder="e.g. John Doe" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Phone</label>
                        <input type="tel" placeholder="+91 XXXX" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                     </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Select Items from Menu</label>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                       {MOCK_MENU.map(item => (
                         <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                               <img src={item.image} className="w-10 h-10 rounded-lg object-cover" alt={item.name} />
                               <div>
                                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">₹{item.price}</p>
                               </div>
                            </div>
                            <button className="p-2 text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all">
                               <Plus size={18} strokeWidth={3} />
                            </button>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
               <div className="flex gap-4 mt-10">
                  <button onClick={() => setShowAddOrder(false)} className="flex-1 py-4 font-black text-slate-400 hover:bg-slate-50 rounded-2xl">CANCEL</button>
                  <button 
                    onClick={() => { setShowAddOrder(false); alert('System: Manual Order Created'); }}
                    className="flex-[2] py-4 bg-brand-success text-white font-black rounded-2xl shadow-xl shadow-brand-success/20"
                  >
                    CONFIRM & CREATE
                  </button>
               </div>
            </motion.div>
         </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <h4 className="text-xl font-black font-display flex items-center gap-2 text-slate-900">
                <ShoppingBag className="text-brand-accent" />
                Live Feed
             </h4>
             <div className="space-y-4">
                {[
                  { id: 'DEL-284', source: 'Zomato', items: '2x Biryani, 1x Coke', total: '₹750', time: '4m ago', status: 'In Kitchen' },
                  { id: 'DEL-285', source: 'Swiggy', items: '1x Pasta Carbonara', total: '₹540', time: '12m ago', status: 'Ready' },
                  { id: 'DEL-286', source: 'Zomato', items: '3x Garlic Naan, 1x Dal Makhani', total: '₹420', time: '15m ago', status: 'Out for Delivery' },
                ].map((order) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={order.id} 
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft flex items-center gap-6"
                  >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${
                       order.source === 'Zomato' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                     }`}>
                        {order.source[0]}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-3">
                           <h6 className="font-black text-slate-900">{order.id}</h6>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{order.time}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mt-1">{order.items}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-slate-900">{order.total}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          order.status === 'Ready' ? 'bg-brand-success/10 text-brand-success' : 'bg-blue-50 text-blue-500'
                        }`}>
                           {order.status}
                        </span>
                     </div>
                     <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-brand-accent transition-all">
                        <ChevronRight size={20} />
                     </button>
                  </motion.div>
                ))}
             </div>
          </div>

          <div className="space-y-8">
             <div className="bg-brand-primary p-8 rounded-[40px] text-white space-y-8 overflow-hidden relative shadow-2xl">
                <div className="relative z-10 space-y-8">
                   <div>
                      <h4 className="text-2xl font-black font-display">Daily Delivery Heatmap</h4>
                      <p className="text-slate-400 text-sm mt-1">High traffic zones for riders</p>
                   </div>
                   <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center italic text-slate-500 font-bold">
                      Map Visualization Placeholder
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                         <span className="text-sm font-bold">Total Payouts</span>
                         <span className="text-lg font-black">₹18,420</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                         <span className="text-sm font-bold">Rider Avg. Delay</span>
                         <span className="text-lg font-black text-brand-accent">+2.4m</span>
                      </div>
                   </div>
                </div>
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl opacity-50" />
             </div>
          </div>
       </div>
    </div>
  );
};
