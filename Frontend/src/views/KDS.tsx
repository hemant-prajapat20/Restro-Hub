import React, { useState } from 'react';
import { 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  ChefHat, 
  AlertTriangle,
  Flame,
  Wind,
  Plus as PlusIcon,
  RotateCcw,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ORDERS } from '../mockData';

type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Completed';

export const KDS: React.FC = () => {
  const [orders, setOrders] = useState(MOCK_ORDERS.map(o => ({
    ...o,
    status: o.status as OrderStatus,
    completedItems: [] as string[]
  })));

  const handleToggleItem = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const completed = order.completedItems.includes(itemId)
        ? order.completedItems.filter(id => id !== itemId)
        : [...order.completedItems, itemId];
      return { ...order, completedItems: completed };
    }));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'New': return 'border-orange-500 bg-orange-500/10';
      case 'Preparing': return 'border-brand-accent bg-brand-accent/5';
      case 'Ready': return 'border-brand-success bg-brand-success/5';
      default: return 'border-slate-700 bg-slate-800/50';
    }
  };

  return (
    <div className="bg-[#020617] h-[calc(100vh-80px)] p-6 overflow-hidden flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-white text-2xl font-black font-display flex items-center gap-3">
            <ChefHat className="text-brand-accent fill-brand-accent/20" />
            Kitchen Display System (KDS)
          </h2>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Queue</p>
              <p className="text-brand-accent font-black leading-none">{orders.length} Orders</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Avg. Prep</p>
              <p className="text-brand-success font-black leading-none">18.4 min</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
           <button className="px-4 py-2 bg-brand-accent text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-accent/20">Kitchen Feed</button>
           <button className="px-4 py-2 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-widest hover:text-slate-300 transition-all text-nowrap">History</button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 flex gap-6 custom-scrollbar items-start">
        <AnimatePresence>
          {orders.map((order, idx) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-[380px] flex-shrink-0 flex flex-col rounded-[32px] border transition-colors duration-500 ${getStatusColor(order.status)}`}
            >
              {/* Ticket Header */}
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      order.status === 'New' ? 'bg-orange-500 text-white' : 
                      order.status === 'Preparing' ? 'bg-brand-accent text-white' : 'bg-brand-success text-white'
                    }`}>
                      {order.status}
                    </span>
                    <span className="bg-white/10 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">
                      Table #{order.tableId?.replace('T', '') || '0'}
                    </span>
                  </div>
                  <h4 className="text-white font-black text-lg mt-2">Order #{order.id}</h4>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1.5 font-mono font-black text-base ${
                    order.status === 'New' ? 'text-orange-400' : 'text-slate-400'
                  }`}>
                    <Timer size={16} />
                    04:12
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase mt-0.5 tracking-widest">{order.type}</p>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="flex-1 max-h-[400px] overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {order.items.map((item, itemIdx) => {
                  const isCompleted = order.completedItems.includes(item.itemId);
                  return (
                    <motion.div 
                      key={item.itemId} 
                      onClick={() => handleToggleItem(order.id, item.itemId)}
                      className={`flex items-start gap-4 cursor-pointer group transition-all p-2 rounded-2xl ${isCompleted ? 'bg-black/20 opacity-50' : 'hover:bg-white/5'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all border ${
                        isCompleted ? 'bg-transparent border-white/10 text-slate-500' : 'bg-white/5 border-white/10 text-white group-hover:border-brand-accent'
                      }`}>
                        {item.quantity}x
                      </div>
                      <div className="flex-1 pt-1">
                        <h6 className={`text-slate-100 font-bold leading-tight flex items-center gap-2 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                          {item.name}
                          {itemIdx === 0 && !isCompleted && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 rounded text-[10px] font-black uppercase tracking-tighter">Priority</span>}
                        </h6>
                        {item.notes && <p className="text-[10px] text-brand-accent mt-1 italic font-bold">Notes: {item.notes}</p>}
                      </div>
                      <div className={`p-1 rounded-lg transition-all ${isCompleted ? 'bg-brand-success/20 text-brand-success' : 'text-slate-700'}`}>
                         <CheckCircle2 size={24} strokeWidth={isCompleted ? 3 : 2} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Ticket Footer Actions */}
              <div className="p-6 bg-black/30 rounded-b-[32px] border-t border-white/5 flex gap-3">
                 {order.status === 'New' ? (
                   <button 
                     onClick={() => updateOrderStatus(order.id, 'Preparing')}
                     className="flex-1 py-4 bg-brand-accent text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-accent/20"
                   >
                     START COOKING
                   </button>
                 ) : order.status === 'Preparing' ? (
                   <button 
                     onClick={() => updateOrderStatus(order.id, 'Ready')}
                     className="flex-1 py-4 bg-brand-success text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-success/20"
                   >
                     MARK AS READY
                   </button>
                 ) : (
                   <div className="flex-1 flex gap-2">
                     <button className="flex-1 py-4 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> PICKED UP
                     </button>
                     <button 
                       onClick={() => updateOrderStatus(order.id, 'Preparing')}
                       className="w-14 h-14 bg-white/5 text-slate-500 rounded-2xl flex items-center justify-center hover:text-white"
                     >
                       <RotateCcw size={20} />
                     </button>
                   </div>
                 )}
                 <button className="w-14 h-14 bg-white/5 text-slate-500 hover:text-red-500 rounded-2xl flex items-center justify-center transition-colors">
                    <AlertTriangle size={20} />
                 </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Status Legends */}
        <div className="w-[300px] flex-shrink-0 space-y-6">
           <div className="bg-slate-900/50 p-8 rounded-[40px] border border-slate-800">
              <h5 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-6">Kitchen Pulse</h5>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-slate-500 text-[10px] font-black uppercase">Appetizers</span>
                       <span className="text-brand-accent font-black">4/6</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-accent w-2/3" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-slate-500 text-[10px] font-black uppercase">Main Course</span>
                       <span className="text-brand-success font-black">2/8</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-success w-1/4" />
                    </div>
                 </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-xs font-bold text-slate-400">Incoming (High Priority)</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-brand-accent" />
                    <span className="text-xs font-bold text-slate-400">In Production</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-brand-success" />
                    <span className="text-xs font-bold text-slate-400">Ready for Service</span>
                 </div>
              </div>
           </div>
           
           <button className="w-full py-5 bg-white/5 border border-white/5 text-slate-400 rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
              <RotateCcw size={18} />
              Reset All Tickets
           </button>
        </div>
      </div>
    </div>
  );
};

