import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, MapPin, Star, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

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
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <User className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">Welcome, {currentUser?.firstName}</h1>
              <p className="text-[10px] text-slate-500 font-medium">What are you craving today?</p>
            </div>
          </div>
          
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full bg-slate-50 hover:bg-red-50">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-6">
        {/* Search */}
        <div className="px-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search for restaurants or locations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Restaurants List */}
        <div className="px-4 mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Restaurants near you</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBusinesses.map(business => (
              <motion.div 
                whileHover={{ y: -4 }}
                key={business._id}
                onClick={() => navigate(`/customer/order/${business._id}`)}
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all flex gap-4"
              >
                <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                   {business.logoUrl ? (
                      <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-orange-50">
                          <Star size={24} className="text-orange-300 mb-1" />
                      </div>
                   )}
                </div>
                <div className="flex-1 py-1">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{business.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      {business.address}, {business.district}
                  </p>
                  
                  <div className="mt-3 flex items-center gap-3">
                      <div className="bg-green-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Star size={10} className="text-green-700 fill-green-700" />
                          <span className="text-[10px] font-bold text-green-700">4.5</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fast Delivery</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredBusinesses.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-100">
                    No restaurants found.
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
