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
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { MenuItem, OrderItem } from '../../types';
import { generateReceiptPDF } from '../../utils/pdfGenerator';
import { FilterBar } from '../../components/FilterBar';
import { initializeRazorpayPayment } from '../../utils/razorpay';

export const POS: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const editOrderId = searchParams.get('orderId');

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderState, setOrderState] = useState<'idle' | 'sending' | 'submitted'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const { data: menuItems = [], isLoading, isError } = useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const response = await api.get('/menu');
      return response.data;
    }
  });

  const { data: orderToEdit } = useQuery({
    queryKey: ['order', editOrderId],
    queryFn: async () => {
      if (!editOrderId) return null;
      const response = await api.get(`/orders/${editOrderId}`);
      return response.data;
    },
    enabled: !!editOrderId
  });

  React.useEffect(() => {
    if (orderToEdit) {
      setCart(orderToEdit.items.map((item: any) => ({
        itemId: item.menuItem,
        name: item.name,
        category: item.category || 'General',
        price: item.price,
        quantity: item.quantity
      })));
      if (orderToEdit.customerDetails) {
        setCustomerName(orderToEdit.customerDetails.name || '');
        setCustomerPhone(orderToEdit.customerDetails.phone || '');
      }
      if (orderToEdit.notes) {
        setNotes(orderToEdit.notes);
      }
    }
  }, [orderToEdit]);

  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      if (editOrderId) {
        const response = await api.put(`/orders/${editOrderId}`, orderData);
        return response.data;
      } else {
        const response = await api.post('/orders', orderData);
        return response.data;
      }
    },
    onSuccess: (data, variables) => {
      if (variables.status === 'In Kitchen') {
        toast.success('KOT sent to kitchen!');
      } else {
        toast.success('Order completed successfully!');
      }
      setOrderState('submitted');
      
      // Only generate/open invoice if it is NOT a KOT
      if (variables.status !== 'In Kitchen' && data && data._id) {
        window.open(`/invoice/${data._id}`, '_blank');
        if (editOrderId) {
          setSearchParams({});
        }
      }
    },
    onError: () => {
      toast.error('Failed to create order');
      setOrderState('idle');
    }
  });

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const handleSendToKitchen = () => {
    if (cart.length === 0 || !customerName.trim() || !customerPhone.match(/^\d{10}$/)) return;
    setOrderState('sending');
      orderMutation.mutate({
        type: 'POS',
        items: cart.map(c => ({
          menuItem: c.itemId,
          name: c.name,
          category: c.category || 'General',
          quantity: c.quantity,
          price: c.price
        })),
        subtotal: subTotal,
        tax: sgst + cgst,
        total: total,
        status: 'In Kitchen',
        customerDetails: { name: customerName, phone: customerPhone },
        notes: notes
      });
  };

  const handleResetOrder = () => {
    setCart([]);
    setOrderState('idle');
    setShowCheckout(false);
    setPaymentMethod(null);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    if (editOrderId) {
      setSearchParams({});
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery, menuItems]);

  const addToCart = (item: MenuItem) => {
    if (editOrderId) return;
    setCart(prev => {
      const currentId = item.id || item._id;
      const existing = prev.find(i => i.itemId === currentId);
      if (existing) {
        return prev.map(i => i.itemId === currentId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { itemId: currentId as string, name: item.name, category: item.category, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    if (editOrderId) return;
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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-y-auto lg:overflow-hidden font-[Inter] font-semibold">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col bg-slate-50 min-h-[60vh] lg:min-h-0">
        {/* Top Controls */}
        <div className="p-2 bg-white border-b border-slate-200">
          <FilterBar
            searchTerm={searchQuery}
            onSearchChange={setSearchQuery}
            category={activeCategory}
            onCategoryChange={setActiveCategory}
            categories={categories.filter(c => c !== 'All')}
          />
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch content-start custom-scrollbar">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id || item._id}
              onClick={() => addToCart(item)}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-32 w-full shrink-0 rounded-xl overflow-hidden mb-3 bg-slate-100 flex flex-col items-center justify-center">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 absolute inset-0 z-10" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }} 
                  />
                ) : null}
                <div className="text-slate-300 flex flex-col items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-2">No Image</span>
                </div>
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase shadow-sm z-20 ${
                  item.isVeg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {item.isVeg ? 'Veg' : 'Non-Veg'}
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <h5 className="font-semibold text-slate-900 group-hover:text-brand-accent transition-colors line-clamp-2 mb-1">{item.name}</h5>
                <p className="text-[10px] text-slate-500 line-clamp-2 min-h-[30px] mb-3">{item.description}</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                  <span className="text-lg font-bold text-brand-primary">₹{item.price}</span>
                  <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-brand-accent group-hover:text-white transition-all shadow-sm">
                    <Plus size={16} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-[400px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-lg font-display uppercase tracking-tight text-slate-800">Current Order</h4>
            <span className="bg-brand-accent text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm">{cart.length}</span>
          </div>
          {!editOrderId && (
            <button 
               onClick={() => setCart([])}
               className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-5">
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
                  {!editOrderId && (
                    <button 
                      onClick={() => removeFromCart(item.itemId)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500"
                    >
                      <Minus size={14} />
                    </button>
                  )}
                  <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                  {!editOrderId && (
                    <button 
                      onClick={() => addToCart(menuItems.find(m => m.id === item.itemId || (m as any)._id === item.itemId)!)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
                <div className="text-right ml-2">
                  <p className="text-sm font-semibold text-slate-900">₹{item.price * item.quantity}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2 shrink-0">
          <div className="space-y-2 mb-1 pb-2 border-b border-slate-200 max-h-[20vh] overflow-y-auto custom-scrollbar pr-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Details (Required)</h4>
            <div className="space-y-1.5">
              <input 
                type="text" 
                placeholder="Customer Name" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:border-brand-accent outline-none"
              />
              <input 
                type="text" 
                placeholder="Mobile Number (10 digits)" 
                maxLength={10}
                value={customerPhone}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d+$/.test(val)) {
                    setCustomerPhone(val);
                  }
                }}
                className={`w-full bg-white border rounded-lg px-3 py-2 text-sm font-semibold outline-none transition-all ${
                  customerPhone && customerPhone.length !== 10 
                    ? 'border-red-400 focus:border-red-500 text-red-600 focus:ring-2 focus:ring-red-100' 
                    : 'border-slate-200 focus:border-brand-accent'
                }`}
              />
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Kitchen Notes / Special Instructions (e.g. less spicy, extra salt)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-brand-accent transition-all"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Subtotal</span>
              <span>₹{subTotal}</span>
            </div>
            <div className="flex justify-between text-xs text-brand-primary font-semibold">
               <div className="flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>KDS Sync Fee</span>
               </div>
               <span>Incl.</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-1.5 border-t border-slate-200">
            <span className="text-base font-semibold text-slate-900">Total Due</span>
            <span className="text-xl font-semibold text-brand-primary">₹{total.toFixed(2)}</span>
          </div>

          <div className="flex gap-2">
             <button
               disabled={!!editOrderId || cart.length === 0 || orderState !== 'idle' || !customerName.trim() || !customerPhone.match(/^\d{10}$/)}
               onClick={handleSendToKitchen}
               className={`flex-1 group py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border-2 ${
                  !editOrderId && orderState === 'idle' && customerName.trim() && customerPhone.match(/^\d{10}$/)
                    ? 'border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white' 
                    : 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed'
               }`}
             >
               {orderState === 'sending' ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
               ) : (
                  <>
                     <ChefHat className="group-hover:scale-110 transition-transform" size={16} />
                     KOT
                  </>
               )}
             </button>
             <button
               disabled={cart.length === 0 || !customerName.trim() || !customerPhone.match(/^\d{10}$/)}
               onClick={() => setShowCheckout(true)}
               className="flex-[2] bg-brand-accent hover:bg-brand-accent/90 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xl shadow-brand-accent/30 transition-all active:scale-95 text-base"
             >
               PAY BILL
               <ChevronRight size={18} strokeWidth={3} />
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
               className="absolute inset-0 z-[100] bg-white flex flex-col items-center justify-center p-5 text-center"
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
                <p className="text-slate-500 font-medium mb-8">The order has been successfully processed and synchronized with the system.</p>
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
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-5">
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
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
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

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 font-medium">Grand Total</span>
                    <span className="text-2xl font-semibold text-brand-primary">₹{total.toFixed(2)}</span>
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
                      
                      const processOrder = () => {
                        orderMutation.mutate({
                          type: 'POS',
                          items: cart.map(c => ({
                            menuItem: c.itemId,
                            name: c.name,
                            category: c.category || 'General',
                            quantity: c.quantity,
                            price: c.price
                          })),
                          subtotal: subTotal,
                          tax: sgst + cgst,
                          total: total,
                          paymentMethod: paymentMethod || 'Cash',
                          status: 'Completed',
                          customerDetails: { name: customerName, phone: customerPhone },
                          notes: notes
                        });

                        setCart([]);
                        setShowCheckout(false);
                        setPaymentMethod(null);
                      };

                      if (paymentMethod === 'UPI' || paymentMethod === 'Online') {
                        initializeRazorpayPayment({
                          amount: total,
                          receiptId: invoiceNum,
                          onSuccess: (pid) => {
                            toast.success('Razorpay Payment Successful: ' + pid);
                            processOrder();
                          },
                          onFailure: (err) => {
                            console.error('Payment failed', err);
                          }
                        });
                      } else {
                        processOrder();
                      }
                    }}
                    disabled={!paymentMethod || orderMutation.isPending}
                    className="flex-[2] bg-brand-success hover:bg-brand-success/90 disabled:bg-slate-300 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-success/20 transition-all"
                  >
                    COMPLETE PAYMENT
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
