import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { io } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import { Package, Clock, LogOut, MapPin, Search, Star, UtensilsCrossed, User, ChevronDown, Mail, Phone, Menu, X, ArrowRight, ShoppingBag, Bell, Calendar, Info, Camera, Trash2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout, setCredentials } from '../../store/slices/authSlice';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import PastOrdersTab from './PastOrdersTab';
import SavedAddressesTab from './SavedAddressesTab';
import ActiveOrdersTab from './ActiveOrdersTab';

interface Business {
  _id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  logoUrl?: string;
}

export const CustomerPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const cartState = useSelector((state: RootState) => state.cart);
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab') as any;

  const [activeTab, setActiveTab] = useState<'home' | 'active_orders' | 'past_orders' | 'saved_addresses'>(tabFromUrl || 'home');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tabFromUrl && ['home', 'active_orders', 'past_orders', 'saved_addresses'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const { data: addressesResponse } = useQuery({
    queryKey: ['customerAddresses'],
    queryFn: () => api.get('/customer-orders/addresses').then(res => res.data),
    enabled: !!currentUser
  });
  
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

  const defaultAddress = addressesResponse?.data?.find((a: any) => a.isDefault) || addressesResponse?.data?.[0];

  useEffect(() => {
      if (!currentUser || currentUser.role !== 'CUSTOMER') {
        navigate('/login', { replace: true });
        return;
      }

    const fetchBusinesses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/businesses/public');
        const data = await response.json();
        if (data.status === 'success') {
          setBusinesses(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch businesses', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();

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
  }, [currentUser, navigate]);

  const handleLogout = () => {
      dispatch(logout());
      navigate('/customer-login');
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      // 1. Upload to Cloudinary via backend
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = uploadRes.data.url;

      // 2. Update user profile
      const updateRes = await api.put('/auth/profile/photo', { profilePhoto: imageUrl });
      
      // 3. Update Redux state
      dispatch(setCredentials({
        user: updateRes.data.data,
        token: localStorage.getItem('token') || ''
      }));

      toast.success('Profile photo updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const updateRes = await api.put('/auth/profile/photo', { profilePhoto: null });
      dispatch(setCredentials({
        user: updateRes.data.data,
        token: localStorage.getItem('token') || ''
      }));
      toast.success('Profile photo removed');
    } catch (error) {
      toast.error('Failed to remove photo');
    }
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.district.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] font-sans pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-brand-accent to-brand-accent/80 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-accent/30">
              <UtensilsCrossed className="text-white" size={20} />
            </div>
            <h1 className="font-black text-brand-primary text-xl sm:text-2xl tracking-tight hidden sm:block">Restro<span className="text-brand-accent">Hub</span></h1>
          </div>
          
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
                  <div className="w-9 h-9 bg-brand-primary text-white rounded-full flex items-center justify-center overflow-hidden border border-brand-primary/20">
                    {currentUser?.profilePhoto ? (
                      <img src={currentUser.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
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
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                        <div className="relative group">
                          <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-400">
                            {currentUser?.profilePhoto ? (
                              <img src={currentUser.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User size={24} />
                            )}
                          </div>
                          
                          {/* Hover Overlay */}
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer transition-opacity ${isUploadingPhoto ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                          >
                            {isUploadingPhoto ? (
                               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                               <Camera size={16} className="text-white" />
                            )}
                          </div>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handlePhotoUpload} 
                            className="hidden" 
                            accept="image/*"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-brand-primary truncate">{currentUser?.firstName} {currentUser?.lastName}</p>
                          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{currentUser?.email || 'customer@example.com'}</p>
                          
                          {currentUser?.profilePhoto && (
                            <button 
                              onClick={handleRemovePhoto}
                              className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={10} /> Remove photo
                            </button>
                          )}
                        </div>
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
        </div>
      </header>

      {/* Main Layout */}
      <div className="w-full max-w-[1600px] mx-auto mt-6 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* LEFT SIDEBAR - Navigation & Profile (Desktop Only) */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-tr from-brand-accent to-brand-accent/80 rounded-full flex items-center justify-center shadow-md shrink-0">
                        <User className="text-white" size={28} />
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="font-extrabold text-brand-primary text-lg leading-tight truncate">{currentUser?.firstName} {currentUser?.lastName}</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 truncate">{currentUser?.phone || 'Customer'}</p>
                    </div>
                </div>
                
                <nav className="space-y-2">
                    <button 
                        onClick={() => setActiveTab('home')}
                        className={`w-full flex items-center gap-3 font-bold px-4 py-3 rounded-xl transition-all ${activeTab === 'home' ? 'bg-brand-accent/10 text-brand-accent' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-primary'}`}
                    >
                        <Star size={20} />
                        Home / Order
                    </button>
                    <button 
                        onClick={() => setActiveTab('active_orders')}
                        className={`w-full flex items-center gap-3 font-bold px-4 py-3 rounded-xl transition-all ${activeTab === 'active_orders' ? 'bg-brand-accent/10 text-brand-accent' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-primary'}`}
                    >
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-accent"></span>
                        </span>
                        Active Orders
                    </button>
                    <button 
                        onClick={() => setActiveTab('past_orders')}
                        className={`w-full flex items-center gap-3 font-bold px-4 py-3 rounded-xl transition-all ${activeTab === 'past_orders' ? 'bg-brand-accent/10 text-brand-accent' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-primary'}`}
                    >
                        <Clock size={20} />
                        Past Orders
                    </button>
                    <button 
                        onClick={() => setActiveTab('saved_addresses')}
                        className={`w-full flex items-center gap-3 font-bold px-4 py-3 rounded-xl transition-all ${activeTab === 'saved_addresses' ? 'bg-brand-accent/10 text-brand-accent' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-primary'}`}
                    >
                        <MapPin size={20} />
                        Saved Addresses
                    </button>
                </nav>
            </div>

            {/* Desktop Cart Widget */}
            {cartState.items.length > 0 && cartState.businessId && (
              <div className="hidden lg:flex bg-green-600 rounded-3xl p-6 shadow-lg shadow-green-600/20 relative overflow-hidden group h-auto min-h-[220px] flex-col justify-between cursor-pointer hover:bg-green-700 transition-colors"
                onClick={() => navigate(`/customer/order/${cartState.businessId}?cart=true`)}
              >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-50"></div>
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-green-400/20 rounded-full blur-3xl group-hover:bg-green-400/30 transition-colors"></div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                      <div>
                          <div className="w-12 h-12 bg-white text-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-black/5 mb-4 transform -rotate-3 group-hover:rotate-0 transition-transform">
                              <ShoppingBag className="fill-green-600/20" size={24} />
                          </div>
                          
                          <h3 className="font-black text-white text-xl tracking-tight mb-2">Your Cart</h3>
                          <p className="text-sm text-green-100 font-medium mb-1 leading-relaxed">
                              {cartState.items.reduce((a, b) => a + b.quantity, 0)} items from
                          </p>
                          <p className="text-base text-white font-bold leading-relaxed truncate">
                              {cartState.businessName}
                          </p>
                      </div>
                      
                      <button className="w-full bg-white hover:bg-slate-50 text-green-700 font-bold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-auto">
                          View Cart <ArrowRight size={16} />
                      </button>
                  </div>
              </div>
            )}
        </aside>

        {/* CENTER CONTENT */}
        <main className="flex-1 min-w-0 pb-24 lg:pb-0">
          {activeTab === 'home' && (
            <>
            {/* Promotional Banner */}
            <div className="mb-8 rounded-[2rem] bg-brand-primary overflow-hidden relative shadow-lg h-48 flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-accent to-brand-accent/80 opacity-90"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070')] bg-cover bg-center mix-blend-overlay"></div>
                <div className="relative z-10 p-6 sm:p-8 md:w-3/4">
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">Craving something delicious?</h2>
                    <p className="text-brand-accent/20 font-medium text-sm mb-4">Discover the best food & drinks in your area.</p>
                    
                    {/* Search */}
                    <div className="relative max-w-md">
                        <input 
                        type="text" 
                        placeholder="Search for restaurants or cuisines..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-brand-primary font-semibold shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-accent/50 transition-all placeholder:text-slate-400"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-accent" size={20} />
                    </div>
                </div>
            </div>

            {/* Restaurants List */}
            <div>
              <h2 className="text-2xl font-black text-brand-primary mb-6 tracking-tight flex items-center gap-2">
                <Star className="text-brand-accent fill-brand-accent" size={24} />
                Top Restaurants Near You
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredBusinesses.map(business => (
                  <motion.div 
                    key={business._id}
                    onClick={() => navigate(`/customer/order/${business._id}`)}
                    className="bg-white rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden cursor-pointer flex flex-col group transition-all duration-300 h-[340px]"
                    whileHover={{ y: -4 }}
                  >
                    <div className="h-40 bg-slate-100 relative overflow-hidden flex-shrink-0">
                       {business.logoUrl ? (
                          <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-accent/20 to-brand-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                              <UtensilsCrossed size={48} className="text-brand-accent/60 opacity-50" />
                          </div>
                       )}
                       
                       <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                           <Star size={12} className="text-green-600 fill-green-600" />
                           <span className="text-xs font-extrabold text-brand-primary">4.5</span>
                       </div>
                       
                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                           <h3 className="font-extrabold text-white text-xl leading-tight truncate drop-shadow-md">{business.name}</h3>
                       </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-3">
                              <MapPin size={14} className="text-slate-400" />
                              <span className="truncate">{business.address}, {business.district}</span>
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2">
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Top Rated</span>
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Fast Food</span>
                          </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                                  <Star size={12} className="text-brand-accent" />
                              </motion.div>
                              Fast Delivery
                          </span>
                          <span className="text-sm font-bold text-brand-accent bg-brand-accent/10 px-3 py-1.5 rounded-xl">Order Now</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredBusinesses.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-brand-primary">No restaurants found</h3>
                        <p className="text-slate-500 font-medium mt-2">Try adjusting your search criteria.</p>
                    </div>
                )}
              </div>
            </div>
            </>
          )}

          {activeTab === 'active_orders' && <ActiveOrdersTab onNavigateHome={() => setActiveTab('home')} />}
          {activeTab === 'past_orders' && <PastOrdersTab />}
          {activeTab === 'saved_addresses' && <SavedAddressesTab />}
        </main>

        {/* RIGHT SIDEBAR - Offers & Premium */}
        {activeTab === 'home' && (
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
            
            {/* Today's Offers Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-accent/5 rounded-full blur-2xl group-hover:bg-brand-accent/10 transition-colors"></div>
                <h3 className="font-extrabold text-brand-primary mb-4 flex items-center justify-between relative z-10">
                    Today's Offers
                    <span className="text-[10px] font-bold bg-brand-accent/10 text-brand-accent px-2 py-1 rounded-md uppercase">2 New</span>
                </h3>
                
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-accent/30 hover:shadow-md hover:shadow-brand-accent/5 transition-all cursor-pointer group/item">
                        <div className="w-12 h-12 bg-white text-brand-accent shadow-sm rounded-xl flex items-center justify-center font-black text-xl group-hover/item:scale-110 transition-transform">
                            %
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-brand-primary text-sm">50% OFF up to ₹10</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Code: <span className="font-bold text-brand-primary">WELCOME50</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-accent/30 hover:shadow-md hover:shadow-brand-accent/5 transition-all cursor-pointer group/item">
                        <div className="w-12 h-12 bg-white text-green-600 shadow-sm rounded-xl flex items-center justify-center font-black text-xl group-hover/item:scale-110 transition-transform">
                            ₹
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-brand-primary text-sm">Flat ₹5 Cashback</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">On orders above ₹30</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RestroHub Premium Widget */}
            <div className="bg-brand-primary rounded-3xl p-6 shadow-lg shadow-brand-primary/20 relative overflow-hidden group h-[340px] flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-transparent opacity-50"></div>
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-brand-accent/20 rounded-full blur-3xl group-hover:bg-brand-accent/30 transition-colors"></div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="w-12 h-12 bg-gradient-to-tr from-brand-accent to-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/30 mb-4 transform -rotate-3 group-hover:rotate-0 transition-transform">
                            <Star className="text-white fill-white" size={24} />
                        </div>
                        
                        <h3 className="font-black text-white text-xl tracking-tight mb-2">Restro<span className="text-brand-accent">Hub</span> Premium</h3>
                        <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">
                            Get free delivery on every order, exclusive VIP discounts, and priority support.
                        </p>
                    </div>
                    
                    <button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-brand-accent/20 active:scale-95 flex items-center justify-center gap-2 mt-auto">
                        Join Premium 
                        <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-md">₹9/mo</span>
                    </button>
                </div>
            </div>
            
          </aside>
        )}

      </div>

      {/* FLOATING GLOBAL CART BANNER (Mobile Only) */}
      {cartState.items.length > 0 && cartState.businessId && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none flex justify-center lg:hidden">
          <div 
            onClick={() => navigate(`/customer/order/${cartState.businessId}?cart=true`)}
            className="w-full max-w-lg bg-green-600 rounded-2xl shadow-2xl p-4 flex items-center justify-between pointer-events-auto cursor-pointer hover:bg-green-700 transition-colors"
          >
            <div className="text-white">
              <p className="font-bold text-sm uppercase tracking-wider mb-0.5">
                {cartState.items.reduce((a, b) => a + b.quantity, 0)} ITEM(S) | {cartState.businessName}
              </p>
              <p className="text-xs text-green-100 font-medium">Extra charges may apply</p>
            </div>
            <div className="flex items-center gap-2 text-white font-bold">
              View Cart <ArrowRight size={16} />
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 px-6 flex justify-between items-center z-50 lg:hidden shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] pb-safe">
        <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'home' ? 'text-brand-accent' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <Star size={20} className={activeTab === 'home' ? 'fill-brand-accent' : ''} />
            <span className="text-[10px] font-bold">Home</span>
        </button>
        <button 
            onClick={() => setActiveTab('active_orders')}
            className={`flex flex-col items-center gap-1 p-2 relative ${activeTab === 'active_orders' ? 'text-brand-accent' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </span>
            <UtensilsCrossed size={20} />
            <span className="text-[10px] font-bold">Active</span>
        </button>
        <button 
            onClick={() => setActiveTab('past_orders')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'past_orders' ? 'text-brand-accent' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <Clock size={20} />
            <span className="text-[10px] font-bold">History</span>
        </button>
        <button 
            onClick={() => setActiveTab('saved_addresses')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'saved_addresses' ? 'text-brand-accent' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <MapPin size={20} className={activeTab === 'saved_addresses' ? 'fill-brand-accent' : ''} />
            <span className="text-[10px] font-bold">Addresses</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerPanel;
