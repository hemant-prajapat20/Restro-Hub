import React, { useState } from 'react';
import { 
  FileText, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence as FramerAnimatePresence } from 'motion/react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.on('newOrder', () => queryClient.invalidateQueries({ queryKey: ['ordersAll'] }));
    socket.on('orderUpdated', () => queryClient.invalidateQueries({ queryKey: ['ordersAll'] }));
    return () => { socket.disconnect(); };
  }, [queryClient]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['ordersAll'],
    queryFn: async () => {
      const response = await api.get('/orders');
      return response.data;
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => await api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordersAll'] });
      toast.success('Order status updated');
    }
  });

  if (isLoading) {
    return <div className="p-5 flex justify-center items-center h-[calc(100vh-80px)]">Loading Orders...</div>;
  }

  const historyOrders = orders.filter((o: any) => o.status === 'Completed' || o.status === 'Cancelled' || o.status === 'Served');
  
  const filteredOrders = historyOrders.filter((inv: any) => {
    const invId = inv._id || inv.id || '';
    return invId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.customerDetails?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="px-8 pt-8 pb-0 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
             <h3 className="text-2xl font-semibold font-display text-slate-900 flex items-center gap-3">
               <FileText className="w-8 h-8 text-brand-primary" />
               Order Management
             </h3>
             <p className="text-slate-500 font-medium">Manage active orders across all modules and track historical transactions</p>
          </div>
       </div>

       <div className="bg-white rounded-[32px] border border-stone-200/80 shadow-soft overflow-hidden flex flex-col mb-8 mt-4">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <h5 className="font-semibold font-display text-slate-900 text-lg">
               Past Transactions
             </h5>
             <div className="relative w-72">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Order ID or Customer..." 
                  className="pl-12 pr-4 py-3 w-full bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                />
             </div>
          </div>
          <div className="overflow-x-auto w-full">
             <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                   <tr>
                      <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Order ID & Date</th>
                      <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Customer Details</th>
                      <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">Module / Type</th>
                      <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">Total Amount</th>
                      <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredOrders.length === 0 ? (
                     <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-medium">No orders found</td></tr>
                   ) : filteredOrders.map((order: any) => {
                     const invId = order._id || order.id || '';
                     const shortId = order.transactionId ? order.transactionId : (invId ? invId.slice(-8).toUpperCase() : 'N/A');
                     return (
                     <tr key={invId} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-6 py-4">
                           <button 
                             onClick={() => window.open(`/invoice/${invId}`, '_blank')}
                             className="text-sm font-semibold text-brand-primary hover:underline hover:text-brand-accent transition-colors text-left"
                           >
                             #{shortId}
                           </button>
                           <p className="text-[10px] font-semibold text-slate-400 mt-1">{new Date(order.createdAt || order.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-bold text-slate-900">{order.customerDetails?.name || 'Walk-in Customer'}</p>
                           <p className="text-[10px] font-semibold text-slate-400">{order.customerDetails?.phone || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600`}>
                             {order.type}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-sm text-slate-900">₹{(order.total || order.amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                             order.status === 'Completed' || order.status === 'Served' ? 'bg-emerald-50 text-emerald-600' : 
                             order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-500'
                           }`}>
                             {order.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                           {order.status !== 'Cancelled' && (
                             <button 
                               onClick={() => window.open(`/invoice/${invId}`, '_blank')}
                               className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors"
                             >
                               View Receipt
                             </button>
                           )}
                        </td>
                     </tr>
                     );
                   })}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};
