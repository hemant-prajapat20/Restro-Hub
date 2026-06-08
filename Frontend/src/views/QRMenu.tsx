import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ChevronRight, 
  ArrowLeft,
  Navigation,
  Info,
  Clock,
  Star,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_MENU } from '../mockData';
import { MenuItem, OrderItem } from '../types';

export const QRMenu: React.FC = () => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.itemId === item.id);
      if (existing) {
        return prev.map(i => i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { itemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const item = prev.find(i => i.itemId === itemId);
      if (item && item.quantity > 1) {
        return prev.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.itemId !== itemId);
    });
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="w-24 h-24 bg-brand-success rounded-full flex items-center justify-center mb-6 shadow-xl shadow-brand-success/20"
        >
          <CheckCircle2 className="text-white" size={48} />
        </motion.div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Order Confirmed!</h2>
        <p className="text-slate-500 font-medium mb-8">Chef is starting to prep your meal at Table #4.</p>
        <div className="bg-slate-50 p-6 rounded-3xl w-full max-w-sm space-y-4 mb-8">
           <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Order ID</span>
              <span className="text-brand-primary">#QR-9921</span>
           </div>
           <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Est. Time</span>
              <span className="text-brand-primary">15-20 Mins</span>
           </div>
        </div>
        <button 
           onClick={() => { setOrderPlaced(false); setCart([]); }}
           className="w-full max-w-sm bg-brand-primary text-white py-4 rounded-2xl font-black shadow-lg"
        >
           ORDER MORE
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 max-w-md mx-auto relative shadow-2xl">
      {/* Header */}
      <div className="bg-white p-6 pb-8 rounded-b-[40px] shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-white">
                 <Navigation size={20} />
              </div>
              <div>
                 <h1 className="text-lg font-black leading-tight">The Royal Indian</h1>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Table #04</p>
              </div>
           </div>
           <button className="p-2 bg-slate-100 rounded-lg text-slate-400">
              <Info size={20} />
           </button>
        </div>
        <div className="relative">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             placeholder="What are you craving today?" 
             className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent/10"
           />
        </div>
      </div>

      {/* Categories */}
      <div className="p-6 flex gap-3 overflow-x-auto no-scrollbar">
         {['Recommends', 'Starters', 'Mains', 'Breads', 'Desserts'].map((cat, i) => (
           <button key={cat} className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
             i === 0 ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'bg-white text-slate-500'
           }`}>
             {cat}
           </button>
         ))}
      </div>

      {/* Menu Items */}
      <div className="px-6 space-y-6">
         <h3 className="font-black text-xl flex items-center gap-2">
            Chef's Special
            <Star size={18} className="text-brand-warning fill-brand-warning" />
         </h3>
         <div className="grid gap-4">
            {MOCK_MENU.slice(0, 5).map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-3xl flex gap-4 shadow-sm group">
                 <div className="w-24 h-24 rounded-2xl overflow-hidden relative">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    <div className="absolute top-1 right-1">
                       <div className={`w-3 h-3 rounded-full border border-white ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                 </div>
                 <div className="flex-1">
                    <h5 className="font-bold text-slate-900 leading-tight">{item.name}</h5>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                       <Clock size={10} />
                       15 mins
                    </div>
                    <div className="flex items-center justify-between mt-3">
                       <span className="font-black text-brand-primary">₹{item.price}</span>
                       <button 
                         onClick={() => addToCart(item)}
                         className="px-4 py-1.5 bg-slate-50 hover:bg-brand-accent hover:text-white text-brand-accent rounded-lg text-xs font-black transition-all"
                       >
                          ADD
                       </button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Cart Summary Bar */}
      {cart.length > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 z-50 max-w-md mx-auto"
        >
           <button 
             onClick={() => setShowCart(true)}
             className="w-full bg-brand-primary text-white p-4 rounded-[28px] flex items-center bg-gradient-to-r from-brand-primary to-slate-800 shadow-2xl"
           >
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black">
                 {cart.length}
              </div>
              <div className="ml-4 text-left">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">View Cart</p>
                 <p className="font-black">₹{cartTotal}</p>
              </div>
              <ChevronRight className="ml-auto" />
           </button>
        </motion.div>
      )}

      {/* Cart Modal */}
      <AnimatePresence>
         {showCart && (
           <div className="fixed inset-0 z-[60] flex items-end justify-center">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand-primary/60 backdrop-blur-sm"
                onClick={() => setShowCart(false)}
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative bg-white w-full max-w-md rounded-t-[40px] shadow-2xl p-8"
              >
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black">Your Order</h3>
                    <div className="bg-slate-100 px-4 py-1 rounded-full text-xs font-bold">Table #04</div>
                 </div>

                 <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar">
                    {cart.map((item) => (
                      <div key={item.itemId} className="flex items-center gap-4">
                         <div className="flex-1">
                            <h6 className="font-bold">{item.name}</h6>
                            <p className="text-xs text-slate-400">₹{item.price}</p>
                         </div>
                         <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl">
                            <button onClick={() => removeFromCart(item.itemId)} className="p-1 text-slate-400"><Minus size={16} /></button>
                            <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                            <button onClick={() => addToCart(MOCK_MENU.find(m => m.id === item.itemId)!)} className="p-1 text-brand-primary"><Plus size={16} /></button>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="border-t border-slate-100 pt-6 space-y-4 mb-8">
                    <div className="flex justify-between font-bold text-slate-400">
                       <span>Total Payable</span>
                       <span className="text-brand-primary text-xl font-black">₹{cartTotal}</span>
                    </div>
                 </div>

                 <button 
                  onClick={() => {
                    setShowCart(false);
                    setOrderPlaced(true);
                  }}
                  className="w-full bg-brand-accent text-white py-5 rounded-[24px] font-black shadow-xl shadow-brand-accent/20 active:scale-95 transition-all"
                 >
                    SEND TO KITCHEN
                 </button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};
