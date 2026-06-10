import React, { useState } from 'react';
import { 
  Crown, 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  Heart, 
  AlertCircle, 
  Flame, 
  UtensilsCrossed, 
  MapPin, 
  MoreVertical,
  CheckCircle2,
  X,
  Sparkles,
  DollarSign,
  ShoppingCart,
  Receipt,
  Printer,
  ChevronRight,
  PlusCircle,
  Minus,
  Trash2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateReceiptPDF } from '../../utils/pdfGenerator';

interface SignatureItem {
  id: string;
  name: string;
  description: string;
  course: 'Starter' | 'Main Course' | 'Dessert';
  price: number;
  chefName: string;
  isVeg: boolean;
  isAvailable: boolean;
  image: string;
}

interface PrivateDiningRoom {
  id: string;
  name: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
  activeBill: number;
  minSpend: number;
  notes: string;
}

const INITIAL_SIGNATURES: SignatureItem[] = [
  {
    id: 'S1',
    name: 'Truffle-Infused Tandoori Malai Lobster',
    description: 'Fresh lobster tails slow-charcoaled in clay tandoor, drizzled with white truffle oil & edible gold leaf spec.',
    course: 'Starter',
    price: 3200,
    chefName: 'Chef Ranveer',
    isVeg: false,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=400&fit=crop'
  },
  {
    id: 'S2',
    name: 'Mughlai Saffron Dum Biryani (Royal Case)',
    description: 'Aged Long Grain Basmati slow-steamed under purdah dough crust with organic saffron, rosewater & 24hr marinated baby goat.',
    course: 'Main Course',
    price: 1850,
    chefName: 'Chef Rajesh',
    isVeg: false,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=400&h=400&fit=crop'
  },
  {
    id: 'S3',
    name: 'Smoked Saffron Pistachio Kulfi Dome',
    description: 'Slow evaporated thickened whole milk ice-cream flavored with saffron, cardamom and pistachio, encapsulated in a hot sugar dome.',
    course: 'Dessert',
    price: 850,
    chefName: 'Chef Ranveer',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&h=400&fit=crop'
  }
];

