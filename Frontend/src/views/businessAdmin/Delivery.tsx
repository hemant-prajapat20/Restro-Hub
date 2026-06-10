import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Smartphone, 
  Cloud, 
  Bike, 
  Clock, 
  ChevronRight,
  RefreshCw,
  Plus,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const Delivery: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAddOrder, setShowAddOrder] = React.useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [selectedItems, setSelectedItems] = useState<{item: any, quantity: number}[]>([]);

  const { data: menu = [], isLoading: menuLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const response = await api.get('/menu');
      return response.data;
    }
  });

  const { data: deliveryOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['deliveryOrders'],
    queryFn: async () => {
      const response = await api.get('/orders?type=Delivery');
      return response.data.map((order: any) => ({
        id: 'DEL-' + order._id.toString().slice(-4).toUpperCase(),
        source: order.source || 'Direct',
        items: order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', '),
        total: `₹${order.total}`,
        time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: order.status
      }));
    }
  });

  const createDeliveryOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      await api.post('/orders', orderData);
    },
    onSuccess: () => {
      toast.success('Manual Delivery Order Created');
      queryClient.invalidateQueries({ queryKey: ['deliveryOrders'] });
      setShowAddOrder(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setSelectedItems([]);
    },
    onError: () => toast.error('Failed to create order')
  });

  const handleAddItem = (item: any) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.item._id === item._id);
      if (existing) {
        return prev.map(i => i.item._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleCreateOrder = () => {
    if (selectedItems.length === 0 || !newCustomerName || !newCustomerPhone) {
      toast.error('Please enter customer details and select items');
      return;
    }

    const subtotal = selectedItems.reduce((acc, current) => acc + (current.item.price * current.quantity), 0);
    const tax = Math.round(subtotal * 0.05); // 5% tax

    createDeliveryOrderMutation.mutate({
      type: 'Delivery',
      source: 'Direct',
      customerDetails: {
        name: newCustomerName,
        phone: newCustomerPhone
      },
      items: selectedItems.map(si => ({
        menuItem: si.item._id,
        name: si.item.name,
        quantity: si.quantity,
        price: si.item.price
      })),
      subtotal,
      tax,
      total: subtotal + tax,
      status: 'In Kitchen'
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
       <div className="flex items-center justify-between">
          <div className="flex gap-4">
             <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-semibold flex items-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/Zomato_logo.png" className="w-5 h-5 rounded" alt="Zomato" />
                Zomato: <span className="text-brand-success font-semibold">Connected</span>
             </div>
             <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-semibold flex items-center gap-2">
                <img src="https://static.vecteezy.com/system/resources/previews/016/505/309/original/swiggy-logo-on-transparent-background-free-png.png" className="w-5 h-5 object-contain" alt="Swiggy" />
                Swiggy: <span className="text-brand-success font-semibold">Connected</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all">
               <RefreshCw size={18} />
               Sync Portals
            </button>
            <button 
              onClick={() => setShowAddOrder(true)}
              className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-2xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-brand-accent/20"
            >
               <Plus size={18} strokeWidth={3} />
               PLACE NEW ORDER
            </button>
          </div>
       </div>

       {/* Manual Order Modal (Simplified) */}
       {showAddOrder && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddOrder(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl p-10"
            >
               <h3 className="text-3xl font-semibold text-slate-900 mb-8">Create Delivery Order</h3>
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2">Customer Name</label>
                        <input value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} type="text" placeholder="e.g. John Doe" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-semibold" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2">Phone</label>
                        <input value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} type="tel" placeholder="+91 XXXX" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-semibold" />
                     </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2">Select Items from Menu</label>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                       {menu.map((item: any) => (
                         <div key={item._id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                               <div>
                                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                                  <p className="text-[10px] font-semibold text-slate-400 uppercase">₹{item.price}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               {selectedItems.find(i => i.item._id === item._id) && (
                                 <span className="text-xs font-bold text-brand-accent px-2">
                                   x{selectedItems.find(i => i.item._id === item._id)?.quantity}
                                 </span>
                               )}
                               <button onClick={() => handleAddItem(item)} className="p-2 text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all">
                                  <Plus size={18} strokeWidth={3} />
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
               <div className="flex gap-4 mt-10">
                  <button onClick={() => setShowAddOrder(false)} className="flex-1 py-4 font-semibold text-slate-400 hover:bg-slate-50 rounded-2xl">CANCEL</button>
                  <button 
                    onClick={handleCreateOrder}
                    disabled={createDeliveryOrderMutation.isPending}
                    className="flex-[2] py-4 bg-brand-success text-white font-semibold rounded-2xl shadow-xl shadow-brand-success/20 disabled:opacity-50"
                  >
                    {createDeliveryOrderMutation.isPending ? 'CREATING...' : 'CONFIRM & CREATE'}
                  </button>
               </div>
            </motion.div>
         </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
             <div className="bg-white border border-stone-200/80 rounded-[32px] p-8 lg:p-10 shadow-soft h-full flex flex-col">
                 <h4 className="text-xl font-semibold font-display flex items-center gap-2 text-slate-900 mb-6">
                    <ShoppingBag className="text-brand-accent" />
                    Live Feed
                 </h4>
                 <div className="space-y-4">
                 {deliveryOrders.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 font-medium">No live delivery orders</div>
                 ) : deliveryOrders.map((order: any) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={order.id} 
                    className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100 flex items-center gap-6 hover:bg-slate-100/50 transition-colors"
                  >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-semibold ${
                       order.source === 'Zomato' ? 'bg-red-50 text-red-600' : 
                       order.source === 'Swiggy' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                     }`}>
                        {order.source[0]}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-3">
                           <h6 className="font-semibold text-slate-900">{order.id}</h6>
                           <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{order.time}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mt-1">{order.items}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-semibold text-slate-900">{order.total}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          order.status === 'Ready' || order.status === 'Completed' || order.status === 'Out for Delivery' ? 'bg-brand-success/10 text-brand-success' : 'bg-blue-50 text-blue-500'
                        }`}>
                           {order.status}
                        </span>
                     </div>
                     <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-brand-accent transition-all cursor-pointer">
                        <ChevronRight size={20} />
                     </button>
                  </motion.div>
                ))}
             </div>
             </div>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-brand-primary p-8 rounded-[32px] text-white space-y-8 overflow-hidden relative shadow-2xl h-full flex flex-col justify-between">
                <div className="relative z-10 space-y-8">
                   <div>
                      <h4 className="text-2xl font-semibold font-display">Daily Delivery Heatmap</h4>
                      <p className="text-slate-400 text-sm mt-1">High traffic zones for riders</p>
                   </div>
                   <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center italic text-slate-500 font-semibold">
                      Map Visualization Placeholder
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                         <span className="text-sm font-semibold">Total Payouts</span>
                         <span className="text-lg font-semibold">₹18,420</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                         <span className="text-sm font-semibold">Rider Avg. Delay</span>
                         <span className="text-lg font-semibold text-brand-accent">+2.4m</span>
                      </div>
                   </div>
                </div>
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl opacity-50" />
             </div>
          </div>
       </div>
    </div>
  );
};
