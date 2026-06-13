import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Package, Clock, Activity, Search, MapPin, Phone, Bike } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  businessId: {
    _id: string;
    name: string;
    logoUrl?: string;
    address?: string;
    contactPhone?: string;
  };
  total: number;
  status: string;
  createdAt: string;
  items: any[];
  driverDetails?: {
    name: string;
    phone: string;
  };
  paymentMethod?: string;
  customerDetails?: {
    name: string;
    phone: string;
    address?: string;
  };
  deliveryOtp?: string;
}

interface Props {
  onNavigateHome: () => void;
}

const ActiveOrdersTab: React.FC<Props> = ({ onNavigateHome }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInfo, setExpandedInfo] = useState<{ orderId: string, type: 'driver' | 'restaurant' } | null>(null);

  const toggleInfo = (orderId: string, type: 'driver' | 'restaurant') => {
    if (expandedInfo?.orderId === orderId && expandedInfo.type === type) {
      setExpandedInfo(null);
    } else {
      setExpandedInfo({ orderId, type });
    }
  };

  useEffect(() => {
    fetchActiveOrders();

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.on('orderStatusUpdated', () => {
      fetchActiveOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const response = await api.get('/customer-orders/my-orders');
      // Filter out completed or cancelled orders
      const activeOrders = response.data.data.filter((order: Order) => 
        !['Completed', 'Cancelled'].includes(order.status)
      );
      setOrders(activeOrders);
    } catch (error) {
      toast.error('Failed to load active orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 33;
      case 'preparing':
      case 'in kitchen': return 66;
      case 'ready': return 66;
      case 'out for delivery': return 100;
      case 'served': return 100;
      default: return 33;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium mt-4">Tracking your active orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center mb-6">
          <Activity className="text-brand-accent opacity-50" size={40} />
        </div>
        <h3 className="text-2xl font-black text-brand-primary mb-2">No active delivery</h3>
        <p className="text-slate-500 font-medium max-w-sm mb-8">
          You don't have any orders running right now. Please search for a restaurant and place an order.
        </p>
        <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
        >
            <Search size={18} />
            Search Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-brand-primary">Active Orders</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={order._id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-brand-accent/20 hover:shadow-md transition-shadow relative overflow-hidden"
          >
            {/* Live Indicator */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-bl-full -mr-8 -mt-8"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-bg flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-inner">
                   {order.businessId?.logoUrl ? (
                     <img src={order.businessId.logoUrl} alt={order.businessId.name} className="w-full h-full object-cover" />
                   ) : (
                     <Package className="text-slate-400" size={24} />
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-brand-primary text-lg">{order.businessId?.name || 'Restaurant'}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                    <Clock size={14} className="text-brand-accent" />
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-accent text-white text-xs font-bold uppercase tracking-wider shadow-sm shadow-brand-accent/20">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  {order.status}
                </span>
                <p className="font-black text-brand-primary text-xl mt-2">₹{order.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 relative">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
                    <span className={order.status === 'Pending' ? 'text-brand-accent' : ''}>Order Placed</span>
                    <span className={['Preparing', 'In Kitchen', 'Ready'].includes(order.status) ? 'text-brand-accent' : ''}>Preparing</span>
                    <span className={['Out for Delivery', 'Served'].includes(order.status) ? 'text-brand-accent flex items-center gap-1' : ''}>
                      {order.status === 'Out for Delivery' && <Bike size={14} className="animate-bounce" />}
                      On the way
                    </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${getStatusProgress(order.status)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-2 rounded-full relative ${order.status === 'Out for Delivery' ? 'bg-brand-success' : 'bg-brand-accent'}`}
                    >
                        <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 animate-[shimmer_2s_infinite]"></div>
                    </motion.div>
                </div>
            </div>

            {/* Order Details */}
            <div className="bg-slate-50/50 rounded-xl p-4 mb-4 border border-slate-100 space-y-3">
               <div className="flex justify-between items-start">
                   <div>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Order ID</p>
                       <p className="text-sm font-black text-brand-primary">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                   </div>
                   <div className="text-right">
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Payment</p>
                       <p className="text-sm font-bold text-slate-700">{order.paymentMethod || 'N/A'}</p>
                   </div>
               </div>
               
               {order.customerDetails && (
                 <div className="pt-3 border-t border-slate-200/60">
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Delivery Details</p>
                   <div className="flex items-start gap-2 mb-1.5">
                       <div className="w-5 h-5 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                           <span className="text-[10px]">👤</span>
                       </div>
                       <p className="text-sm font-semibold text-slate-700">{order.customerDetails.name} <span className="text-slate-400 font-normal">({order.customerDetails.phone})</span></p>
                   </div>
                   {order.customerDetails.address && (
                     <div className="flex items-start gap-2">
                         <div className="w-5 h-5 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                             <MapPin size={10} className="text-brand-accent" />
                         </div>
                         <p className="text-sm text-slate-600 leading-tight">{order.customerDetails.address}</p>
                     </div>
                   )}
                 </div>
               )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 text-sm text-slate-600 font-medium">
              {order.items.map((item: any, idx: number) => (
                <span key={idx} className="bg-brand-bg px-3 py-1.5 rounded-lg border border-slate-100">
                  {item.quantity}x {item.name || item.itemId?.name || 'Item'}
                </span>
              ))}
            </div>
            
            <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => toggleInfo(order._id, 'driver')}
                  className="flex-1 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent font-bold py-2.5 rounded-xl transition-colors text-sm"
                >
                    Track Driver
                </button>
                <button 
                  onClick={() => toggleInfo(order._id, 'restaurant')}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-brand-primary font-bold py-2.5 rounded-xl transition-colors text-sm"
                >
                    Contact Restaurant
                </button>
            </div>
            
            <div className="mt-4 bg-brand-primary/5 rounded-xl border border-brand-primary/20 p-4 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Delivery Verification OTP</p>
                <div className="text-3xl font-black text-brand-primary tracking-[0.25em]">
                  {order.deliveryOtp || '----'}
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-2">Give this PIN to your driver when they arrive</p>
            </div>
            
            <AnimatePresence>
              {expandedInfo?.orderId === order._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
                    {expandedInfo.type === 'driver' ? (
                      order.driverDetails?.name ? (
                        <>
                          <p className="font-bold text-brand-primary">Driver Details</p>
                          <p className="text-sm text-slate-600">Name: <span className="font-semibold text-slate-800">{order.driverDetails.name}</span></p>
                          <p className="text-sm text-slate-600">Phone: <span className="font-semibold text-slate-800">{order.driverDetails.phone}</span></p>
                        </>
                      ) : (
                        <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                          <span className="text-xl">🚚</span> Driver will be assigned soon.
                        </p>
                      )
                    ) : (
                      order.businessId ? (
                        <>
                          <p className="font-bold text-brand-primary">{order.businessId.name}</p>
                          <p className="text-sm text-slate-600 flex items-start gap-2">
                              <MapPin size={16} className="mt-0.5 shrink-0 text-brand-accent" />
                              <span>{order.businessId.address || 'Address unavailable'}</span>
                          </p>
                          <p className="text-sm text-slate-600 flex items-center gap-2">
                              <Phone size={16} className="shrink-0 text-brand-accent" />
                              <span>{order.businessId.contactPhone || 'Phone unavailable'}</span>
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-slate-500 font-medium">Restaurant details unavailable.</p>
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActiveOrdersTab;
