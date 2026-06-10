import React, { useState } from 'react';
import { 
  Coffee, 
  Plus, 
  Search, 
  Flame, 
  Timer, 
  Utensils, 
  TrendingUp, 
  Sliders, 
  Loader2,
  SlidersHorizontal,
  X,
  PlusCircle,
  TrendingDown,
  Sparkles,
  Award,
  ShoppingCart,
  Receipt,
  Printer,
  CreditCard,
  CheckCircle,
  ChevronRight,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateReceiptPDF } from '../../utils/pdfGenerator';

interface CafeItem {
  id: string;
  name: string;
  category: 'Specialty Beans' | 'Artisan Patisserie' | 'Cold Brew' | 'Signature Beverage';
  originOrType: string;
  price: number;
  stockCount: number;
  roastOrBakeTime: string;
  scoreOrAward: string;
  image: string;
}

const INITIAL_CAFE_ITEMS: CafeItem[] = [
  {
    id: 'C1',
    name: 'Panama Geisha Micro-Lot Beans',
    category: 'Specialty Beans',
    originOrType: 'Boquete, Panama (Light Roast)',
    price: 1850,
    stockCount: 15,
    roastOrBakeTime: 'Roast Date: May 28',
    scoreOrAward: 'SCA Score: 94.5',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop'
  },
  {
    id: 'C2',
    name: 'Artisan Golden Saffron Croissant',
    category: 'Artisan Patisserie',
    originOrType: '24-Hour Fermentation Sourdough',
    price: 380,
    stockCount: 8,
    roastOrBakeTime: 'Fresh Baked: 4:30 AM',
    scoreOrAward: 'A-Grade French Butter',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop'
  },
  {
    id: 'C3',
    name: 'Kyoto-Drip Nitro Cold Brew',
    category: 'Cold Brew',
    originOrType: '18-Hour Slow Cold Water Drip',
    price: 490,
    stockCount: 22,
    roastOrBakeTime: 'Brewing Temp: 3.5 °C',
    scoreOrAward: 'House Signature',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=400&fit=crop'
  },
  {
    id: 'C4',
    name: 'Smoked Madagascar Vanilla Latte',
    category: 'Signature Beverage',
    originOrType: 'Organic Espresso & Smoked Pod Extract',
    price: 450,
    stockCount: 50,
    roastOrBakeTime: 'Extraction Time: 26s',
    scoreOrAward: 'Gold Certified Vanilla',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=400&fit=crop'
  }
];

interface CartItem {
  item: CafeItem;
  quantity: number;
  milk: 'Whole Milk' | 'Almond' | 'Oat' | 'Soy' | 'None';
  sweetness: 'No Sweet' | 'Mid Sweet' | 'Elegant Sweet';
  notes: string;
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const CafeBakery: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'display' | 'billing'>('display');
  
  // Custom Barista Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [targetTable, setTargetTable] = useState('PDR Cabin #1');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [checkoutReceipt, setCheckoutReceipt] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Maison Guild Tab'>('UPI');

  // Brewing Equipment state
  const [activeBrew, setActiveBrew] = useState<{name: string, secondsLeft: number, isBrewing: boolean}>({
    name: 'Double-Shot Geisha Espresso',
    secondsLeft: 0,
    isBrewing: false
  });

