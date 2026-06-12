import React, { useState } from 'react';
import { 
  Wine, 
  Plus, 
  Search, 
  TrendingUp, 
  Sliders, 
  GlassWater, 
  Check, 
  X, 
  Droplet, 
  Thermometer,
  ShieldCheck,
  DollarSign,
  ShoppingCart,
  Sparkles,
  Printer,
  CheckCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateReceiptPDF } from '../../utils/pdfGenerator';

interface LiquorItem {
  id: string;
  name: string;
  vintage: string;
  category: 'Single Malt' | 'Vintage Wine' | 'Cognac' | 'Craft Cocktail';
  alcoholContent: string;
  pricePerGlass: number;
  stockBottles: number;
  capacityMl: number;
  origin: string;
  image: string;
}

const INITIAL_BAR_ITEMS: LiquorItem[] = [
  {
    id: 'B1',
    name: 'Macallan Sherry Oak 18 Y.O.',
    vintage: '18 Years Aged',
    category: 'Single Malt',
    alcoholContent: '43%',
    pricePerGlass: 1850,
    stockBottles: 8,
    capacityMl: 700,
    origin: 'Speyside, Scotland',
    image: 'https://images.unsplash.com/photo-1527551329241-118ff867fc4d?w=400&h=400&fit=crop'
  },
  {
    id: 'B2',
    name: 'Dom Pérignon Vintage Brut',
    vintage: 'Vintage 2012',
    category: 'Vintage Wine',
    alcoholContent: '12.5%',
    pricePerGlass: 4200,
    stockBottles: 14,
    capacityMl: 750,
    origin: 'Champagne, France',
    image: 'https://images.unsplash.com/photo-1594487767123-c6e7a2cf9481?w=400&h=400&fit=crop'
  },
  {
    id: 'B3',
    name: 'Château Margaux Premier Grand Cru',
    vintage: 'Vintage 2015',
    category: 'Vintage Wine',
    alcoholContent: '13.5%',
    pricePerGlass: 5500,
    stockBottles: 6,
    capacityMl: 750,
    origin: 'Bordeaux, France',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop'
  },
  {
    id: 'B4',
    name: 'Remy Martin Louis XIII Cognac',
    vintage: 'Grande Champagne Reserve',
    category: 'Cognac',
    alcoholContent: '40%',
    pricePerGlass: 8500,
    stockBottles: 3,
    capacityMl: 700,
    origin: 'Cognac, France',
    image: 'https://images.unsplash.com/photo-1569529465841-dfedd87500f7?w=400&h=400&fit=crop'
  },
  {
    id: 'B5',
    name: 'Royal Saffron Sazerac',
    vintage: 'Maison Special Mix',
    category: 'Craft Cocktail',
    alcoholContent: '18%',
    pricePerGlass: 850,
    stockBottles: 24,
    capacityMl: 250,
    origin: 'Maison In-House',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop'
  },
  {
    id: 'B6',
    name: 'Yamazaki Single Malt Whiskey',
    vintage: '12 Years Aged',
    category: 'Single Malt',
    alcoholContent: '45%',
    pricePerGlass: 2600,
    stockBottles: 5,
    capacityMl: 700,
    origin: 'Osaka Prefecture, Japan',
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d5?w=400&h=400&fit=crop'
  },
  {
    id: 'B7',
    name: 'Gran Patrón Burdeos Anejo Tequila',
    vintage: 'Finest Handcrafted',
    category: 'Craft Cocktail',
    alcoholContent: '40%',
    pricePerGlass: 3400,
    stockBottles: 7,
    capacityMl: 750,
    origin: 'Jalisco, Mexico',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=400&fit=crop'
  }
];

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';




