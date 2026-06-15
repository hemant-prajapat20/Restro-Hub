import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Package, Clock, MapPin, Search, Star, ShoppingBag, Plus, Minus, User, ChevronDown, Mail, Phone, LogOut, ArrowLeft, ArrowRight, Bell, Calendar, Info } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { initializeRazorpayPayment } from '../../utils/razorpay';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addToCart as reduxAddToCart, removeFromCart as reduxRemoveFromCart, clearCart } from '../../store/slices/cartSlice';

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
  const dispatch = useDispatch();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showCart, setShowCart] = useState(() => {
    return new URLSearchParams(location.search).get('cart') === 'true';
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/customer-login');
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online'>('Cash');
  const cartState = useSelector((state: RootState) => state.cart);
  const cart = cartState.items;
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // Check Auth
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const { data: addressesResponse } = useQuery({
    queryKey: ['customerAddresses'],
    queryFn: () => api.get('/customer-orders/addresses').then(res => res.data),
    enabled: !!currentUser
  });
  
  const defaultAddress = addressesResponse?.data?.find((a: any) => a.isDefault) || addressesResponse?.data?.[0];
  
  // Initialize selected address once addresses are loaded
  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'CUSTOMER') {
      navigate('/login', { replace: true });
      return;
    }

    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress._id);
    }
  }, [defaultAddress, selectedAddressId, currentUser, navigate]);

  const { data: notificationsResponse, refetch: refetchNotifications } = useQuery({
    queryKey: ['customerNotifications'],
    queryFn: () => api.get('/customer-orders/notifications').then(res => res.data),
    enabled: !!currentUser,
    refetchInterval: 30000 // Poll every 30s
  });

  const notifications = notificationsResponse?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    setShowProfileDropdown(false);
  };

  React.useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.on('newCustomerNotification', (notif: any) => {
      if (notif.customerId === currentUser?._id) {
        refetchNotifications();
        toast(notif.message, { icon: '🔔' });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

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
      dispatch(clearCart());
      setShowCart(false);
      navigate('/customer/dashboard?tab=active_orders');
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
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" /></div>;
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
    if (cartState.businessId && cartState.businessId !== businessId && cart.length > 0) {
      if (!window.confirm(`Your cart contains items from ${cartState.businessName}. Do you want to clear the cart and add items from this restaurant?`)) {
        return;
      }
    }
    dispatch(reduxAddToCart({ businessId: businessId!, businessName: business.name, item }));
    toast.success(`Added ${item.name} to cart`, { icon: '🍽️', position: 'bottom-center' });
  };

  const removeFromCart = (itemId: string) => {
    dispatch(reduxRemoveFromCart({ itemId }));
  };

  const cartTotal = cart.reduce((sum, {item, quantity}) => sum + (item.price * quantity), 0);
  const cartTax = cart.reduce((sum, {item, quantity}) => sum + (item.price * (item.taxRate / 100) * quantity), 0);
  const finalTotal = cartTotal + cartTax;

  const handleCheckout = () => {
    if (!currentUser) {
      toast.error('Please login to continue');
      navigate('/customer-login');
      return;
    }
    
    if (cart.length === 0) return;

    const addressToUse = addressesResponse?.data?.find((a: any) => a._id === selectedAddressId) || defaultAddress;

    const placeOrderPayload = {
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
      paymentMethod,
      customerDetails: {
        address: addressToUse?.street,
        city: addressToUse?.city,
        state: addressToUse?.state,
        zipCode: addressToUse?.zipCode,
      }
    };

    if (paymentMethod === 'Online') {
      initializeRazorpayPayment({
        amount: finalTotal,
        receiptId: `receipt_${Date.now()}`,
        customerName: currentUser.firstName + ' ' + currentUser.lastName,
        customerEmail: currentUser.email,
        customerContact: currentUser.phone,
        onSuccess: (paymentId) => {
          toast.success(`Payment Successful! ID: ${paymentId}`);
          placeOrderMutation.mutate({ ...placeOrderPayload, transactionId: paymentId });
        },
        onFailure: async (error) => {
          toast.error('Payment Failed: ' + (error?.description || 'Unknown error'));
          try {
            await api.post('/customer-orders/payment-failed', {
              amount: finalTotal,
              reason: error?.description || 'User cancelled or network error'
            });
          } catch (e) {}
        }
      });
    } else {
      placeOrderMutation.mutate(placeOrderPayload);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/customer/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors -ml-2"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20">
                <ShoppingBag className="text-white" size={20} />
              </div>
              <div>
                <h1 className="font-bold text-brand-primary leading-tight">
                  {defaultAddress ? defaultAddress.label : 'Home'}
                </h1>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <MapPin size={10} className="text-brand-accent"/> 
                  <span className="truncate max-w-[200px]">
                    Delivering to: {defaultAddress ? `${defaultAddress.street}, ${defaultAddress.city}` : 'Current Location'}
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          <div>
            {currentUser ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button 
                    onClick={handleOpenNotifications}
                    className="relative p-2 text-slate-500 hover:text-brand-primary transition-colors hover:bg-slate-100 rounded-full"
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm transform translate-x-1 -translate-y-1">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                          <h3 className="font-bold text-brand-primary">Notifications</h3>
                          {unreadCount > 0 && <span className="text-xs bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full font-bold">{unreadCount} new</span>}
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notif: any) => (
                              <div 
                                key={notif._id} 
                                onClick={async () => {
                                  if (!notif.isRead) {
                                    await api.put(`/customer-orders/notifications/${notif._id}/read`);
                                    refetchNotifications();
                                  }
                                }}
                                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                              >
                                <div className="flex gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'order' ? 'bg-green-100 text-green-600' : notif.type === 'booking' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {notif.type === 'order' ? <ShoppingBag size={14} /> : notif.type === 'booking' ? <Calendar size={14} /> : <Info size={14} />}
                                  </div>
                                  <div>
                                    <h4 className={`text-sm ${!notif.isRead ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>{notif.title}</h4>
                                    <p className={`text-xs mt-0.5 leading-relaxed ${!notif.isRead ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{notif.message}</p>
                                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(notif.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                              <Bell size={32} className="text-slate-300 mb-3" />
                              <p className="text-sm font-medium">No notifications yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                <button 
                  onClick={() => {
                    setShowProfileDropdown(!showProfileDropdown);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-1.5 pr-4 rounded-full transition-all"
                >
                  <div className="w-9 h-9 bg-brand-primary text-white rounded-full flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <span className="font-bold text-sm text-slate-700 hidden sm:block">
                    {currentUser?.firstName || 'Profile'}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {showProfileDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileDropdown(false)}
                    ></div>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <p className="font-bold text-brand-primary truncate">{currentUser?.firstName} {currentUser?.lastName}</p>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{currentUser?.email || 'customer@example.com'}</p>
                      </div>
                      
                      <div className="p-2">
                        <div className="px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {currentUser?.phone || '+91 -'}
                        </div>
                        <div className="px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-600">
                          <MapPin size={14} className="text-slate-400" />
                          <span className="truncate">
                            {defaultAddress 
                              ? `${defaultAddress.street}, ${defaultAddress.city}`
                              : 'No saved address'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-2 border-t border-slate-100">
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              </div>
            ) : (
              <button onClick={() => navigate('/customer-login')} className="text-sm font-bold text-brand-accent hover:text-brand-accent transition-colors">
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        {/* Restaurant Info Banner */}
        <div className="bg-white p-6 mt-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-brand-primary tracking-tight">{business.name}</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Multi-Cuisine • Desserts • Beverages</p>
              {(business.address || business.district) && (
                <p className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" /> {business.address || `${business.district}, ${business.state}`}
                </p>
              )}
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
        <div className="mt-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search for dishes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all placeholder:text-slate-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Categories */}
        <div className="mt-6">
          <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                  activeCategory === cat 
                    ? 'bg-brand-primary text-white shadow-brand-primary/20' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-8 space-y-6">
          <h3 className="font-black text-brand-primary text-xl">Recommended ({filteredItems.length})</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredItems.map(item => {
              const cartItem = cart.find(c => c.item._id === item._id);
              return (
                <div key={item._id} className="flex gap-3 items-start bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex-1">
                    <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center mb-2 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                    </div>
                    <h4 className="font-bold text-brand-primary text-base">{item.name}</h4>
                    <p className="font-bold text-brand-primary mt-1">₹{item.price}</p>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                  
                  <div className="relative w-[110px] h-[110px] flex-shrink-0">
                    <div className="w-full h-full rounded-xl bg-slate-100 overflow-hidden shadow-inner">
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
              className="fixed inset-0 bg-brand-primary/60 backdrop-blur-sm z-[100]"
              onClick={() => setShowCart(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-slate-50 z-[101] flex flex-col w-full h-full overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center z-10 shadow-sm shrink-0">
                <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
                  <h3 className="font-black text-brand-primary text-xl">Your Cart</h3>
                  <button onClick={() => setShowCart(false)} className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <Minus size={20} />
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1 w-full pb-20">
                <div className="max-w-4xl mx-auto p-4 md:p-6 w-full">
                  <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100">
                    <h4 className="font-bold text-brand-primary mb-4">{business.name}</h4>
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

                  <button onClick={() => setShowCart(false)} className="mt-6 w-full border-2 border-dashed border-brand-accent/50 text-brand-accent rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-brand-accent/5 transition-colors">
                    <Plus size={18} /> Add more items
                  </button>
                  
                  <div className="mt-6 pt-6 border-t border-slate-100 border-dashed space-y-3">
                    <h5 className="font-bold text-brand-primary text-sm mb-4">Bill Details</h5>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Item Total</span>
                      <span className="text-slate-700 font-bold">₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium flex items-center gap-1">Taxes & Charges <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">i</span></span>
                      <span className="text-slate-700 font-bold">₹{Math.round(cartTax)}</span>
                    </div>
                  </div>
                  
                  {/* Delivery & Payment Settings */}
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-6">
                    <div>
                      <h5 className="font-bold text-brand-primary text-sm mb-3">Delivery Address</h5>
                      {addressesResponse?.data?.length > 0 ? (
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none"
                          value={selectedAddressId}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                        >
                          {addressesResponse.data.map((addr: any) => (
                            <option key={addr._id} value={addr._id}>
                              {addr.street}, {addr.city} {addr.isDefault ? '(Default)' : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="bg-orange-50 text-orange-600 text-sm p-3 rounded-xl font-medium">
                          No saved addresses found. Please add an address in your profile.
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h5 className="font-bold text-brand-primary text-sm mb-3">Payment Method</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setPaymentMethod('Cash')}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${paymentMethod === 'Cash' ? 'bg-brand-accent/10 border-brand-accent text-brand-accent' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                          Cash on Delivery
                        </button>
                        <button 
                          onClick={() => setPaymentMethod('Online')}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${paymentMethod === 'Online' ? 'bg-brand-accent/10 border-brand-accent text-brand-accent' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                          Pay Online
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 shrink-0">
                <div className="max-w-4xl mx-auto w-full">
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