  // Form states
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'Specialty Beans' | 'Artisan Patisserie' | 'Cold Brew' | 'Signature Beverage'>('Specialty Beans');
  const [newOrigin, setNewOrigin] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newScore, setNewScore] = useState('');

  const { data: items = [], isLoading } = useQuery<CafeItem[]>({
    queryKey: ['cafeItems'],
    queryFn: async () => {
      const response = await api.get('/cafebakery/items');
      return response.data.map((item: any) => ({ ...item, id: item._id }));
    }
  });

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.originOrType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartBrew = (brewName: string) => {
    setActiveBrew({ name: brewName, secondsLeft: 28, isBrewing: true });
    const interval = setInterval(() => {
      setActiveBrew(prev => {
        if (prev.secondsLeft <= 1) {
          clearInterval(interval);
          return { ...prev, secondsLeft: 0, isBrewing: false };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
  };

  const addCafeItemMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/cafebakery/items', data);
    },
    onSuccess: () => {
      toast.success('Cafe item added successfully');
      queryClient.invalidateQueries({ queryKey: ['cafeItems'] });
      setNewName('');
      setNewOrigin('');
      setNewPrice('');
      setNewStock('');
      setNewTime('');
      setNewScore('');
      setShowAddModal(false);
    },
    onError: () => toast.error('Failed to add cafe item')
  });

  const updateCafeStockMutation = useMutation({
    mutationFn: async ({ id, stockCount }: { id: string, stockCount: number }) => {
      await api.put(`/cafebakery/items/${id}/stock`, { stockCount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cafeItems'] });
    }
  });

  const checkoutCafeMutation = useMutation({
    mutationFn: async (cartData: any[]) => {
      await api.post('/cafebakery/checkout', { cart: cartData });
    },
    onSuccess: () => {
      toast.success('Cafe checkout successful');
      queryClient.invalidateQueries({ queryKey: ['cafeItems'] });
      setCart([]);
    },
    onError: () => toast.error('Failed to checkout cafe')
  });

  const handleSettleItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item && item.stockCount > 0) {
      updateCafeStockMutation.mutate({ id, stockCount: Math.max(0, item.stockCount - 1) });
    }
  };

  const handleAddArtisanItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newStock) return;

    addCafeItemMutation.mutate({
      name: newName,
      category: newCategory,
      originOrType: newOrigin || 'Gourmet Selection',
      price: Number(newPrice),
      stockCount: Number(newStock),
      roastOrBakeTime: newTime || 'Fresh Batch Scheduled',
      scoreOrAward: newScore || 'Premium Standard Verified',
      image: newCategory === 'Artisan Patisserie'
        ? 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop'
        : 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop'
    });
  };

  // Cart operations
  const addToCart = (product: CafeItem) => {
    const isBeverage = product.category === 'Signature Beverage' || product.category === 'Cold Brew';
    setCart(prev => {
      const existing = prev.find(item => item.item.id === product.id);
      if (existing) {
        return prev.map(item => item.item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        item: product,
        quantity: 1,
        milk: isBeverage ? 'Whole Milk' : 'None',
        sweetness: isBeverage ? 'Elegant Sweet' : 'No Sweet',
        notes: ''
      }];
    });
  };

  const removeOneFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.item.id !== productId);
    });
  };

  const updateCartModifier = (productId: string, field: 'milk' | 'sweetness' | 'notes', value: any) => {
    setCart(prev => prev.map(item => item.item.id === productId ? { ...item, [field]: value } : item));
  };

  const applyLoyaltyDiscount = () => {
    if (discountCode.toUpperCase() === 'MAISONVIP') {
      setAppliedDiscount(20); // 20% Privilege Discount
    } else if (discountCode.toUpperCase() === 'BREW10') {
      setAppliedDiscount(10);
    } else {
      setAppliedDiscount(0);
    }
  };

  // Compute values
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
  const discountAmount = Math.round(cartSubtotal * (appliedDiscount / 100));
  const serviceCharge = Math.round((cartSubtotal - discountAmount) * 0.10); // 10% luxurious silver service
  const cgst = Math.round((cartSubtotal - discountAmount) * 0.025); // 2.5% GST
  const sgst = Math.round((cartSubtotal - discountAmount) * 0.025); // 2.5% GST
  const cartTotal = cartSubtotal - discountAmount + serviceCharge + cgst + sgst;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    checkoutCafeMutation.mutate(cart);

    // Create virtual physical receipt
    const receipt = {
      invoiceNumber: 'MAISON-CF-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      table: targetTable,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      serviceCharge,
      cgst,
      sgst,
      total: cartTotal,
      payment: paymentMethod,
      barista: 'Somesh Roy (Senior Barista)'
    };

    setCheckoutReceipt(receipt);
  };

  return (
    <div className="px-8 pt-8 pb-0 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
      {/* Luxury Cafe Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-stone-900 to-stone-950 rounded-2xl border border-amber-900/40 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-brand-accent font-semibold text-xs uppercase tracking-[0.25em]">
            <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-ping" />
            Specialty Extraction & Patisserie Console
          </div>
          <h3 className="text-2xl font-semibold font-display text-white tracking-tight">Cafe & Patisserie</h3>
          <p className="text-sm text-stone-400 max-w-xl">
            Monitor real-time espresso extraction cycles, schedule craft pastry batches, and bill guests at the express barista POS.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 flex bg-stone-900 border border-stone-800 p-1 rounded-2xl">
          <button 
            type="button"
            onClick={() => setActiveTab('display')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === 'display' ? 'bg-brand-accent text-stone-950 shadow-md shadow-brand-accent/20' : 'text-stone-400 hover:text-white'}`}
          >
             Artisan Display
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === 'billing' ? 'bg-brand-accent text-stone-950 shadow-md shadow-brand-accent/20' : 'text-stone-400 hover:text-white'}`}
          >
             Barista POS Counter
          </button>
        </div>

        {/* Status Indicators */}
        <div className="relative z-10 flex flex-wrap gap-4">
          <div className="px-6 py-4 bg-stone-900/80 border border-stone-800 rounded-2xl flex items-center gap-3">
            <Timer className="text-amber-500" size={24} />
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Espresso Boiler Pressure</p>
              <p className="text-lg font-semibold text-white font-mono">9.2 Bar</p>
            </div>
          </div>
          <div className="px-6 py-4 bg-stone-900/80 border border-stone-800 rounded-2xl flex items-center gap-3">
            <Flame className="text-amber-500 animate-bounce" size={24} />
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Patisserie Oven Temp</p>
              <p className="text-lg font-semibold text-white font-mono">180 °C</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'display' ? (
          <motion.div 
            key="display"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Control Actions & Search */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-stone-200/60 shadow-soft">
              <div className="relative flex-1 w-full xl:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Specialty Beans', 'Artisan Patisserie', 'Cold Brew', 'Signature Beverage'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-widest transition-all ${
                      selectedCategory === cat 
                        ? 'bg-brand-primary text-brand-accent shadow-lg shadow-brand-primary/10' 
                        : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <div className="h-6 w-[1px] bg-stone-200 mx-2 hidden xl:block" />
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-brand-accent text-stone-950 font-semibold rounded-2xl text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-brand-accent/25"
                >
                  <Plus size={16} strokeWidth={3} />
                  Bake / Roast Item
                </button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Specialty Listing */}
              <div className="xl:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start content-start">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-stone-200/80 shadow-soft overflow-hidden group hover:border-brand-accent/60 transition-all flex flex-col h-fit"
                    >
                      <div className="h-40 relative overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                        <span className="absolute top-4 left-4 px-3 py-1 bg-brand-primary text-brand-accent border border-amber-950/20 rounded-xl text-[10px] font-semibold uppercase tracking-widest">
                          {item.category}
                        </span>
                        <span className="absolute top-4 right-4 bg-amber-500/10 text-brand-accent px-3 py-1 rounded-xl text-[10px] font-semibold uppercase tracking-widest border border-amber-500/20 flex items-center gap-1">
                          <Award size={10} />
                          {item.scoreOrAward}
                        </span>
                        <div className="absolute bottom-4 left-6 right-6">
                          <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-1">{item.roastOrBakeTime}</p>
                          <h4 className="text-xl font-semibold text-white">{item.name}</h4>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <p className="text-[10.5px] font-semibold text-stone-500 uppercase tracking-wide leading-relaxed mb-4">
                            {item.originOrType}
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-stone-50 rounded-2xl text-center">
                              <p className="text-[8px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Stock Level</p>
                              <p className="text-xs font-semibold text-stone-800">{item.stockCount} Units</p>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-2xl text-center">
                              <p className="text-[8px] font-semibold text-stone-400 uppercase tracking-wider mb-1">State</p>
                              <p className={`text-xs font-semibold ${item.stockCount <= 5 ? 'text-brand-danger animate-pulse' : 'text-brand-success'}`}>
                                 {item.stockCount <= 5 ? 'Restock Req' : 'Optimized'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                          <div>
                            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">List Price</p>
                            <p className="text-2xl font-semibold text-brand-primary font-display">₹{item.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.category.includes('Beans') || item.category.includes('Beverage') ? (
                              <button 
                                onClick={() => handleStartBrew(item.name)}
                                disabled={activeBrew.isBrewing || item.stockCount <= 0}
                                className="px-4 py-3 bg-brand-primary text-brand-accent hover:opacity-90 disabled:opacity-40 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all"
                              >
                                Extract Shot
                              </button>
                            ) : null}
                            <button 
                              onClick={() => handleSettleItem(item.id)}
                              disabled={item.stockCount <= 0}
                              className="px-4 py-3 bg-amber-500/10 border border-amber-500/20 text-brand-primary hover:bg-amber-100 disabled:opacity-40 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all"
                            >
                              Sell / Dispatch
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Brewing Timers & Lab Equipment status */}
              <div className="space-y-6">
                <div className="bg-stone-950 p-5 rounded-2xl border border-amber-950 text-white space-y-6 shadow-xl relative overflow-hidden">
                  <h5 className="text-[10px] font-semibold text-brand-accent uppercase tracking-[0.25em] mb-4">Gourmet Extraction Lab</h5>
                  
                  {activeBrew.isBrewing ? (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <div>
                             <p className="text-[10px] font-semibold text-brand-accent uppercase tracking-widest">Active Extract</p>
                             <p className="text-sm font-semibold text-stone-200 mt-1">{activeBrew.name}</p>
                          </div>
                          <Loader2 className="text-brand-accent animate-spin" size={24} />
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10.5px] font-mono">
                             <span className="text-stone-500 font-semibold uppercase">Time remaining</span>
                             <span className="text-brand-accent font-semibold">{activeBrew.secondsLeft}s</span>
                          </div>
                          <div className="h-2 bg-stone-900 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-brand-accent transition-all duration-1000" 
                               style={{ width: `${(activeBrew.secondsLeft / 28) * 100}%` }}
                             />
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center border-2 border-dashed border-stone-800 rounded-2xl text-xs text-stone-500 italic">
                       Espresso group heads calibrated & idle. Ready to extract micro-lot coffees.
                    </div>
                  )}

                  <div className="pt-6 border-t border-stone-900">
                    <h5 className="text-[10px] font-semibold text-brand-accent uppercase tracking-[0.25em] mb-4">Patisserie Batching</h5>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-stone-900/50 p-4 rounded-2xl border border-stone-800">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
                          <span className="text-xs text-stone-300 font-semibold">Golden Croissants Batch B</span>
                        </div>
                        <span className="text-[10px] bg-amber-500/15 text-brand-accent border border-amber-500/10 px-2.5 py-1 rounded-xl uppercase font-semibold tracking-widest font-mono">Baked Now</span>
                      </div>
                      <div className="flex justify-between items-center bg-stone-900/50 p-4 rounded-2xl border border-stone-800">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-stone-600" />
                          <span className="text-xs text-stone-400 font-semibold">Sourdough Loaf Batch E</span>
                        </div>
                        <span className="text-[10px] bg-stone-800 text-stone-500 border border-stone-700 px-2.5 py-1 rounded-xl uppercase font-semibold tracking-widest font-mono">4:30 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Luxury Quality Seal */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-soft space-y-6">
                  <h5 className="text-xs font-semibold text-stone-400 uppercase tracking-[0.25em] flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-500" />
                    SCA Certified Workspace
                  </h5>
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100">
                    <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                      The water filter configuration must be manually flushed. Water mineral count is currently optimized at <span className="text-brand-accent font-semibold">140 ppm</span> to perfectly complement Geisha fruity notes.
                    </p>
                  </div>
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
            {/* Left Column: Premium Cafe Menu items layout for POS selection (7 cols) */}
            <div className="xl:col-span-7 space-y-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200/80">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Select Menu Offerings</span>
                <span className="text-xs font-semibold text-brand-primary">{items.length} artisan SKUs loaded</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    disabled={item.stockCount <= 0}
                    className="p-4 bg-white rounded-2xl border border-stone-200/80 hover:border-brand-accent text-left group flex items-start gap-4 transition-all disabled:opacity-55 cursor-pointer relative"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-100/60 overflow-hidden flex-shrink-0 relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                      {item.stockCount <= 5 && item.stockCount > 0 && (
                        <span className="absolute bottom-1 left-1 right-1 text-center text-[7px] font-semibold bg-rose-500 text-white rounded uppercase tracking-wider">
                           Low stock
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-500 rounded text-[8px] font-semibold uppercase tracking-widest">
                        {item.category}
                      </span>
                      <h5 className="text-sm font-semibold text-stone-900 group-hover:text-brand-primary transition-colors truncate">{item.name}</h5>
                      <p className="text-[10px] text-stone-400 font-semibold truncate">{item.originOrType}</p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-semibold text-stone-950 font-mono">₹{item.price.toLocaleString()}</span>
                        <span className="text-[9px] font-semibold text-brand-accent uppercase tracking-wider group-hover:underline">Add to docket +</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Dynamic Order Station Cart, modifiers and elegant receipt generator (5 cols) */}
            <div className="xl:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-soft p-5 space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="text-brand-accent" size={18} />
                    <h4 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">Active Billing Docket</h4>
                  </div>
                  <button 
                    onClick={() => setCart([])}
                    disabled={cart.length === 0}
                    className="text-[10px] font-semibold text-stone-400 hover:text-stone-950 uppercase tracking-widest disabled:opacity-40"
                  >
                    Clear Docket
                  </button>
                </div>

                {/* Cart Body */}
                {cart.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl bg-stone-50/50 border border-dashed border-stone-150 p-4 flex flex-col items-center gap-3">
                    <Coffee className="text-stone-300 animate-pulse" size={40} />
                    <div>
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">No Active Brews or Patisseries</p>
                      <p className="text-[11px] text-stone-400 mt-1 max-w-[240px]">Select any premium brew or delicacy from the menu to activate the tax transaction form.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                    {cart.map((cartItem) => {
                      const isBeverage = cartItem.item.category.includes('Beverage') || cartItem.item.category.includes('Cold Brew');
                      return (
                        <div key={cartItem.item.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-150 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold text-stone-900">{cartItem.item.name}</p>
                              <p className="text-[10px] text-stone-400 font-mono">₹{cartItem.item.price} each</p>
                            </div>
                            
                            <div className="flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                              <button 
                                onClick={() => removeOneFromCart(cartItem.item.id)}
                                className="px-2.5 py-1 text-xs font-semibold text-stone-500 hover:bg-stone-50"
                              >
                                -
                              </button>
                              <span className="px-3 text-xs font-semibold text-stone-800 font-mono">{cartItem.quantity}</span>
                              <button 
                                onClick={() => addToCart(cartItem.item)}
                                className="px-2.5 py-1 text-xs font-semibold text-stone-500 hover:bg-stone-50"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Modifiers (Only for Drinks) */}
                          {isBeverage && (
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/60">
                              <div>
                                <label className="text-[8px] font-semibold text-stone-400 uppercase tracking-widest block mb-1">Milk Choice</label>
                                <select
                                  value={cartItem.milk}
                                  onChange={(e: any) => updateCartModifier(cartItem.item.id, 'milk', e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-[10px] font-semibold text-stone-700 focus:outline-none"
                                >
                                  <option value="Whole Milk">Whole Milk</option>
                                  <option value="Almond">Almond (+₹40)</option>
                                  <option value="Oat">Oat Milk (+₹50)</option>
                                  <option value="Soy">Soy Milk (+₹35)</option>
                                  <option value="None">No Milk / Black</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[8px] font-semibold text-stone-400 uppercase tracking-widest block mb-1">Sweetness</label>
                                <select
                                  value={cartItem.sweetness}
                                  onChange={(e: any) => updateCartModifier(cartItem.item.id, 'sweetness', e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-[10px] font-semibold text-stone-700 focus:outline-none"
                                >
                                  <option value="Elegant Sweet">Maison (Standard)</option>
                                  <option value="No Sweet">Sugar Free</option>
                                  <option value="Mid Sweet">Demerara Half-Sweet</option>
                                </select>
                              </div>
                            </div>
                          )}

                          <input 
                            type="text" 
                            placeholder="Add customized barista remarks..."
                            value={cartItem.notes}
                            onChange={(e) => updateCartModifier(cartItem.item.id, 'notes', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-[9.5px] font-medium text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-accent/30"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Logistics Configuration (Seating & Table) */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest px-1">Cabin / Seating Destination</label>
                      <select 
                        value={targetTable}
                        onChange={(e) => setTargetTable(e.target.value)}
                        className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                      >
                        <option value="PDR Cabin #1">PDR Cabin #1 (Exclusive)</option>
                        <option value="Lounge Salon A">Lounge Salon A</option>
                        <option value="Terrace Garden Table #4">Terrace Garden Table #4</option>
                        <option value="Poolside Cabana VIP">Poolside Cabana VIP</option>
                        <option value="Takeaway Express">Takeaway Express</option>
                      </select>
                    </div>

                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest px-1">Tender Payment</label>
                      <select 
                        value={paymentMethod}
                        onChange={(e: any) => setPaymentMethod(e.target.value)}
                        className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                      >
                        <option value="UPI">Instant UPI (Paytm / BHIM)</option>
                        <option value="Card">Visa / Amex Metallic</option>
                        <option value="Maison Guild Tab">Maison Membership Ledger</option>
                      </select>
                    </div>
                  </div>

                  {/* Loyalty Discount Voucher */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Membership Key (e.g., MAISONVIP)"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold uppercase tracking-widest"
                    />
                    <button 
                      type="button" 
                      onClick={applyLoyaltyDiscount}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-brand-accent text-[10px] font-semibold uppercase tracking-wider rounded-xl transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedDiscount > 0 && (
                     <p className="text-[10px] text-brand-success font-semibold uppercase tracking-widest">✓ Member Promo Code Approved: {appliedDiscount}% Fine Dining Privilege discount applied.</p>
                  )}
                </div>

                {/* Ledger Details */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-150 space-y-2">
                  <div className="flex justify-between items-center text-xs text-stone-500 font-semibold">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{cartSubtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs text-brand-danger font-semibold">
                      <span>Voucher discount ({appliedDiscount}%)</span>
                      <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs text-stone-400 font-medium">
                    <span>Maison Silver-Service Charge (10%)</span>
                    <span className="font-mono">₹{serviceCharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-400 font-medium">
                    <span>SGST (2.5%)</span>
                    <span className="font-mono">₹{sgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-400 font-medium">
                    <span>CGST (2.5%)</span>
                    <span className="font-mono">₹{cgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-stone-900 font-semibold border-t border-stone-200/80 pt-2">
                    <span>Grand Luxury Total</span>
                    <span className="text-lg font-semibold text-brand-primary font-display">₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Execute Checkout Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-4 bg-brand-primary text-brand-accent font-semibold rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/10 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  Generate Tax Invoice & Checkout
                </button>
              </div>

              {/* Physical Thermal Receipt View */}
              {checkoutReceipt && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-stone-50 p-4 rounded-[32px] border border-dashed border-stone-300 shadow-soft relative overflow-hidden"
                >
                  {/* Circle cutouts for receipt effect */}
                  <div className="absolute top-0 left-0 right-0 flex justify-between px-4 -translate-y-1">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-white rounded-full" />
                    ))}
                  </div>

                  <div className="pt-4 text-center">
                     <p className="text-xs font-semibold text-stone-900 uppercase tracking-[0.2em] font-display">THE MAISON DE LUXE</p>
                     <p className="text-[8px] text-stone-400 uppercase tracking-widest font-semibold font-mono">Artisan Coffee & Patisserie Extraction</p>
                     <p className="text-[9px] text-stone-400 font-medium mt-1">SCA Cellar Suite #01, New Delhi</p>
                  </div>

                  <div className="space-y-4 pt-6 border-b border-dashed border-stone-200 pb-4 text-xs">
                    <div className="flex justify-between font-mono text-[9.5px]">
                      <span className="text-stone-400 font-semibold uppercase">Docket Id:</span>
                      <span className="text-stone-800 font-semibold">{checkoutReceipt.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[9.5px]">
                      <span className="text-stone-400 font-semibold uppercase">Timestamp:</span>
                      <span className="text-stone-800 font-semibold">{checkoutReceipt.timestamp}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[9.5px]">
                      <span className="text-stone-400 font-semibold uppercase">Assigned Cabin:</span>
                      <span className="text-stone-800 font-semibold">{checkoutReceipt.table}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[9.5px]">
                      <span className="text-stone-400 font-semibold uppercase">Cashier Hand:</span>
                      <span className="text-stone-800 font-medium">{checkoutReceipt.barista}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="py-4 border-b border-dashed border-stone-200 font-mono text-xs space-y-3">
                    {checkoutReceipt.items.map((cartItem: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-semibold text-stone-900">
                          <span>{cartItem.item.name} (x{cartItem.quantity})</span>
                          <span>₹{(cartItem.item.price * cartItem.quantity).toLocaleString()}</span>
                        </div>
                        {cartItem.milk !== 'None' && (
                          <div className="flex justify-between text-[8.5px] text-stone-400 italic">
                            <span>↳ Modifier: {cartItem.milk} / {cartItem.sweetness}</span>
                          </div>
                        )}
                        {cartItem.notes && (
                          <p className="text-[8px] text-stone-500 font-semibold">↳ Remarks: "{cartItem.notes}"</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Receipt Pricing details */}
                  <div className="py-4 font-mono text-xs space-y-1.5 text-stone-600 border-b border-dashed border-stone-200">
                     <div className="flex justify-between text-[10px]">
                        <span>DOCKET SUB-TOTAL</span>
                        <span>₹{checkoutReceipt.subtotal.toLocaleString()}</span>
                     </div>
                     {checkoutReceipt.discount > 0 && (
                       <div className="flex justify-between text-[10px] text-red-600">
                          <span>PRIVILEGE DISCOUNT</span>
                          <span>-₹{checkoutReceipt.discount.toLocaleString()}</span>
                       </div>
                     )}
                     <div className="flex justify-between text-[10px]">
                        <span>SILVER SERVICE (10%)</span>
                        <span>₹{checkoutReceipt.serviceCharge.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-[10px]">
                        <span>CGST (2.5%)</span>
                        <span>₹{checkoutReceipt.cgst.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-[10px]">
                        <span>SGST (2.5%)</span>
                        <span>₹{checkoutReceipt.sgst.toLocaleString()}</span>
                     </div>
                  </div>

                  {/* Receipt Total */}
                  <div className="pt-4 text-center font-mono space-y-3">
                     <div className="flex justify-between text-stone-900 font-semibold text-sm">
                        <span>GRAND INVOICE TOTAL</span>
                        <span>₹{checkoutReceipt.total.toLocaleString()}</span>
                     </div>
                     
                     <div className="p-3 bg-stone-900 text-brand-accent rounded-xl text-[9px] font-semibold uppercase tracking-widest font-sans flex items-center justify-center gap-1.5 shadow">
                        <CheckCircle size={12} />
                        TENDERED COMPLETED VIA {checkoutReceipt.payment}
                     </div>

                     <div className="grid grid-cols-2 gap-2 mt-4">
                       <button 
                         onClick={() => window.print()}
                         className="px-3 py-2.5 bg-stone-200 border border-stone-300 text-stone-600 hover:text-stone-900 rounded-xl text-[9.5px] font-sans font-semibold uppercase tracking-widest transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98 transition-all"
                       >
                         <Printer size={12} />
                         Print Receipt
                       </button>
                       <button 
                         onClick={() => {
                           generateReceiptPDF({
                             title: "Maison Cafe & Patisserie",
                             invoiceNumber: checkoutReceipt.invoiceNumber,
                             timestamp: checkoutReceipt.timestamp,
                             tableName: checkoutReceipt.table,
                             items: checkoutReceipt.items.map((cartItem: any) => ({
                               name: `${cartItem.item.name} (${cartItem.milk})`,
                               price: cartItem.item.price,
                               quantity: cartItem.quantity
                             })),
                             subtotal: checkoutReceipt.subtotal,
                             tax: checkoutReceipt.cgst + checkoutReceipt.sgst,
                             discount: checkoutReceipt.discount,
                             total: checkoutReceipt.total,
                             paymentMethod: checkoutReceipt.payment
                           });
                         }}
                         className="px-3 py-2.5 bg-brand-primary text-brand-accent rounded-xl text-[9.5px] font-sans font-semibold uppercase tracking-widest transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-brand-primary/10 hover:scale-102 active:scale-98 transition-all"
                       >
                         <FileText size={12} />
                         Download PDF
                       </button>
                     </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bake Roast Item Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-4 border border-amber-900/10 overflow-hidden"
            >
              <h3 className="text-2xl font-semibold text-stone-900 mb-2 font-display">Bake or Roast Item</h3>
              <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-6">Catalog hand-roasted coffee beans or fresh-baked patisseries</p>

              <form onSubmit={handleAddArtisanItem} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Artisan Item Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ethiopia Guji Sidamo Coffee G1" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Label Category</label>
                    <select 
                      value={newCategory} 
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm text-stone-600"
                    >
                      <option value="Specialty Beans">Specialty Beans</option>
                      <option value="Artisan Patisserie">Artisan Patisserie</option>
                      <option value="Cold Brew">Cold Brew</option>
                      <option value="Signature Beverage">Signature Beverage</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Certified Grade / Score</label>
                    <input 
                      type="text" 
                      placeholder="e.g. SCA Score: 92 or Sourdough Loaf" 
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Unit Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 550" 
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Starting Stock</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 10" 
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Roast / Bake Schedule</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Fresh Baked: 5:00 AM or Roast Date: June 1st" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Origin Detail / Bean Ferment</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sidamo, Ethiopia (Honey Processed)" 
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-semibold text-stone-400 hover:bg-stone-50 rounded-2xl text-xs uppercase tracking-widest">DISCARD</button>
                  <button type="submit" className="flex-[2] py-4 bg-brand-primary text-brand-accent font-semibold rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20">PROVISION ARTISAN BATCH</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