export const BarLounge: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [dispenseLog, setDispenseLog] = useState<{name: string, timestamp: string, tables: string}[]>([]);

  // Tab View state
  const [activeTab, setActiveTab] = useState<'display' | 'billing'>('display');

  // Billing states
  const [cart, setCart] = useState<{ item: LiquorItem; quantity: number; mixer: string; pourSize: string; notes: string }[]>([]);

  const [targetTable, setTargetTable] = useState<string>('Main Salon Table #12');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Online'>('Cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [checkoutReceipt, setCheckoutReceipt] = useState<any>(null);

  // Helper calculations
  const getItemPrice = (cartItem: any) => {
    if (cartItem.pourSize === 'Double') return cartItem.item.pricePerGlass * 1.8;
    if (cartItem.pourSize === 'Full Bottle') return cartItem.item.pricePerGlass * 6; // Rough estimate
    return cartItem.item.pricePerGlass;
  };


  // Cart actions
  const addToCart = (item: LiquorItem) => {
    const existing = cart.find(c => c.item.id === item.id && c.pourSize === 'Standard' && c.mixer === 'Neat');
    if (existing) {
      setCart(cart.map(c => c === existing ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { item, quantity: 1, pourSize: 'Standard', mixer: 'Neat', notes: '' }]);
    }
  };

  const removeOneFromCart = (id: string) => {
    const existing = cart.find(c => c.item.id === id);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(c => c.item.id === id ? { ...c, quantity: c.quantity - 1 } : c));
    } else {
      setCart(cart.filter(c => c.item.id !== id));
    }
  };

  const updateCartModifier = (id: string, field: string, value: string) => {
    setCart(cart.map(c => c.item.id === id ? { ...c, [field]: value } : c));
  };

  const applyLoyaltyDiscount = () => {
    if (discountCode === 'GUILD20') {
      setAppliedDiscount(0.20);
      toast.success('20% Guild Discount Applied');
    } else {
      setAppliedDiscount(0);
      toast.error('Invalid Guild Code');
    }
  };

  // Form states to add custom bottle
  const [newName, setNewName] = useState('');
  const [newVintage, setNewVintage] = useState('');
  const [newCategory, setNewCategory] = useState<'Single Malt' | 'Vintage Wine' | 'Cognac' | 'Craft Cocktail'>('Single Malt');
  const [newAbv, setNewAbv] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newStock, setNewStock] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newCapacity, setNewCapacity] = useState('750');

  const { data: items = [], isLoading } = useQuery<LiquorItem[]>({
    queryKey: ['liquorItems'],
    queryFn: async () => {
      const response = await api.get('/barlounge/liquor');
      return response.data.map((item: any) => ({ ...item, id: item._id }));
    }
  });

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.origin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  
  const updateBarItemMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.put(`/barlounge/liquor/${data.id}`, data);
    },
    onSuccess: () => {
      toast.success('Liquor item updated successfully');
      queryClient.invalidateQueries({ queryKey: ['liquorItems'] });
      setEditingItem(null);
    },
    onError: () => toast.error('Failed to update liquor item')
  });

  const deleteBarItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/barlounge/liquor/${id}`);
    },
    onSuccess: () => {
      toast.success('Liquor item deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['liquorItems'] });
      setDeletingItem(null);
    },
    onError: () => toast.error('Failed to delete liquor item')
  });

  const [editingItem, setEditingItem] = useState<LiquorItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let uploadedImageUrl = '';
    if (newImageFile) {
      const uploadData = new FormData();
      uploadData.append('image', newImageFile);
      try {
        const uploadRes = await api.post('/upload/image', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
        uploadedImageUrl = uploadRes.data.url;
      } catch (e) {
        console.error('Upload failed', e);
      }
    }

    updateBarItemMutation.mutate({
      id: editingItem.id,
      name: newName,
      vintage: newVintage,
      category: newCategory,
      alcoholContent: newAbv,
      pricePerGlass: Number(newPrice),
      stockBottles: Number(newStock),
      capacityMl: Number(newCapacity),
      origin: newOrigin,
      image: editingItem.image
    });
  };

  const openEditModal = (item: LiquorItem) => {
    setEditingItem(item);
    setNewName(item.name);
    setNewVintage(item.vintage);
    setNewCategory(item.category);
    setNewAbv(item.alcoholContent);
    setNewPrice(item.pricePerGlass.toString());
    setNewStock(item.stockBottles.toString());
    setNewCapacity(item.capacityMl.toString());
    setNewOrigin(item.origin);
  };

  const addLiquorMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/barlounge/liquor', data);
    },
    onSuccess: () => {
      toast.success('Liquor item added successfully');
      queryClient.invalidateQueries({ queryKey: ['liquorItems'] });
      setNewName('');
      setNewVintage('');
      setNewAbv('');
      setNewPrice('');
    setNewImage('');
      setNewStock('');
      setNewOrigin('');
      setNewCapacity('750');
      setShowAddModal(false);
    },
    onError: () => toast.error('Failed to add liquor item')
  });

  
  const suiteFeeAmount = 0;
  
  const liquorSubtotal = cart.reduce((total, cartItem) => total + (getItemPrice(cartItem) * cartItem.quantity), 0);
  const cartSubtotal = liquorSubtotal + suiteFeeAmount;
  const discountAmount = appliedDiscount * cartSubtotal;
  const serviceCharge = (cartSubtotal - discountAmount) * 0.10;
  const cgst = (cartSubtotal - discountAmount) * 0.09;
  const sgst = (cartSubtotal - discountAmount) * 0.09;
  const cartTotal = cartSubtotal - discountAmount + serviceCharge + cgst + sgst;

  const dispenseGlassMutation = useMutation({
    mutationFn: async ({ id, stockBottles }: { id: string, stockBottles: number }) => {
      await api.put(`/barlounge/liquor/${id}/stock`, { stockBottles });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liquorItems'] });
    }
  });

  const checkoutBarMutation = useMutation({
    mutationFn: async (cartData: any[]) => {
      await api.post('/barlounge/checkout', { cart: cartData });
    },
    onSuccess: () => {
      toast.success('Bar checkout successful');
      queryClient.invalidateQueries({ queryKey: ['liquorItems'] });
      setCart([]);
    },
    onError: () => toast.error('Failed to checkout')
  });

  // Sommelier Manual Pour Dispense Handler
  const handleDispenseGlass = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item && item.stockBottles > 0) {
      const logEntry = {
        name: item.name,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        tables: `Table #${Math.floor(Math.random() * 8) + 1}`
      };
      setDispenseLog(prevLog => [logEntry, ...prevLog.slice(0, 9)]);
      
      const isBottleFinished = Math.random() > 0.8; 
      if (isBottleFinished) {
        dispenseGlassMutation.mutate({ id, stockBottles: Math.max(0, item.stockBottles - 1) });
      }
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    checkoutBarMutation.mutate(cart);

    // Generate Invoice receipt
    const invoiceNum = 'MSN-BAR-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString();

    setCheckoutReceipt({
      invoiceNumber: invoiceNum,
      timestamp: dateStr,
      items: [...cart],
      suiteFee: suiteFeeAmount,
      suiteName: '',
      subtotal: cartSubtotal,
      discount: discountAmount,
      serviceCharge,
      cgst,
      sgst,
      total: cartTotal,
      table: targetTable,
      payment: paymentMethod,
      mixologist: 'Alba Thorne (Head Sommelier)'
    });
  };

  const handleAddLiquor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newStock) return;

    let uploadedImageUrl = '';
    if (newImageFile) {
      const uploadData = new FormData();
      uploadData.append('image', newImageFile);
      try {
        const uploadRes = await api.post('/upload/image', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
        uploadedImageUrl = uploadRes.data.url;
      } catch (e) {
        console.error('Upload failed', e);
      }
    }


    addLiquorMutation.mutate({
      name: newName,
      vintage: newVintage || 'Premium Reserve',
      category: newCategory,
      alcoholContent: newAbv || '40%',
      pricePerGlass: Number(newPrice),
      stockBottles: Number(newStock),
      capacityMl: Number(newCapacity) || 750,
      origin: newOrigin || 'Exclusive Import',
      image: uploadedImageUrl || (newImage && newImage.startsWith('blob:') ? null : newImage) || (newCategory === 'Vintage Wine' ? 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=400&fit=crop' : 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop')
    });
  };

  return (
    <div className="px-8 pt-8 pb-0 space-y-8 max-w-[1700px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
      
      {/* Golden Luxury Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 rounded-2xl border border-amber-900/40 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-brand-accent font-semibold text-xs uppercase tracking-[0.25em]">
            <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-ping" />
            SOMMELIER & MIXOLOGY SUITE
          </div>
          <h3 className="text-2xl font-semibold font-display text-white tracking-tight">Bar Cellar & Lounge</h3>
          <p className="text-sm text-stone-400 max-w-xl">
            Authorize state-of-the-art climate monitors, audit luxury pours, and coordinate premium wine, cognac, single malt, & signature cocktails dockets.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="relative z-10 flex flex-wrap gap-4">
          <div className="px-6 py-4 bg-stone-900/80 border border-stone-850 rounded-2xl flex items-center gap-3">
            <Thermometer className="text-amber-500 animate-pulse" size={24} />
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Wine Cellar Temp</p>
              <p className="text-lg font-semibold text-white font-mono">11.8 °C</p>
            </div>
          </div>
          <div className="px-6 py-4 bg-stone-900/80 border border-stone-850 rounded-2xl flex items-center gap-3">
            <Droplet className="text-blue-400" size={24} />
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Cellar Humidity</p>
              <p className="text-lg font-semibold text-white font-mono">68.5 %</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Luxury Tab Switcher */}
      <div className="flex border-b border-stone-200/80">
        <button
          onClick={() => setActiveTab('display')}
          className={`px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all relative cursor-pointer ${
            activeTab === 'display' ? 'text-amber-600 font-extrabold' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          Sommelier Vault
          {activeTab === 'display' && (
            <motion.div layoutId="barActiveLine" className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all relative cursor-pointer ${
            activeTab === 'billing' ? 'text-amber-600 font-extrabold' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          Lounge Billing Counter
          {activeTab === 'billing' && (
            <motion.div layoutId="barActiveLine" className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-500 rounded-full" />
          )}
        </button>

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
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 font-medium text-stone-800"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Single Malt', 'Vintage Wine', 'Cognac', 'Craft Cocktail'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 font-extrabold' 
                        : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <div className="h-6 w-[1px] bg-stone-200 mx-2 hidden xl:block" />
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-stone-900 border border-amber-500/20 text-brand-accent font-semibold rounded-2xl text-xs uppercase tracking-widest hover:bg-stone-850 active:scale-95 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Plus size={16} strokeWidth={3} />
                  Acquire Vintage Bottle
                </button>
              </div>
            </div>

            {/* Main Bar Items & Logs Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Liquor Cards list */}
              <div className="xl:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start content-start">
                  <AnimatePresence>
                    {filteredItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl border border-stone-200/80 shadow-soft overflow-hidden group hover:border-amber-500/60 transition-all flex flex-col h-fit"
                      >
                        <div className="h-40 relative overflow-hidden">
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop'} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                          <span className="absolute top-4 left-4 px-3 py-1 bg-stone-950 text-brand-accent rounded-xl text-[10px] font-semibold uppercase tracking-widest border border-amber-500/20">
                            {item.category}
                          </span>
                          <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-semibold text-white uppercase tracking-widest font-mono">
                            {item.alcoholContent} ABV
                          </span>
                          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                            <div>
                              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-1">{item.vintage}</p>
                              <h4 className="text-xl font-semibold text-white tracking-tight leading-tight">{item.name}</h4>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-6">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-stone-50 rounded-2xl text-center border border-stone-100">
                              <p className="text-[8px] font-semibold text-stone-400 uppercase tracking-wider mb-1">State</p>
                              <p className="text-xs font-semibold text-emerald-600 uppercase font-mono">Climate Ok</p>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-2xl text-center border border-stone-100">
                              <p className="text-[8px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Stock</p>
                              <p className="text-xs font-semibold text-stone-800">{item.stockBottles} btl.</p>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-2xl text-center border border-stone-100">
                              <p className="text-[8px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Vol / Size</p>
                              <p className="text-xs font-semibold text-stone-800">{item.capacityMl} ml</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                            <div>
                              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Est Glass Pour</p>
                              <p className="text-2xl font-semibold text-stone-950 font-display">₹{item.pricePerGlass.toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => addToCart(item)}
                                className="p-3 bg-stone-50 border border-stone-200 hover:border-amber-500 rounded-xl text-stone-600 hover:text-amber-500 transition-all cursor-pointer"
                                title="Add to Active POS Ticket"
                              >
                                <ShoppingCart size={16} />
                              </button>
                              <button 
                                onClick={() => handleDispenseGlass(item.id)}
                                disabled={item.stockBottles <= 0}
                                className="px-5 py-3 bg-stone-900 border border-amber-500/20 text-brand-accent hover:bg-stone-850 disabled:opacity-40 text-xs font-semibold uppercase tracking-widest rounded-2xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                              >
                                <GlassWater size={14} />
                                Dispense Glass
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Live Dispense logs & Sommelier Stats */}
              <div className="space-y-6">
                <div className="bg-stone-950 p-5 rounded-2xl border border-amber-950/50 text-white space-y-6 shadow-xl relative overflow-hidden">
                  <h5 className="text-[10px] font-semibold text-brand-accent uppercase tracking-[0.25em] mb-4">Sommelier Pour Logs</h5>
                  {dispenseLog.length === 0 ? (
                    <div className="py-8 text-center text-stone-500 italic text-xs border border-dashed border-stone-900 rounded-2xl p-4 bg-stone-950/60">
                      No manual pours recorded during active service roster. Select "Dispense Glass" above to register entries.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                      {dispenseLog.map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-stone-900/60 p-4 rounded-2xl border border-stone-850">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-950/60 text-brand-accent flex items-center justify-center border border-amber-900/30">
                              <Wine size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-stone-200">{log.name}</p>
                              <p className="text-[9px] font-semibold text-stone-500 uppercase tracking-widest">Dispensed to {log.tables}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-semibold text-brand-accent">{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="pt-6 border-t border-stone-900">
                    <h5 className="text-[10px] font-semibold text-brand-accent uppercase tracking-[0.25em] mb-4 font-display">Vault Performance</h5>
                    <div className="space-y-4 font-mono">
                      <div className="flex justify-between items-center text-xs text-stone-400">
                        <span className="font-sans">Estimated Pour Valuation</span>
                        <span className="text-white font-semibold">₹62,800 Est.</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-stone-400">
                        <span className="font-sans">Registered Premium Corkage</span>
                        <span className="text-white font-semibold">06 Pours Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Luxury Cocktail Ratio Assistant */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-soft space-y-6">
                  <h5 className="text-xs font-semibold text-stone-450 uppercase tracking-[0.25em] font-display">Maison Barrel Assistant</h5>
                  <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/10 flex items-start gap-3">
                    <ShieldCheck className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-xs font-semibold text-stone-900 uppercase">Automated Pour Security</p>
                      <p className="text-[11.5px] text-stone-500 leading-relaxed font-medium">
                        Automatic luxury bar thresholds applied. Pour events exceeding standard metric volumes report instant logs to the head mixologist ledger.
                      </p>
                    </div>
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
            {/* Left Column: Premium Bar Menu listings for selection (7 cols) */}
            <div className="xl:col-span-7 space-y-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200/80">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Select Lounge Offerings</span>
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{items.length} premium bottles loaded</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    disabled={item.stockBottles <= 0}
                    className="p-4 bg-white rounded-2xl border border-stone-200/80 hover:border-amber-500/60 text-left group flex items-start gap-4 transition-all disabled:opacity-55 cursor-pointer relative"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-100/60 overflow-hidden flex-shrink-0 relative">
                      <img src={item.image || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                      {item.stockBottles <= 5 && item.stockBottles > 0 && (
                        <span className="absolute bottom-1 left-1 right-1 text-center text-[7px] font-semibold bg-rose-500 text-white rounded uppercase tracking-wider">
                           Low stock
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-500 rounded text-[8px] font-extrabold uppercase tracking-widest">
                        {item.category}
                      </span>
                      <h5 className="text-sm font-semibold text-stone-900 group-hover:text-amber-600 transition-colors truncate">{item.name}</h5>
                      <p className="text-[10px] text-stone-400 font-semibold truncate">{item.vintage} • {item.origin}</p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-semibold text-stone-950 font-mono">₹{item.pricePerGlass.toLocaleString()}</span>
                        <span className="text-[9px] font-semibold text-amber-600 uppercase tracking-wider group-hover:underline">Add to ticket +</span>
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
                    <ShoppingCart className="text-amber-500" size={18} />
                    <h4 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">Active Lounge Ticket</h4>
                  </div>
                  <button 
                    onClick={() => setCart([])}
                    disabled={cart.length === 0}
                    className="text-[10px] font-semibold text-stone-400 hover:text-stone-950 uppercase tracking-widest disabled:opacity-40 cursor-pointer"
                  >
                    Clear Cart
                  </button>
                </div>

                {/* Cart Body */}
                {cart.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl bg-stone-50/50 border border-dashed border-stone-150 p-4 flex flex-col items-center gap-3">
                    <Wine className="text-stone-300 animate-pulse" size={40} />
                    <div>
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">No Active Pour Selections</p>
                      <p className="text-[11px] text-stone-400 mt-1 max-w-[240px]">Select any premium reserve bottle or mix from the cellar to open the tax invoice invoice generator.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                    {cart.map((cartItem) => {
                      return (
                        <div key={cartItem.item.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-150 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold text-stone-900">{cartItem.item.name}</p>
                              <p className="text-[10px] text-stone-400 font-mono">₹{cartItem.item.pricePerGlass} per glass</p>
                            </div>
                            
                            <div className="flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                              <button 
                                onClick={() => removeOneFromCart(cartItem.item.id)}
                                className="px-2.5 py-1 text-xs font-semibold text-stone-500 hover:bg-stone-50 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-3 text-xs font-semibold text-stone-800 font-mono">{cartItem.quantity}</span>
                              <button 
                                onClick={() => addToCart(cartItem.item)}
                                className="px-2.5 py-1 text-xs font-semibold text-stone-500 hover:bg-stone-50 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Modifiers (Mixers & Pour Size choices) */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/60">
                            <div>
                              <label className="text-[8px] font-semibold text-stone-400 uppercase tracking-widest block mb-1">Choice of Mixer</label>
                              <select
                                value={cartItem.mixer}
                                onChange={(e: any) => updateCartModifier(cartItem.item.id, 'mixer', e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-[10px] font-extrabold text-stone-700 focus:outline-none"
                              >
                                <option value="Neat">Neat / Straight</option>
                                <option value="Artisanal Ice Sphere">Artisanal Ice Sphere (+₹40)</option>
                                <option value="Fever Tree Tonic">Fever Tree Tonic (+₹100)</option>
                                <option value="Ginger Ale">Ginger Ale (+₹80)</option>
                                <option value="Premium Gold Soda">Premium Gold Soda (+₹50)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[8px] font-semibold text-stone-400 uppercase tracking-widest block mb-1">Pour Specification</label>
                              <select
                                value={cartItem.pourSize}
                                onChange={(e: any) => updateCartModifier(cartItem.item.id, 'pourSize', e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-[10px] font-extrabold text-stone-700 focus:outline-none"
                              >
                                <option value="Single">Single Pour (30ml)</option>
                                <option value="Double">Double Premium (60ml, 1.8x)</option>
                                <option value="Full Bottle">Full Collector Bottle (5x)</option>
                              </select>
                            </div>
                          </div>

                          <input 
                            type="text" 
                            placeholder="Add Sommelier / Garnish directives..."
                            value={cartItem.notes}
                            onChange={(e) => updateCartModifier(cartItem.item.id, 'notes', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-[9.5px] font-medium text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Logistics Configuration (Seating & Table) */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                    <div className="flex gap-4 w-full mb-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest px-1">Guest Name (Required)</label>
                        <input 
                          type="text" 
                          placeholder="Name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-accent/30"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest px-1">Guest Contact</label>
                        <input 
                          type="text" 
                          placeholder="Mobile Number (10 digits)"
                          maxLength={10}
                          value={customerPhone}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) setCustomerPhone(val);
                          }}
                          className={`w-full py-2.5 px-3 bg-stone-50 border rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-accent/30 ${customerPhone && customerPhone.length !== 10 ? 'border-red-400 focus:ring-red-100' : 'border-stone-200'}`}
                        />
                      </div>
                    </div>
                  <div className="flex flex-col gap-4">
                    


                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest px-1 block truncate">Lounge / Seating Cabin</label>
                      <select 
                        value={targetTable}
                        onChange={(e) => setTargetTable(e.target.value)}
                        className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none truncate"
                      >
                        <option value="Main Salon Table #12">Main Salon Table #12</option>
                        <option value="Exclusive Cabana #A">Exclusive Cabana #A</option>
                        <option value="Cognac Library Suite #1">Cognac Library Suite #1</option>
                        <option value="Mixologist Desk (In-Person)">Mixologist Desk (In-Person)</option>
                      </select>
                    </div>

                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest px-1 block truncate">Clearing Ledger</label>
                      <select 
                        value={paymentMethod}
                        onChange={(e: any) => setPaymentMethod(e.target.value as any)}
                        className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none truncate"
                      >
                        <option value="Cash">Cash Settlement</option>
                        <option value="UPI">Instant UPI (Tejas/BHIM)</option>
                        <option value="Online">Online / Card (Razorpay)</option>
                      </select>
                    </div>
                  </div>

                  {/* Loyalty Discount Voucher */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Access Voucher (e.g. MAISONVIP)"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold uppercase tracking-widest text-stone-800 focus:outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={applyLoyaltyDiscount}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-brand-accent text-[10px] font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedDiscount > 0 && (
                     <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-widest">
                       ✓ Member Promo Code Approved: {appliedDiscount}% Fine Sommelier Privilege discount applied.
                     </p>
                  )}
                </div>

                {/* Ledger Details */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-150 space-y-2">
                  <div className="flex justify-between items-center text-xs text-stone-500 font-semibold">
                    <span>Subtotal</span>
                    <span className="font-mono text-stone-800">₹{cartSubtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs text-rose-600 font-semibold">
                      <span>Privilege discount ({appliedDiscount}%)</span>
                      <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs text-stone-400 font-medium">
                    <span>Maison Silver-Service Charge (10%)</span>
                    <span className="font-mono">₹{serviceCharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-400 font-medium font-mono">
                    <span className="font-sans">CGST (9%)</span>
                    <span>₹{cgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-400 font-medium font-mono">
                    <span className="font-sans">SGST (9%)</span>
                    <span>₹{sgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-stone-900 font-semibold border-t border-stone-200/80 pt-2">
                    <span>Grand Luxury Total</span>
                    <span className="text-lg font-semibold text-amber-600 font-display">₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Settle Checkout Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-4 bg-stone-950 text-brand-accent font-semibold rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-stone-950/10 hover:bg-stone-900 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
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
                  {/* Decorative cutouts */}
                  <div className="absolute top-0 left-0 right-0 flex justify-between px-4 -translate-y-1">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-white rounded-full" />
                    ))}
                  </div>

                  <div className="pt-4 text-center">
                     <p className="text-xs font-semibold text-stone-900 uppercase tracking-[0.2em] font-display">THE MAISON DE LUXE</p>
                     <p className="text-[8px] text-stone-405 uppercase tracking-widest font-semibold font-mono text-amber-600">Premium Cellars & Lounge Guild</p>
                     <p className="text-[9px] text-stone-400 font-medium mt-1">Lounge Suite #03, Connaught Court, New Delhi</p>
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
                      <span className="text-stone-400 font-semibold uppercase">Mixologist hand:</span>
                      <span className="text-stone-800 font-medium">{checkoutReceipt.mixologist}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="py-4 border-b border-dashed border-stone-200 font-mono text-xs space-y-3">
                    {checkoutReceipt.items.map((cartItem: any, idx: number) => {
                      const finalItemPrice = getItemPrice(cartItem);
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between text-[11px] font-semibold text-stone-900">
                            <span>{cartItem.item.name} (x{cartItem.quantity})</span>
                            <span>₹{(finalItemPrice * cartItem.quantity).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[8.5px] text-stone-450 italic">
                             <span>↳ Pour: {cartItem.pourSize} / {cartItem.mixer}</span>
                          </div>
                          {cartItem.notes && (
                            <p className="text-[8px] text-stone-500 font-semibold">↳ Directives: "{cartItem.notes}"</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Receipt Pricing details */}
                  <div className="py-4 font-mono text-xs space-y-1.5 text-stone-600 border-b border-dashed border-stone-200">
                     <div className="flex justify-between text-[10px]">
                        <span>DOCKET SUB-TOTAL</span>
                        <span>₹{checkoutReceipt.subtotal.toLocaleString()}</span>
                     </div>

                     <div className="flex justify-between text-[10px]">
                        <span>SILVER SERVICE FEE (10%)</span>
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

                  {/* Receipt Total */}
                  <div className="pt-4 text-center font-mono space-y-3">
                     <div className="flex justify-between text-stone-900 font-semibold text-sm">
                        <span>GRAND INVOICE TOTAL</span>
                        <span>₹{checkoutReceipt.total.toLocaleString()}</span>
                     </div>
                     
                     <div className="p-3 bg-stone-905 bg-stone-900 text-brand-accent rounded-xl text-[9px] font-semibold uppercase tracking-widest font-sans flex items-center justify-center gap-1.5 shadow">
                        <CheckCircle size={12} className="text-amber-500" />
                        TENDERED COMPLETED VIA {checkoutReceipt.payment}
                     </div>

                     <div className="grid grid-cols-2 gap-2 mt-4">
                       <button 
                         onClick={() => window.print()}
                         className="px-3 py-2.5 bg-stone-200 border border-stone-300 text-stone-600 hover:text-stone-900 rounded-xl text-[9.5px] font-sans font-semibold uppercase tracking-widest transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98 transition-all"
                       >
                         <Printer size={12} />
                         Print Ticket
                       </button>
                       <button 
                         onClick={() => {
                           
                         }}
                         className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-[9.5px] font-sans font-semibold uppercase tracking-widest transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10 hover:scale-102 active:scale-98 transition-all"
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

      {/* Acquisition Add Liquor Modal */}
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
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-amber-900/10 overflow-hidden text-stone-800"
            >
              <h3 className="text-2xl font-semibold text-stone-900 mb-2 font-display">Acquire Premium Bottle</h3>
              <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-6">Catalog fine wines, single malts or custom creations</p>

              <form onSubmit={handleAddLiquor} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Liquor / Label Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Glenfiddich Grande Couronne 26 Y.O." 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>

                
                <div className="space-y-1 pb-4">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Image URL (Optional)</label>
                  <input type="text" value={newImage} onChange={e => setNewImage(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm focus:outline-none" />
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2 block mb-1">Or Upload from Device</label>
                  <input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Label Category</label>
                    <select 
                      value={newCategory} 
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm focus:outline-none"
                    >
                      <option value="Single Malt">Single Malt</option>
                      <option value="Vintage Wine">Vintage Wine</option>
                      <option value="Cognac">Cognac</option>
                      <option value="Craft Cocktail">Craft Cocktail</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Vintage / Age</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 26 Y.O. or 2018" 
                      value={newVintage}
                      onChange={(e) => setNewVintage(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Alcohol (ABV %)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 43.8%" 
                      value={newAbv}
                      onChange={(e) => setNewAbv(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl font-mono text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Bottle Size (Ml)</label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="750" 
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Glass Price (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      placeholder="3500" 
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Stock Bottles</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      placeholder="6" 
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Origin / Estate Vineyard</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Champagne region, France" 
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm focus:outline-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 font-semibold text-stone-400 hover:bg-stone-50 rounded-2xl text-xs uppercase tracking-widest cursor-pointer">DISCARD</button>
                  <button type="submit" className="flex-[2] py-4 bg-stone-900 border border-amber-500/20 text-brand-accent font-semibold rounded-2xl text-xs uppercase tracking-widest shadow-xl cursor-pointer">CELLAR ACQUISITION</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
