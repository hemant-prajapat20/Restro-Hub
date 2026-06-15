import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { ShoppingBag, Clock, MapPin, ChevronRight, CheckCircle2, Clock3, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  paymentMethod?: string;
  customerDetails?: {
    name: string;
    phone: string;
    address?: string;
  };
}

const PastOrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/customer-orders/my-orders');
      const pastOrders = response.data.data.filter((order: Order) => 
        ['Completed', 'Cancelled', 'Delivered'].includes(order.status)
      );
      setOrders(pastOrders);
    } catch (error) {
      toast.error('Failed to load past orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
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
        <h3 className="text-2xl font-black text-brand-primary mb-2">No past orders</h3>
        <p className="text-slate-500 font-medium max-w-sm">Looks like you haven't placed any orders yet. Discover top restaurants and place your first order!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-brand-primary mb-6 tracking-tight flex items-center gap-2">
        <Clock className="text-brand-accent" size={24} />
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
                  <h3 className="font-extrabold text-brand-primary text-lg">{order.businessId?.name || 'Unknown Restaurant'}</h3>
                  <p className="text-sm text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-xs text-slate-400 font-bold mt-1">Order #{order.transactionId ? order.transactionId : order._id.substring(order._id.length - 8).toUpperCase()}</p>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end gap-2 mt-4 md:mt-0">
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
                       <span className="flex items-center gap-1 bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                           <Clock3 size={14} /> {order.status}
                       </span>
                   )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-black text-brand-primary text-xl">₹{order.total.toFixed(2)}</p>
                  <button 
                    onClick={() => toggleOrderExpansion(order._id)}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-brand-primary"
                  >
                    {expandedOrderIds.has(order._id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedOrderIds.has(order._id) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {/* Order Details */}
                  <div className="mt-6 bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-3">
                     <div className="flex justify-between items-start">
                         <div>
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Order ID</p>
                             <p className="text-sm font-black text-brand-primary">#{order.transactionId ? order.transactionId : order._id.substring(order._id.length - 8).toUpperCase()}</p>
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
                  
                  <div className="mt-4 pt-4 border-t border-slate-100">
                     <p className="text-sm text-slate-600 font-medium truncate">
                         {order.items.map(item => `${item.quantity} x ${item.name}`).join(', ')}
                     </p>
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

export default PastOrdersTab;
