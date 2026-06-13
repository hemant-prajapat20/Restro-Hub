import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { ShoppingBag, Search, Plus, Minus, ArrowRight, User, MapPin, Star, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  taxRate: number;
}

export const CustomerDashboard: React.FC = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{item: MenuItem, quantity: number}[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Check Auth
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const token = useSelector((state: RootState) => state.auth.token);

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['publicMenu', businessId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5000/api/customer-orders/menu/${businessId}`);
      return response.data;
    },
    enabled: !!businessId
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await axios.post(
        `http://localhost:5000/api/customer-orders/order/${businessId}`, 
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Order placed successfully!');
      setCart([]);
      setShowCart(false);
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast.error('Please login to place an order');
        navigate('/customer-login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to place order');
      }
    }
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const items: MenuItem[] = menuData?.items || [];
  const business = menuData?.business || { name: 'Restaurant' };

  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];

  const filteredItems = items.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.item._id === item._id);
      if (existing) {
        return prev.map(p => p.item._id === item._id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { item, quantity: 1 }];
    });
    toast.success(`Added ${item.name} to cart`, { icon: '🍽️', position: 'bottom-center' });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(p => p.item._id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(p => p.item._id === itemId ? { ...p, quantity: p.quantity - 1 } : p);
      }
      return prev.filter(p => p.item._id !== itemId);
    });
  };

  const cartTotal = cart.reduce((sum, {item, quantity}) => sum + (item.price * quantity), 0);
  const cartTax = cart.reduce((sum, {item, quantity}) => sum + (item.price * item.taxRate * quantity), 0);
  const finalTotal = cartTotal + cartTax;

  const handleCheckout = () => {
    if (!currentUser) {
      toast.error('Please login to continue');
      navigate('/customer-login');
      return;
    }
    
    if (cart.length === 0) return;

    placeOrderMutation.mutate({
      items: cart.map(c => ({
        menuItem: c.item._id,
        name: c.item.name,
        quantity: c.quantity,
        price: c.item.price,
        subtotal: c.item.price * c.quantity
      })),
      subtotal: cartTotal,
      tax: cartTax,
      total: finalTotal,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">Home</h1>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium"><MapPin size={10} className="text-orange-500"/> Delivering to Current Location</p>
            </div>
          </div>
          
          <div>
            {currentUser ? (
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <User size={20} className="text-slate-600" />
              </div>
            ) : (
              <button onClick={() => navigate('/customer-login')} className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Restaurant Info Banner */}
        <div className="bg-white p-4 mx-4 mt-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{business.name}</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Multi-Cuisine • Desserts • Beverages</p>
            </div>
            <div className="bg-green-100 px-2 py-1 rounded-lg flex items-center gap-1">
              <Star size={12} className="text-green-700 fill-green-700" />
              <span className="text-xs font-bold text-green-700">4.4</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400"/> 30-35 mins</div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1.5">Free Delivery</div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 mt-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search for dishes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Categories */}
        <div className="mt-6 px-4">
          <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                  activeCategory === cat 
                    ? 'bg-slate-900 text-white shadow-slate-900/20' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-6 px-4 space-y-6">
          <h3 className="font-bold text-slate-900 text-lg">Recommended ({filteredItems.length})</h3>
          
          <div className="flex flex-col gap-6">
            {filteredItems.map(item => {
              const cartItem = cart.find(c => c.item._id === item._id);
              return (
                <div key={item._id} className="flex gap-4 items-start bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex-1">
                    <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center mb-2 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                    <p className="font-bold text-slate-900 mt-1">₹{item.price}</p>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                  
                  <div className="relative w-[130px] h-[130px] flex-shrink-0">
                    <div className="w-full h-full rounded-2xl bg-slate-100 overflow-hidden shadow-inner">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                      {cartItem ? (
                        <div className="flex items-center justify-between w-24 h-10 px-2 bg-green-50">
                          <button onClick={() => removeFromCart(item._id)} className="p-1 text-green-700 hover:bg-green-100 rounded-lg transition-colors"><Minus size={14}/></button>
                          <span className="font-bold text-green-800 text-sm">{cartItem.quantity}</span>
                          <button onClick={() => addToCart(item)} className="p-1 text-green-700 hover:bg-green-100 rounded-lg transition-colors"><Plus size={14}/></button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(item)}
                          className="w-24 h-10 font-bold text-green-700 hover:bg-green-50 transition-colors uppercase tracking-wider text-xs flex items-center justify-center gap-1"
                        >
                          ADD <Plus size={12} className="stroke-[3]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-medium">
                No items found for this category.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Cart Summary (Swiggy Style) */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-green-600 rounded-2xl shadow-2xl p-4 flex items-center justify-between pointer-events-auto cursor-pointer hover:bg-green-700 transition-colors" onClick={() => setShowCart(true)}>
                <div className="text-white">
                  <p className="font-bold text-sm uppercase tracking-wider mb-0.5">{cart.reduce((a,b)=>a+b.quantity,0)} ITEM(S)</p>
                  <p className="font-bold flex items-center gap-2">₹{Math.round(finalTotal)} <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-medium">plus taxes</span></p>
                </div>
                <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                  View Cart <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
              onClick={() => setShowCart(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-slate-50 rounded-t-3xl z-[101] max-h-[85vh] flex flex-col max-w-4xl mx-auto"
            >
              <div className="p-4 border-b border-slate-200 bg-white rounded-t-3xl flex justify-between items-center sticky top-0 z-10">
                <h3 className="font-bold text-slate-900 text-lg">Your Cart</h3>
                <button onClick={() => setShowCart(false)} className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200">
                  <Minus size={16} />
                </button>
              </div>
              
              <div className="overflow-y-auto p-4 flex-1">
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-4">{business.name}</h4>
                  <div className="space-y-4">
                    {cart.map(c => (
                      <div key={c.item._id} className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className={`w-3 h-3 border rounded-sm flex items-center justify-center mb-1 ${c.item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${c.item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                          </div>
                          <p className="font-bold text-slate-800 text-sm">{c.item.name}</p>
                          <p className="font-semibold text-slate-500 text-xs mt-0.5">₹{c.item.price}</p>
                        </div>
                        <div className="flex items-center justify-between w-20 h-8 px-2 bg-green-50 rounded-lg border border-green-100">
                          <button onClick={() => removeFromCart(c.item._id)} className="text-green-700 hover:text-green-900 font-bold"><Minus size={12}/></button>
                          <span className="font-bold text-green-800 text-xs">{c.quantity}</span>
                          <button onClick={() => addToCart(c.item)} className="text-green-700 hover:text-green-900 font-bold"><Plus size={12}/></button>
                        </div>
                        <div className="w-16 text-right">
                          <p className="font-bold text-slate-800 text-sm">₹{c.item.price * c.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-100 border-dashed space-y-3">
                    <h5 className="font-bold text-slate-900 text-sm mb-4">Bill Details</h5>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Item Total</span>
                      <span className="text-slate-700 font-bold">₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium flex items-center gap-1">Taxes & Charges <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">i</span></span>
                      <span className="text-slate-700 font-bold">₹{Math.round(cartTax)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0">
                <button 
                  onClick={handleCheckout}
                  disabled={placeOrderMutation.isPending}
                  className="w-full bg-green-600 text-white rounded-2xl py-4 font-bold uppercase tracking-wider flex justify-between items-center px-6 shadow-lg shadow-green-600/30 hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className="text-left">
                    <p className="text-lg">₹{Math.round(finalTotal)}</p>
                    <p className="text-[10px] text-green-200">TOTAL</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {placeOrderMutation.isPending ? 'PROCESSING...' : 'PLACE ORDER'} <ArrowRight size={18}/>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
