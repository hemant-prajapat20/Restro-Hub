import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { ShoppingBag, Clock, MapPin, ChevronRight, CheckCircle2, Clock3 } from 'lucide-react';
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

const PastOrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/customer-orders/my-orders');
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to load past orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium mt-4">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="text-slate-300" size={40} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">No past orders</h3>
        <p className="text-slate-500 font-medium max-w-sm">Looks like you haven't placed any orders yet. Discover top restaurants and place your first order!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
        <Clock className="text-orange-500" size={24} />
        Your Past Orders
      </h2>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={order._id}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {order.businessId?.logoUrl ? (
                         <img src={order.businessId.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                         <ShoppingBag className="text-slate-400" />
                    )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{order.businessId?.name || 'Unknown Restaurant'}</h3>
                  <p className="text-sm text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-xs text-slate-400 font-bold mt-1">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</p>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end gap-2">
                <div className="flex items-center gap-2">
                   {order.status === 'Completed' || order.status === 'Delivered' ? (
                       <span className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                           <CheckCircle2 size={14} /> {order.status}
                       </span>
                   ) : order.status === 'Cancelled' ? (
                       <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                           {order.status}
                       </span>
                   ) : (
                       <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                           <Clock3 size={14} /> {order.status}
                       </span>
                   )}
                </div>
                <p className="font-black text-slate-900 text-xl">${order.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
               <p className="text-sm text-slate-600 font-medium truncate">
                   {order.items.map(item => `${item.quantity} x ${item.name}`).join(', ')}
               </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PastOrdersTab;
