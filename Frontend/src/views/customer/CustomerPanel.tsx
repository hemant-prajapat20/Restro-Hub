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
  const [activeTab, setActiveTab] = useState<'home' | 'past_orders' | 'saved_addresses'>('home');

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

            <div className="bg-gradient-to-br from-brand-primary to-slate-800 rounded-3xl p-6 shadow-sm text-white relative overflow-hidden">
                 <div className="relative z-10">
                     <h3 className="font-black text-lg mb-2">RestroHub Premium</h3>
                     <p className="text-slate-300 text-sm font-medium mb-4">Get free delivery on all orders above $20.</p>
                     <button className="bg-brand-accent hover:bg-brand-accent text-white font-bold py-2.5 px-4 rounded-xl w-full transition-colors text-sm shadow-lg shadow-brand-accent/20">
                         Upgrade Now
                     </button>
                 </div>
                 <Star size={100} className="absolute -bottom-6 -right-6 text-white opacity-5 rotate-12" />
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

          {activeTab === 'past_orders' && <PastOrdersTab />}
          {activeTab === 'saved_addresses' && <SavedAddressesTab />}
        </main>

        {/* RIGHT SIDEBAR - Active Orders & Offers */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
            
            {/* Active Order Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-extrabold text-brand-primary mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Active Orders
                </h3>
                
                <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="font-bold text-brand-primary text-sm">Order #1042</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Arriving in 15-20 mins</p>
                        </div>
                        <span className="bg-brand-accent text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">Preparing</span>
                    </div>
                    
                    <div className="w-full bg-brand-accent/30 rounded-full h-1.5 mb-4">
                      <div className="bg-brand-accent h-1.5 rounded-full w-1/3"></div>
                    </div>
                    
                    <button className="w-full text-center text-xs font-bold text-brand-accent hover:text-orange-700">
                        Track Order
                    </button>
                </div>
            </div>

            {/* Top Offers Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-extrabold text-brand-primary mb-4">Today's Offers</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-xl">
                            %
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-primary text-sm">50% OFF up to $10</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Use code: WELCOME50</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-black text-xl">
                            $
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-primary text-sm">Flat $5 Cashback</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">On orders above $30</p>
                        </div>
                    </div>
                </div>
            </div>
            
        </aside>

      </div>
    </div>
  );
};