const INITIAL_PDRS: PrivateDiningRoom[] = [
  { id: 'P1', name: 'Maharani Suite (PDR 1)', capacity: 12, status: 'Reserved', activeBill: 0, minSpend: 25000, notes: 'Golden decor canopy, personal premium soundbar' },
  { id: 'P2', name: 'Chamber of Nawabs (PDR 2)', capacity: 8, status: 'Occupied', activeBill: 18450, minSpend: 15000, notes: 'Authentic royal low-sitting divan experience' },
  { id: 'P3', name: 'Maison Glass Gazebo (PDR 3)', capacity: 6, status: 'Available', activeBill: 0, minSpend: 10000, notes: 'Panoramic sky-view with personal sommelier service' }
];

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const RestroSignature: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<PrivateDiningRoom | null>(null);

  // Form states for New Signature Dish
  const [newDishName, setNewDishName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCourse, setNewCourse] = useState<'Starter' | 'Main Course' | 'Dessert'>('Main Course');
  const [newPrice, setNewPrice] = useState('');
  const [newChef, setNewChef] = useState('');
  const [newIsVeg, setNewIsVeg] = useState(true);

  // Restro Fine-Dining Billing POS states
  const [activeTab, setActiveTab] = useState<'display' | 'billing'>('display');
  const [cart, setCart] = useState<{ dish: SignatureItem; quantity: number; directive: string }[]>([]);
  const [targetRoomId, setTargetRoomId] = useState<string>('P2');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Maison Guild Tab'>('UPI');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [checkoutReceipt, setCheckoutReceipt] = useState<any | null>(null);

  const addToCart = (dish: SignatureItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dish.id);
      if (existing) {
        return prev.map(item => item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { dish, quantity: 1, directive: '' }];
    });
  };

  const removeOneFromCart = (dishId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dishId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.dish.id === dishId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.dish.id !== dishId);
    });
  };

  const updateCartDirective = (dishId: string, value: string) => {
    setCart(prev => prev.map(item => item.dish.id === dishId ? { ...item, directive: value } : item));
  };

  const applyRestroDiscount = () => {
    const code = discountCode.toUpperCase().trim();
    if (code === 'AMEXCENTURION') {
      setAppliedDiscount(30);
    } else if (code === 'VIPROYAL') {
      setAppliedDiscount(20);
    } else if (code === 'FINE10') {
      setAppliedDiscount(10);
    } else {
      setAppliedDiscount(0);
    }
  };

  // Compute live billing breakdown values
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
  const discountAmount = Math.round(cartSubtotal * (appliedDiscount / 100));
  const amountAfterDiscount = cartSubtotal - discountAmount;
  const serviceCharge = Math.round(amountAfterDiscount * 0.15); // 15% luxury silver service
  const cgst = Math.round(amountAfterDiscount * 0.09); // 9% CGST
  const sgst = Math.round(amountAfterDiscount * 0.09); // 9% SGST
  const cartTotal = amountAfterDiscount + serviceCharge + cgst + sgst;

  const { data: signatures = [], isLoading: loadingSignatures } = useQuery<SignatureItem[]>({
    queryKey: ['signatures'],
    queryFn: async () => {
      const response = await api.get('/restro/signatures');
      return response.data.map((item: any) => ({ ...item, id: item._id }));
    }
  });

  const { data: pdrs = [], isLoading: loadingPdrs } = useQuery<PrivateDiningRoom[]>({
    queryKey: ['pdrs'],
    queryFn: async () => {
      const response = await api.get('/restro/pdrs');
      return response.data.map((item: any) => ({ ...item, id: item._id }));
    }
  });

  const addSignatureMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/restro/signatures', data);
    },
    onSuccess: () => {
      toast.success('Signature dish added successfully');
      queryClient.invalidateQueries({ queryKey: ['signatures'] });
      setNewDishName('');
      setNewDescription('');
      setNewPrice('');
      setNewChef('');
      setShowAddDishModal(false);
    },
    onError: () => toast.error('Failed to add signature dish')
  });

  const updatePdrStatusMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await api.put(`/restro/pdrs/${id}/status`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdrs'] });
    }
  });

  const checkoutPdrMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await api.post(`/restro/pdrs/${id}/checkout`, data);
    },
    onSuccess: () => {
      toast.success('PDR Checkout Successful');
      queryClient.invalidateQueries({ queryKey: ['pdrs'] });
      setCart([]);
    },
    onError: () => toast.error('Failed to checkout PDR')
  });

  const handleRestroCheckout = () => {
    if (cart.length === 0) return;

    // Checkout API
    checkoutPdrMutation.mutate({ id: targetRoomId, data: { totalBill: cartTotal } });

    // Generate Imperial fine-dining receipt
    const invoiceNum = 'ROYAL-POS-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString();

    setCheckoutReceipt({
      invoiceNumber: invoiceNum,
      timestamp: dateStr,
      roomName: pdrs.find(r => r.id === targetRoomId)?.name || 'Royal Suite',
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      serviceCharge,
      cgst,
      sgst,
      total: cartTotal,
      payment: paymentMethod,
      chef: 'Ranveer Brar (Executive Chef)'
    });
  };

  const handleCreateSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newPrice || !newChef) return;

    addSignatureMutation.mutate({
      name: newDishName,
      description: newDescription || 'Premium Chef Signature Masterpiece',
      course: newCourse,
      price: Number(newPrice),
      chefName: newChef,
      isVeg: newIsVeg,
      isAvailable: true,
      image: newIsVeg 
        ? 'https://images.unsplash.com/photo-1567184109171-9bfe3957eb05?w=400&h=400&fit=crop'
        : 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=400&fit=crop'
    });
  };

  const handleToggleRoomStatus = (roomId: string, newStatus: 'Available' | 'Occupied' | 'Reserved') => {
    updatePdrStatusMutation.mutate({ id: roomId, data: { status: newStatus, activeBill: newStatus === 'Available' ? 0 : undefined } });
    setSelectedRoom(null);
  };

  return (
    <div className="px-8 pt-8 pb-0 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
      {/* Luxurious Restro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-stone-900 to-stone-950 rounded-2xl border border-amber-900/40 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-brand-accent font-semibold text-xs uppercase tracking-[0.25em]">
            <Crown size={12} className="animate-pulse" />
            Michelin-Inspired Fine Dining Terminal
          </div>
          <h3 className="text-2xl font-semibold font-display text-white tracking-tight">Restro Signature & Suites</h3>
          <p className="text-sm text-stone-400 max-w-xl">
            Settle royal VIP rooms, manage custom multi-course chef tasting menus, and showcase curated signature preparations.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 flex bg-stone-900 border border-stone-800 p-1 rounded-2xl">
          <button 
            type="button"
            onClick={() => setActiveTab('display')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === 'display' ? 'bg-brand-accent text-stone-950 shadow-md shadow-brand-accent/20' : 'text-stone-400 hover:text-white'}`}
          >
             Suites & Signatures
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === 'billing' ? 'bg-brand-accent text-stone-950 shadow-md shadow-brand-accent/20' : 'text-stone-400 hover:text-white'}`}
          >
             Royal POS Counter
          </button>
        </div>

        {/* Dynamic Restro Stats */}
        <div className="relative z-10 flex flex-wrap gap-4">
          <div className="px-6 py-4 bg-stone-900/80 border border-stone-800 rounded-2xl flex items-center gap-3">
            <Users className="text-amber-500" size={24} />
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Active Executive Covers</p>
              <p className="text-lg font-semibold text-white font-mono">18 / 26 VIPs</p>
            </div>
          </div>
          <div className="px-6 py-4 bg-stone-900/80 border border-stone-800 rounded-2xl flex items-center gap-3">
            <Sparkles className="text-amber-500 animate-spin-slow" size={24} />
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Master Tasting Sessions</p>
              <p className="text-lg font-semibold text-white font-mono">02 Live</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Suite Split Layout or Billing Console */}
      <AnimatePresence mode="wait">
        {activeTab === 'display' ? (
          <motion.div 
            key="display"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-5"
          >
            {/* Left Hand: Chef Signatures and VIP Suites */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Private Dining Rooms */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-lg font-semibold uppercase text-stone-800 tracking-tight flex items-center gap-2">
                    <Crown size={18} className="text-brand-accent" />
                    Royal suites & private dining cabins
                  </h4>
                  <span className="text-stone-400 font-semibold text-xs uppercase">Ground Floor West Wing</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pdrs.map((room) => (
                    <div 
                      key={room.id} 
                      onClick={() => setSelectedRoom(room)}
                      className={`aria-interactive bg-white p-4 rounded-[32px] border-2 transition-all cursor-pointer shadow-soft group hover:scale-[1.02] ${
                        room.status === 'Occupied' ? 'border-amber-500/20 card-occupied' : 
                        room.status === 'Reserved' ? 'border-stone-200' : 'border-stone-100 hover:border-brand-accent'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="px-3 py-1 bg-stone-50 rounded-xl text-[9px] font-semibold uppercase text-stone-400 tracking-widest">
                          Cap: {room.capacity} VIPs
                        </div>
                        <span className={`w-3 h-3 rounded-full ${
                          room.status === 'Occupied' ? 'bg-red-500 animate-pulse' : 
                          room.status === 'Reserved' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                      </div>

                      <h5 className="text-base font-semibold text-stone-900 group-hover:text-brand-accent transition-colors">{room.name}</h5>
                      <p className="text-[10px] text-stone-400 font-semibold uppercase mt-1 tracking-widest leading-relaxed">
                         {room.notes}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-stone-100">
                         <div>
                            <p className="text-[8px] font-semibold text-stone-400 uppercase tracking-widest">Min. Spend</p>
                            <p className="text-sm font-semibold text-brand-primary">₹{room.minSpend.toLocaleString()}</p>
                         </div>
                         <div>
                            <p className="text-[8px] font-semibold text-stone-400 uppercase tracking-widest">Active bill</p>
                            <p className="text-sm font-semibold text-brand-success">
                              {room.activeBill > 0 ? `₹${room.activeBill.toLocaleString()}` : 'No Active Bill'}
                            </p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chef Curated Signatures List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2 pt-4">
                  <h4 className="text-lg font-semibold uppercase text-stone-800 tracking-tight flex items-center gap-2">
                    <UtensCrossedIcon size={18} className="text-brand-accent" />
                    Featured chef specifications
                  </h4>
                  <button 
                    onClick={() => setShowAddDishModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-brand-accent rounded-xl text-xs font-semibold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shadow-brand-primary/10"
                  >
                    <Plus size={14} strokeWidth={3} />
                    Propose Dish 
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start content-start">
                  {signatures.map((dish) => (
                    <div key={dish.id} className="bg-white rounded-2xl border border-stone-200/80 shadow-soft overflow-hidden group hover:border-brand-accent/50 transition-all flex flex-col md:flex-row h-fit">
                      <div className="w-full md:w-36 h-40 md:h-full relative overflow-hidden flex-shrink-0">
                        <img src={dish.image} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt={dish.name} />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-semibold uppercase tracking-widest border ${
                              dish.isVeg ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                            }`}>
                              {dish.isVeg ? 'Veg' : 'Non-Veg'} • {dish.course}
                            </span>
                            <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                              <Crown size={10} />
                              By {dish.chefName}
                            </p>
                          </div>
                          <h5 className="text-base font-semibold text-stone-900 mt-2 block">{dish.name}</h5>
                          <p className="text-xs text-stone-400 font-medium leading-relaxed mt-1">{dish.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                          <div>
                            <p className="text-[8px] font-semibold text-stone-400 uppercase tracking-widest">Base Price</p>
                            <p className="text-lg font-semibold text-brand-primary">₹{dish.price.toLocaleString()}</p>
                          </div>
                          <span className="text-[10px] font-semibold uppercase text-brand-accent bg-amber-500/10 px-3 py-1 rounded-xl">Chef Special</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Hand Sidebar: Master Chef Active Tasting session */}
            <div className="space-y-6">
              <div className="bg-stone-950 p-5 rounded-2xl border border-amber-950 text-white space-y-6 shadow-xl relative overflow-hidden">
                <h5 className="text-[10px] font-semibold text-brand-accent uppercase tracking-[0.25em] mb-4">Chef Tasting Session Log</h5>
                
                <div className="space-y-4">
                   <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
                      <span className="text-[9px] font-semibold text-brand-accent uppercase tracking-widest block mb-2">Live Session #05</span>
                      <h6 className="text-sm font-semibold text-white uppercase tracking-tight">Royals Tasting Plate</h6>
                      <p className="text-xs text-stone-400 font-medium leading-relaxed mt-1">
                         6 premium courses curated dynamically by Chef Head Sommelier Ranveer for the Agarwal delegation.
                      </p>
                      <div className="flex items-center justify-between mt-4 text-[10px] font-mono">
                         <span className="text-stone-500 font-semibold uppercase">Status</span>
                         <span className="text-amber-500 font-semibold uppercase tracking-wider animate-pulse">Session active</span>
                      </div>
                   </div>
                   
                   <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
                      <span className="text-[9px] font-semibold text-stone-500 uppercase tracking-widest block mb-2">Upcoming - 8:30 PM</span>
                      <h6 className="text-sm font-semibold text-stone-400 uppercase tracking-tight">Ambassador Gala Plate</h6>
                      <p className="text-xs text-stone-500 font-medium leading-relaxed mt-1">
                         8 courses featuring authentic copper oven baked starters.
                      </p>
                   </div>
                </div>

                <div className="pt-6 border-t border-stone-900 text-center">
                   <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest leading-none mb-1">Weekly Booking Revenue</p>
                   <p className="text-3xl font-display font-semibold text-brand-accent">₹248,500</p>
                   <p className="text-[8px] text-stone-500 mt-2 uppercase font-mono tracking-wider">Generated from 14 PDR groups</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-soft space-y-6">
                <h5 className="text-xs font-semibold text-stone-400 uppercase tracking-[0.25em]">Signature Kitchen Protocols</h5>
                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-[11px] text-stone-500 leading-relaxed font-semibold">
                    Gold elements are kept under high security lockbox key #03. Heavy tandoori prawns are strictly organic supply from Kochi docks.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="billing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-5"
          >
            {/* Left Column: Menu Selector for POS (7 columns) */}
            <div className="xl:col-span-7 space-y-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200/80">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Imperial Menu Offerings</span>
                <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider">{signatures.length} chef creations</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {signatures.map(dish => (
                  <button
                    key={dish.id}
                    onClick={() => addToCart(dish)}
                    className="p-4 bg-white rounded-[32px] border border-stone-200/80 hover:border-brand-accent text-left group flex items-start gap-4 transition-all relative cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-100/60 overflow-hidden flex-shrink-0">
                      <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[7px] font-semibold uppercase tracking-widest border ${
                          dish.isVeg ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {dish.course}
                        </span>
                      </div>
                      <h5 className="text-sm font-semibold text-stone-900 group-hover:text-brand-primary transition-colors truncate">{dish.name}</h5>
                      <p className="text-[10px] text-stone-400 font-medium truncate">Prepared under {dish.chefName}</p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-semibold text-stone-950 font-mono">₹{dish.price.toLocaleString()}</span>
                        <span className="text-[9px] font-semibold text-brand-accent uppercase tracking-wider group-hover:underline">Add to Order +</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Docket Cart State, Taxes & Custom Receipt (5 columns) */}
            <div className="xl:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-soft p-5 space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="text-brand-accent" size={18} />
                    <h4 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">Royal Order Ticket</h4>
                  </div>
                  <button 
                    onClick={() => setCart([])}
                    disabled={cart.length === 0}
                    className="text-[10px] font-semibold text-stone-400 hover:text-stone-950 uppercase tracking-widest disabled:opacity-40"
                  >
                    Clear Cart
                  </button>
                </div>

                {/* Cart Body */}
                {cart.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl bg-stone-50/50 border border-dashed border-stone-150 p-4 flex flex-col items-center gap-3">
                    <UtensilsCrossed className="text-stone-300 animate-pulse" size={40} />
                    <div>
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Docket is empty</p>
                      <p className="text-[11px] text-stone-400 mt-1 max-w-[240px]">Select any Michelin signature dish above to initiate the royal suite transaction.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {cart.map((cartItem) => (
                      <div key={cartItem.dish.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-150 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-stone-900 truncate">{cartItem.dish.name}</p>
                            <p className="text-[10px] text-stone-400 font-mono">₹{cartItem.dish.price} each</p>
                          </div>
                          
                          <div className="flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                            <button 
                              onClick={() => removeOneFromCart(cartItem.dish.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-stone-500 hover:bg-stone-50"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-semibold text-stone-800 font-mono">{cartItem.quantity}</span>
                            <button 
                              onClick={() => addToCart(cartItem.dish)}
                              className="px-2.5 py-1 text-xs font-semibold text-stone-500 hover:bg-stone-50"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <input 
                          type="text" 
                          placeholder="Chef cooking directives (e.g., medium rare, allergen free)"
                          value={cartItem.directive}
                          onChange={(e) => updateCartDirective(cartItem.dish.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-[9.5px] font-medium text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-accent/30"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Logistics Configuration (Target Room & VIP Code) */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest px-1">Active VIP Suite</label>
                      <select 
                        value={targetRoomId}
                        onChange={(e) => setTargetRoomId(e.target.value)}
                        className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                      >
                        {pdrs.map(pdr => (
                          <option key={pdr.id} value={pdr.id}>{pdr.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest px-1">Payment Tender</label>
                      <select 
                        value={paymentMethod}
                        onChange={(e: any) => setPaymentMethod(e.target.value)}
                        className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                      >
                        <option value="UPI">Instant Imperial UPI</option>
                        <option value="Card">Visa / AMEX Centurion</option>
                        <option value="Maison Guild Tab">Maison Guild Ledger</option>
                      </select>
                    </div>
                  </div>

                  {/* Privilege Promo Code */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Imperial Membership Key (e.g. VIPROYAL)"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold uppercase tracking-widest"
                    />
                    <button 
                      type="button" 
                      onClick={applyRestroDiscount}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-brand-accent text-[10px] font-semibold uppercase tracking-wider rounded-xl transition-all"
                    >
                      Authenticate
                    </button>
                  </div>
                  {appliedDiscount > 0 && (
                     <p className="text-[10px] text-brand-success font-semibold uppercase tracking-widest">
                       ✓ Signature Privilege Verified: {appliedDiscount}% Chef Tasting Rebate approved.
                     </p>
                  )}
                </div>

                {/* Ledger Breakdown */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-150 space-y-2">
                  <div className="flex justify-between items-center text-xs text-stone-500 font-semibold">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{cartSubtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs text-brand-danger font-semibold">
                      <span>Privilege Deduction ({appliedDiscount}%)</span>
                      <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs text-stone-400 font-medium font-mono">
                    <span>Imperial Service Charge (15%)</span>
                    <span>₹{serviceCharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-400 font-medium font-mono">
                    <span>CGST (9%)</span>
                    <span>₹{cgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-400 font-medium font-mono">
                    <span>SGST (9%)</span>
                    <span>₹{sgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-stone-900 font-semibold border-t border-stone-200/80 pt-2">
                    <span>Total Bill Balance</span>
                    <span className="text-base font-semibold text-brand-primary font-display">₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Authorize billing button */}
                <button
                  type="button"
                  onClick={handleRestroCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-4 bg-brand-primary text-brand-accent font-semibold rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/10 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  Generate Royal Invoice & Settle Suite
                </button>
              </div>

              {/* Imperial Thermal Receipt view */}
              {checkoutReceipt && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-stone-50 p-4 rounded-[32px] border border-dashed border-stone-300 shadow-soft relative overflow-hidden text-stone-800"
                >
                  {/* Decorative physical cutouts */}
                  <div className="absolute top-0 left-0 right-0 flex justify-between px-4 -translate-y-1">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-white rounded-full" />
                    ))}
                  </div>

                  <div className="pt-4 text-center">
                     <p className="text-xs font-semibold text-stone-900 uppercase tracking-[0.25em] font-display">★ THE IMPERIAL CHAMBERS ★</p>
                     <p className="text-[7.5px] text-stone-400 uppercase tracking-widest font-semibold font-mono">Elite Signature Tasting Lounge</p>
                     <p className="text-[9px] text-stone-400 font-medium mt-1">Taj-Maison Cellar Wing #03, New Delhi</p>
                  </div>

                  <div className="space-y-4 pt-6 border-b border-dashed border-stone-200 pb-4 text-xs font-mono">
                    <div className="flex justify-between text-[9.5px]">
                      <span className="text-stone-400 font-semibold uppercase">Docket Id:</span>
                      <span className="text-stone-800 font-semibold">{checkoutReceipt.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between text-[9.5px]">
                      <span className="text-stone-400 font-semibold uppercase">Timestamp:</span>
                      <span className="text-stone-800 font-semibold">{checkoutReceipt.timestamp}</span>
                    </div>
                    <div className="flex justify-between text-[9.5px]">
                      <span className="text-stone-400 font-semibold uppercase">Assigned Cabin:</span>
                      <span className="text-stone-800 font-semibold">{checkoutReceipt.roomName}</span>
                    </div>
                    <div className="flex justify-between text-[9.5px]">
                      <span className="text-stone-400 font-semibold uppercase">Sommelier:</span>
                      <span className="text-stone-800 font-semibold">{checkoutReceipt.chef}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="py-4 border-b border-dashed border-stone-200 font-mono text-xs space-y-3">
                    {checkoutReceipt.items.map((cartItem: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-semibold text-stone-900">
                          <span>{cartItem.dish.name} (x{cartItem.quantity})</span>
                          <span>₹{(cartItem.dish.price * cartItem.quantity).toLocaleString()}</span>
                        </div>
                        {cartItem.directive && (
                          <p className="text-[8px] text-stone-500 font-medium pl-2">↳ Cooking: "{cartItem.directive}"</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Receipt pricing details */}
                  <div className="py-4 font-mono text-xs space-y-1.5 text-stone-600 border-b border-dashed border-stone-200">
                     <div className="flex justify-between text-[10px]">
                        <span>DOCKET SUB-TOTAL</span>
                        <span>₹{checkoutReceipt.subtotal.toLocaleString()}</span>
                     </div>
                     {checkoutReceipt.discount > 0 && (
                       <div className="flex justify-between text-[10px] text-red-600">
                          <span>PRIVILEGE REBATE</span>
                          <span>-₹{checkoutReceipt.discount.toLocaleString()}</span>
                       </div>
                     )}
                     <div className="flex justify-between text-[10px]">
                        <span>SILVER SERVICE (15%)</span>
                        <span>₹{checkoutReceipt.serviceCharge.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-[10px]">
                        <span>CGST (9%)</span>
                        <span>₹{checkoutReceipt.cgst.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-[10px]">
                        <span>SGST (9%)</span>
                        <span>₹{checkoutReceipt.sgst.toLocaleString()}</span>
                     </div>
                  </div>

                  <div className="pt-4 flex justify-between font-mono font-semibold text-stone-950 text-sm">
                     <span>IMPERIAL GRAND TOTAL</span>
                     <span className="text-base font-display">₹{checkoutReceipt.total.toLocaleString()}</span>
                  </div>

                  <div className="mt-8 pt-4 border-t border-stone-200 text-center font-mono">
                     <p className="text-[9px] text-stone-400 font-semibold tracking-widest uppercase">Thank you for dining in luxury</p>
                     <p className="text-[7.5px] text-stone-300 mt-1 uppercase">SCA Certified Kitchen Registry</p>
                     <div className="flex justify-center mt-4">
                        <div className="grid grid-cols-2 gap-2 w-full max-w-sm mx-auto">
                          <button 
                            onClick={() => window.print()}
                            className="px-3 py-2.5 bg-stone-200 border border-stone-300 text-stone-600 hover:text-stone-900 rounded-xl text-[9.5px] font-sans font-semibold uppercase tracking-widest transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98 transition-all"
                          >
                            <Printer size={12} />
                            Print Ticket
                          </button>
                          <button 
                            onClick={() => {
                              generateReceiptPDF({
                                title: "Imperial Chambers Tasting Room",
                                invoiceNumber: checkoutReceipt.invoiceNumber,
                                timestamp: checkoutReceipt.timestamp,
                                tableName: checkoutReceipt.roomName,
                                items: checkoutReceipt.items.map((cartItem: any) => ({
                                  name: cartItem.dish.name,
                                  price: cartItem.dish.price,
                                  quantity: cartItem.quantity
                                })),
                                subtotal: checkoutReceipt.subtotal,
                                tax: checkoutReceipt.cgst + checkoutReceipt.sgst,
                                discount: checkoutReceipt.discount,
                                total: checkoutReceipt.total,
                                paymentMethod: checkoutReceipt.payment
                              });
                            }}
                            className="px-3 py-2.5 bg-stone-900 border border-amber-900/40 text-brand-accent rounded-xl text-[9.5px] font-sans font-semibold uppercase tracking-widest transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:scale-102 active:scale-98 transition-all"
                          >
                            <FileText size={12} />
                            Download PDF
                          </button>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDR Session State Selector Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
              onClick={() => setSelectedRoom(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 border border-amber-900/15 overflow-hidden"
            >
              <h3 className="text-2xl font-semibold text-stone-900 font-display mb-1">{selectedRoom.name}</h3>
              <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-widest mb-6 border-b border-stone-100 pb-3">{selectedRoom.notes}</p>

              <div className="space-y-4">
                 <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-1 mb-2">Switch Active Status</p>
                 <button 
                   onClick={() => handleToggleRoomStatus(selectedRoom.id, 'Available')}
                   className={`w-full p-4 rounded-2xl font-semibold text-left flex items-center justify-between border ${
                     selectedRoom.status === 'Available' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-stone-50 border-stone-100 text-stone-600 hover:bg-stone-100'
                   }`}
                 >
                   <span>SET AS AVAILABLE</span>
                   {selectedRoom.status === 'Available' && <CheckCircle2 size={16} />}
                 </button>
                 <button 
                   onClick={() => handleToggleRoomStatus(selectedRoom.id, 'Occupied')}
                   className={`w-full p-4 rounded-2xl font-semibold text-left flex items-center justify-between border ${
                     selectedRoom.status === 'Occupied' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-stone-50 border-stone-100 text-stone-600 hover:bg-stone-100'
                   }`}
                 >
                   <span>SET AS OCCUPIED (VIP ACTIVE)</span>
                   {selectedRoom.status === 'Occupied' && <CheckCircle2 size={16} />}
                 </button>
                 <button 
                   onClick={() => handleToggleRoomStatus(selectedRoom.id, 'Reserved')}
                   className={`w-full p-4 rounded-2xl font-semibold text-left flex items-center justify-between border ${
                     selectedRoom.status === 'Reserved' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-stone-50 border-stone-100 text-stone-600 hover:bg-stone-100'
                   }`}
                 >
                   <span>SET AS ADVANCED RESERVED</span>
                   {selectedRoom.status === 'Reserved' && <CheckCircle2 size={16} />}
                 </button>
              </div>

              <div className="mt-8 flex gap-3">
                 <button onClick={() => setSelectedRoom(null)} className="w-full py-4 bg-stone-900 text-white rounded-2xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-stone-900/10">CLOSE DIALOG</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Propose Signature Dish Modal */}
      <AnimatePresence>
        {showAddDishModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
              onClick={() => setShowAddDishModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-4 border border-amber-900/10 overflow-hidden"
            >
              <h3 className="text-2xl font-semibold text-stone-900 mb-2 font-display">Propose Chef Signature</h3>
              <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-6">Introduce high-end recipes to VIP menus</p>

              <form onSubmit={handleCreateSignature} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Signature Masterpiece Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Saffron-Roasted King Quail" 
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Gourmet Description & Sourcing</label>
                  <textarea 
                    placeholder="Describe wild sourcing, age, rare elements, plating designs..." 
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-medium text-sm h-24 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Course Placement</label>
                    <select 
                      value={newCourse} 
                      onChange={(e) => setNewCourse(e.target.value as any)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm text-stone-600"
                    >
                      <option value="Starter">Starter / Appetizer</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Dessert">Tasting Dessert</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Chef Sommelier</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Master Chef Ranveer" 
                      value={newChef}
                      onChange={(e) => setNewChef(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">VIP Base Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 2400" 
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Dietary Category</label>
                    <div className="flex gap-2 pt-1">
                       <button 
                         type="button" 
                         onClick={() => setNewIsVeg(true)}
                         className={`flex-1 py-3 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all border ${
                           newIsVeg ? 'bg-green-50 text-green-700 border-green-200' : 'bg-stone-50 border-stone-100 text-stone-400'
                         }`}
                       >
                         Vegan
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setNewIsVeg(false)}
                         className={`flex-1 py-3 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all border ${
                           !newIsVeg ? 'bg-red-50 text-red-700 border-red-200' : 'bg-stone-50 border-stone-100 text-stone-400'
                         }`}
                       >
                         Non-Veg
                       </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddDishModal(false)} className="flex-1 py-4 font-semibold text-stone-400 hover:bg-stone-50 rounded-2xl text-xs uppercase tracking-widest">DISCARD</button>
                  <button type="submit" className="flex-[2] py-4 bg-brand-primary text-brand-accent font-semibold rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20">CONFIRM RECOMMENDATION</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UtensCrossedIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m3 21 1.9-1.9a1 1 0 0 0 0-1.4L3 15.8m11-9.9v-2m4 4v-4m-12 11h2m-2-4h2m4-4h2" />
    <path d="M12 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2" />
    <path d="M18 12h.01M6 16v-4" />
  </svg>
);
