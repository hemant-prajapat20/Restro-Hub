import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  CheckCircle2,
  Printer,
  ChevronRight,
  Filter,
  ShoppingBag,
  ChefHat,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_MENU } from '../../mockData';
import { MenuItem, OrderItem } from '../../types';
import { generateReceiptPDF } from '../../utils/pdfGenerator';

export const POS: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderState, setOrderState] = useState<'idle' | 'sending' | 'submitted'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Wallet' | null>(null);

  const categories = ['All', ...Array.from(new Set(MOCK_MENU.map(item => item.category)))];

  const handleSendToKitchen = () => {
    setOrderState('sending');
    setTimeout(() => {
      setOrderState('submitted');
      // In a real app, this would hit the API and update the KDS view/DB
    }, 1500);
  };

  const handleResetOrder = () => {
    setCart([]);
    setOrderState('idle');
    setShowCheckout(false);
    setPaymentMethod(null);
  };

  const filteredItems = useMemo(() => {
    return MOCK_MENU.filter(item => {
      const matchCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

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

  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const sgst = subTotal * 0.025;
  const cgst = subTotal * 0.025;
  const total = subTotal + sgst + cgst;

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden font-[Inter] font-semibold">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Top Controls */}
        <div className="p-6 bg-white border-b border-slate-200 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search menu items (Biryani, Naan...)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50">
              <Filter size={18} />
              Filters
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-brand-accent text-white shadow-xl shadow-brand-accent/30' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-brand-accent hover:text-brand-accent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 custom-scrollbar">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  item.isVeg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {item.isVeg ? 'Veg' : 'Non-Veg'}
                </div>
              </div>
              <h5 className="font-semibold text-slate-900 group-hover:text-brand-accent transition-colors truncate">{item.name}</h5>
              <p className="text-xs text-slate-500 line-clamp-1 mb-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-brand-primary">₹{item.price}</span>
                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-brand-accent group-hover:text-white transition-all">
                  <Plus size={16} strokeWidth={3} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[400px] bg-white border-l border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-lg font-display uppercase tracking-tight text-slate-800">Current Order</h4>
            <span className="bg-brand-accent text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm">{cart.length}</span>
          </div>
          <button 
             onClick={() => setCart([])}
             className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag size={32} className="text-slate-300" />
               </div>
               <p className="text-slate-400 font-medium">Your cart is empty.</p>
               <p className="text-xs text-slate-300 mt-1">Start adding items from the menu to create an order.</p>
            </div>
          ) : (
            cart.map((item) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={item.itemId} 
                className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100"
              >
                <div className="flex-1">
                  <h6 className="font-semibold text-sm text-slate-900 leading-tight">{item.name}</h6>
                  <p className="text-xs text-slate-500 mt-0.5">₹{item.price} each</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
                  <button 
                    onClick={() => removeFromCart(item.itemId)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => addToCart(MOCK_MENU.find(m => m.id === item.itemId)!)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="text-right ml-2">
                  <p className="text-sm font-semibold text-slate-900">₹{item.price * item.quantity}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Subtotal</span>
              <span>₹{subTotal}</span>
            </div>
            <div className="flex justify-between text-sm text-brand-primary font-semibold">
               <div className="flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  <span>KDS Sync Fee</span>
               </div>
               <span>Incl.</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-slate-200">
            <span className="text-lg font-semibold text-slate-900">Total Due</span>
            <span className="text-2xl font-semibold text-brand-primary">₹{total.toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
             <button
               disabled={cart.length === 0 || orderState !== 'idle'}
               onClick={handleSendToKitchen}
               className={`flex-1 group py-5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 border-2 ${
                  orderState === 'idle' 
                    ? 'border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white' 
                    : 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed'
               }`}
             >
               {orderState === 'sending' ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
               ) : (
                  <>
                     <ChefHat className="group-hover:scale-110 transition-transform" size={20} />
                     KOT
                  </>
               )}
             </button>
             <button
               disabled={cart.length === 0}
               onClick={() => setShowCheckout(true)}
               className="flex-[2] bg-brand-accent hover:bg-brand-accent/90 disabled:bg-slate-300 text-white font-semibold py-5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-brand-accent/30 transition-all active:scale-95 text-lg"
             >
               PAY BILL
               <ChevronRight size={22} strokeWidth={3} />
             </button>
          </div>
        </div>

        {/* Global Order Success Overlay */}
        <AnimatePresence>
           {orderState === 'submitted' && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center"
             >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-24 h-24 bg-brand-success text-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-brand-success/30"
                >
                   <CheckCircle2 size={48} strokeWidth={3} />
                </motion.div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2 uppercase">Ticket Sent!</h3>
                <p className="text-slate-500 font-medium mb-8">Order #0912 has been successfully synchronized with the Kitchen KDS.</p>
                <button 
                  onClick={handleResetOrder}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                   Close & Next Order
                </button>
             </motion.div>
           )}
        </AnimatePresence>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-primary/60 backdrop-blur-sm"
              onClick={() => setShowCheckout(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-2xl font-semibold font-display mb-6">Complete Payment</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { id: 'Cash', icon: Banknote, label: 'Cash' },
                    { id: 'UPI', icon: Smartphone, label: 'UPI QR' },
                    { id: 'Card', icon: CreditCard, label: 'Card' },
                    { id: 'Wallet', icon: Smartphone, label: 'E-Wallet' },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isActive = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                          isActive 
                            ? 'border-brand-accent bg-brand-accent/5 text-brand-accent' 
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <Icon size={32} className="mb-2" />
                        <span className="font-semibold">{method.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 font-medium">Grand Total</span>
                    <span className="text-3xl font-semibold text-brand-primary">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="h-[1px] bg-slate-200 my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Order Reference</span>
                    <span className="text-xs font-mono font-semibold text-slate-500">IND-8842-109</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 py-4 font-semibold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    BACK
                  </button>
                  <button 
                    onClick={() => {
                      const invoiceNum = 'IND-POS-' + Math.floor(100000 + Math.random() * 900000);
                      const timestampStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString();
                      
                      // Map OrderItems to PDFReceiptItems
                      const receiptItems = cart.map(item => ({
                        itemId: item.itemId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                      }));

                      // Generate PDF receipt directly
                      generateReceiptPDF({
                        title: "Indulge Express POS",
                        invoiceNumber: invoiceNum,
                        timestamp: timestampStr,
                        tableName: "Express Counter",
                        items: receiptItems,
                        subtotal: subTotal,
                        tax: sgst + cgst,
                        total: total,
                        paymentMethod: paymentMethod || 'Cash'
                      });

                      alert('Receipt PDF Generated and Downloaded Successfully!');
                      setCart([]);
                      setShowCheckout(false);
                      setPaymentMethod(null);
                    }}
                    disabled={!paymentMethod}
                    className="flex-[2] bg-brand-success hover:bg-brand-success/90 disabled:bg-slate-300 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-success/20 transition-all"
                  >
                    COMPLETE & DOWNLOAD PDF
                    <FileText size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
