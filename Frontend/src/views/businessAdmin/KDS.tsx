import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  Clock, ChevronRight, CheckCircle2, ChefHat, AlertTriangle,
  Flame, Wind, Plus as PlusIcon, RotateCcw, Timer, MonitorOff, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Completed' | 'Pending' | 'In Kitchen';

export const KDS: React.FC = () => {
  const queryClient = useQueryClient();
  const [completedItemsMap, setCompletedItemsMap] = useState<Record<string, string[]>>({});

  const { data: dbOrders = [] } = useQuery({
    queryKey: ['kds-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      // Filter out completed/cancelled, keep active
      return res.data.filter((o: any) => o.status !== 'Completed' && o.status !== 'Cancelled' && o.type !== 'Delivery');
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status, prepTime }: { id: string, status: string, prepTime?: number }) => {
      const payload: any = { status };
      if (prepTime) payload.estimatedPrepTime = prepTime;
      const res = await api.put(`/orders/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['kds-orders'] });
    }
  });

  useEffect(() => {
    // Socket connection
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('Connected to KDS Socket');
    });

    socket.on('newOrder', (order) => {
      toast.success(`New order received!`);
      queryClient.invalidateQueries({ queryKey: ['kds-orders'] });
    });

    socket.on('orderUpdated', (order) => {
      queryClient.invalidateQueries({ queryKey: ['kds-orders'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const handleToggleItem = (orderId: string, itemId: string) => {
    setCompletedItemsMap(prev => {
      const orderItems = prev[orderId] || [];
      if (orderItems.includes(itemId)) {
        return { ...prev, [orderId]: orderItems.filter(id => id !== itemId) };
      } else {
        return { ...prev, [orderId]: [...orderItems, itemId] };
      }
    });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, askForPrepTime: boolean = false) => {
    let prepTime;
    if (askForPrepTime) {
      const time = prompt("Enter estimated preparation time in minutes (e.g. 15):");
      if (time && !isNaN(Number(time))) {
        prepTime = Number(time);
      } else {
        toast.error("Invalid time entered. Skipping prep time.");
      }
    }
    updateOrderStatusMutation.mutate({ id: orderId, status, prepTime });
  };

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data || res.data;
    }
  });

  const getUrgencyColor = (createdAt: string) => {
    const mins = (new Date().getTime() - new Date(createdAt).getTime()) / 60000;
    if (mins > 30) return 'bg-red-50 border-red-200';
    if (mins > 15) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-slate-200';
  };

  if (settingsData && settingsData.kdsWebhook === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-center p-8">
        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <MonitorOff size={48} className="text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">KDS Disabled</h2>
        <p className="text-slate-500 max-w-md">
          The Kitchen Display System has been deactivated via System Controls. 
          Please use physical tickets or re-enable the KDS Webhook in the Tables dashboard.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': 
      case 'New': return 'border-orange-500 bg-orange-500/10';
      case 'In Kitchen':
      case 'Preparing': return 'border-brand-accent bg-brand-accent/5';
      case 'Ready': return 'border-brand-success bg-brand-success/5';
      default: return 'border-slate-700 bg-slate-800/50';
    }
  };

  return (
    <div className="bg-[#020617] h-[calc(100vh-80px)] p-6 overflow-hidden flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-white text-2xl font-semibold font-display flex items-center gap-3">
            <ChefHat className="text-brand-accent fill-brand-accent/20" />
            Kitchen Display System (KDS)
          </h2>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest leading-none mb-1">Queue</p>
              <p className="text-brand-accent font-semibold leading-none">{dbOrders.length} Orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 flex gap-6 custom-scrollbar items-start">
        <AnimatePresence>
          {dbOrders.map((order: any) => {
            const completedItems = completedItemsMap[order._id] || [];
            return (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-[380px] flex-shrink-0 flex flex-col rounded-[32px] border transition-colors duration-500 ${getStatusColor(order.status)}`}
              >
                {/* Ticket Header */}
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${
                        ['New', 'Pending'].includes(order.status) ? 'bg-orange-500 text-white' : 
                        ['Preparing', 'In Kitchen'].includes(order.status) ? 'bg-brand-accent text-white' : 'bg-brand-success text-white'
                      }`}>
                        {order.status}
                      </span>
                      {order.tableId && (
                        <span className="bg-white/10 text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase">
                          Table #{order.tableId.number || '0'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-white font-semibold text-lg mt-2">Order #{order._id.slice(-4)}</h4>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-right">
                      <div className={`flex items-center justify-end gap-1.5 font-mono font-semibold text-base ${
                        ['New', 'Pending'].includes(order.status) ? 'text-orange-400' : 'text-slate-400'
                      }`}>
                        <Timer size={16} />
                        {order.estimatedPrepTime ? `${order.estimatedPrepTime} min` : 'Est: --'}
                      </div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5 tracking-widest">{order.type}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this order?')) {
                          updateOrderStatus(order._id, 'Cancelled');
                        }
                      }}
                      className="text-slate-500 hover:text-red-500 transition-colors mt-0.5"
                      title="Delete Order"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Ticket Body */}
                <div className="flex-1 max-h-[400px] overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {order.notes && (
                    <div className="mb-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 text-yellow-200">
                      <p className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1">Special Instructions</p>
                      <p className="text-sm font-semibold whitespace-pre-wrap">{order.notes}</p>
                    </div>
                  )}
                  {order.items.map((item: any, itemIdx: number) => {
                    const isCompleted = completedItems.includes(item._id || item.menuItem);
                    return (
                      <motion.div 
                        key={item._id || item.menuItem} 
                        onClick={() => handleToggleItem(order._id, item._id || item.menuItem)}
                        className={`flex items-start gap-4 cursor-pointer group transition-all p-2 rounded-2xl ${isCompleted ? 'bg-black/20 opacity-50' : 'hover:bg-white/5'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold transition-all border ${
                          isCompleted ? 'bg-transparent border-white/10 text-slate-500' : 'bg-white/5 border-white/10 text-white group-hover:border-brand-accent'
                        }`}>
                          {item.quantity}x
                        </div>
                        <div className="flex-1 pt-1">
                          <h6 className={`text-slate-100 font-bold leading-tight flex items-center gap-2 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                            {item.name}
                            {itemIdx === 0 && !isCompleted && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 rounded text-[10px] font-semibold uppercase tracking-tighter">Priority</span>}
                          </h6>
                        </div>
                        <div className={`p-1 rounded-lg transition-all ${isCompleted ? 'bg-brand-success/20 text-brand-success' : 'text-slate-700'}`}>
                           <CheckCircle2 size={24} strokeWidth={isCompleted ? 3 : 2} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Ticket Footer Actions */}
                <div className="p-6 bg-black/30 rounded-b-[32px] border-t border-white/5 flex gap-3">
                   {['New', 'Pending'].includes(order.status) ? (
                     <button 
                       onClick={() => updateOrderStatus(order._id, 'In Kitchen', true)}
                       className="flex-1 py-4 bg-brand-accent text-white rounded-2xl text-xs font-semibold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-accent/20"
                     >
                       START COOKING
                     </button>
                   ) : ['Preparing', 'In Kitchen'].includes(order.status) ? (
                     <button 
                       onClick={() => updateOrderStatus(order._id, 'Ready')}
                       className="flex-1 py-4 bg-brand-success text-white rounded-2xl text-xs font-semibold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-success/20"
                     >
                       MARK AS READY
                     </button>
                   ) : (
                    <div className="flex-1 flex gap-2">
                      {(!order.paymentMethod || order.paymentMethod === 'Unpaid') && order.type === 'POS' ? (
                        <button 
                          onClick={() => window.open(`/admin/pos?orderId=${order._id}`, '_blank')}
                          className="flex-1 py-4 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-2xl text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                           BILL IN POS
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateOrderStatus(order._id, 'Completed')}
                          className="flex-1 py-4 bg-slate-800 text-white hover:bg-slate-700 rounded-2xl text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                           <CheckCircle2 size={16} /> PICKED UP
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
