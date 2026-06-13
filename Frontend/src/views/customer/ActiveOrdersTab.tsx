import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Package, Clock, Activity, Search } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  businessId: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
  total: number;
  status: string;
  createdAt: string;
  items: any[];
}

interface Props {
  onNavigateHome: () => void;
}

const ActiveOrdersTab: React.FC<Props> = ({ onNavigateHome }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveOrders();
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
      case 'pending': return 25;
      case 'preparing': return 50;
      case 'ready': return 75;
      case 'served': return 90;
      case 'out_for_delivery': return 90;
      default: return 10;
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
                <p className="font-black text-brand-primary text-xl mt-2">${order.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
                    <span className={order.status === 'Pending' ? 'text-brand-accent' : ''}>Order Placed</span>
                    <span className={order.status === 'Preparing' ? 'text-brand-accent' : ''}>Preparing</span>
                    <span className={['Ready', 'Served', 'Out_for_delivery'].includes(order.status) ? 'text-brand-accent' : ''}>On the way</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${getStatusProgress(order.status)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-brand-accent h-2 rounded-full relative"
                    >
                        <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 animate-[shimmer_2s_infinite]"></div>
                    </motion.div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 text-sm text-slate-600 font-medium">
              {order.items.map((item: any, idx: number) => (
                <span key={idx} className="bg-brand-bg px-3 py-1.5 rounded-lg border border-slate-100">
                  {item.quantity}x {item.name || item.itemId?.name || 'Item'}
                </span>
              ))}
            </div>
            
            <div className="mt-6 flex gap-3">
                <button className="flex-1 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent font-bold py-2.5 rounded-xl transition-colors text-sm">
                    Track Driver
                </button>
                <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-brand-primary font-bold py-2.5 rounded-xl transition-colors text-sm">
                    Contact Restaurant
                </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActiveOrdersTab;
