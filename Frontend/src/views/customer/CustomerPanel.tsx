import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, MapPin, Star, User, LogOut, UtensilsCrossed, Clock } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
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
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'active_orders' | 'past_orders' | 'saved_addresses'>('home');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'CUSTOMER') {
        navigate('/customer-login');
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
  }, [currentUser, navigate]);

  const handleLogout = () => {
      dispatch(logout());
      navigate('/customer-login');
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
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-gradient-to-tr from-brand-accent to-brand-accent/80 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-accent/30">
              <UtensilsCrossed className="text-white" size={24} />
            </div>
            <h1 className="font-black text-brand-primary text-2xl tracking-tight">Restro<span className="text-brand-accent">Hub</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-600 font-bold">
                  <MapPin size={18} className="text-brand-accent" />
                  <span>Deliver to: <span className="text-brand-primary">Home (Sector 6, Jaipur)</span></span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold bg-slate-50 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all">
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="w-full max-w-[1600px] mx-auto mt-6 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* LEFT SIDEBAR - Navigation & Profile */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-tr from-brand-accent to-brand-accent/80 rounded-full flex items-center justify-center shadow-md">
                        <User className="text-white" size={28} />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-brand-primary text-lg leading-tight">{currentUser?.firstName} {currentUser?.lastName}</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1">{currentUser?.phone || 'Customer'}</p>
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

        </aside>

        {/* CENTER CONTENT */}
        <main className="flex-1 min-w-0">
          {activeTab === 'home' && (
            <>
            {/* Promotional Banner */}
            <div className="mb-8 rounded-[2rem] bg-brand-primary overflow-hidden relative shadow-lg h-64 flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-accent to-brand-accent/80 opacity-90"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070')] bg-cover bg-center mix-blend-overlay"></div>
                <div className="relative z-10 p-8 sm:p-10 md:w-3/4">
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">Craving something delicious?</h2>
                    <p className="text-brand-accent/20 font-medium text-lg mb-6">Discover the best food & drinks in your area.</p>
                    
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBusinesses.map(business => (
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    key={business._id}
                    onClick={() => navigate(`/customer/order/${business._id}`)}
                    className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 cursor-pointer hover:shadow-xl hover:shadow-brand-accent/10 transition-all group flex flex-col"
                  >
                    <div className="h-48 bg-slate-100 relative overflow-hidden flex-shrink-0">
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
                    
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                          <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mb-4">
                              <MapPin size={14} className="text-slate-400" />
                              <span className="truncate">{business.address}, {business.district}</span>
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2">
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Top Rated</span>
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Fast Food</span>
                          </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
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
            <div className="bg-brand-primary rounded-3xl p-6 shadow-lg shadow-brand-primary/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-transparent opacity-50"></div>
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-brand-accent/20 rounded-full blur-3xl group-hover:bg-brand-accent/30 transition-colors"></div>
                
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-tr from-brand-accent to-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/30 mb-4 transform -rotate-3 group-hover:rotate-0 transition-transform">
                        <Star className="text-white fill-white" size={24} />
                    </div>
                    
                    <h3 className="font-black text-white text-xl tracking-tight mb-2">Restro<span className="text-brand-accent">Hub</span> Premium</h3>
                    <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">
                        Get free delivery on every order, exclusive VIP discounts, and priority support.
                    </p>
                    
                    <button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-brand-accent/20 active:scale-95 flex items-center justify-center gap-2">
                        Join Premium 
                        <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-md">₹9/mo</span>
                    </button>
                </div>
            </div>
            
        </aside>

      </div>
    </div>
  );
};
