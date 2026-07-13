import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Table2, 
  ChefHat, 
  ClipboardList, 
  Layers,
  Users, 
  Settings, 
  TrendingUp, 
  LogOut,
  ShoppingBag,
  Bell,
  Wine,
  Coffee,
  Contact,
  Crown,
  Search,
  Building2,
  CreditCard,
  Menu,
  X,
  FileText,
  Store,
  Package,
  Calendar,
  Info,
  User,
  ArrowRight,
  Activity,
  CalendarDays,
  ExternalLink,
  Moon,
  Sun,
  Monitor,
  Laptop
} from 'lucide-react';
import { playNotificationSound } from '../utils/sound';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setCredentials } from '../store/slices/authSlice';
import { RootState } from '../store';
import api from '../utils/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const businessNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'Point of Sale', icon: Store },
  { id: 'restro', label: 'Restro Signature', icon: UtensilsCrossed, platform: 'Restaurant' },
  { id: 'bar', label: 'Bar Lounge', icon: Wine, platform: 'Bar' },
  { id: 'cafe', label: 'Cafe & Patisserie', icon: Coffee, platform: 'Cafeteria' },
  { id: 'menu', label: 'Menu Catalog', icon: Layers },
  { id: 'tables', label: 'Tables', icon: Table2 },
  { id: 'kds', label: 'Kitchen (KDS)', icon: ChefHat },
  { id: 'delivery', label: 'Online Orders', icon: ShoppingBag },
  { id: 'inventory', label: 'Inventory', icon: ClipboardList },
  { id: 'staff', label: 'Staff Directory', icon: Users },
  { id: 'customers', label: 'Customer CRM', icon: Contact },
  { id: 'reports', label: 'Reports & GST', icon: TrendingUp },
  { id: 'transactions', label: 'Transactions', icon: FileText },
  { id: 'messages', label: 'Message Center', icon: Bell },
];

const superAdminNavItems = [
  { id: 'dashboard', label: 'Platform Analytics', icon: LayoutDashboard },
  { id: 'businesses', label: 'Business Management', icon: Building2 },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'messages', label: 'Message Center', icon: Bell },
  { id: 'settings', label: 'System Config', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const userPlatforms = user?.businessData?.platforms || [];
  const toggles = user?.businessData?.featureToggles || {};
  
  const filteredBusinessNavItems = businessNavItems.filter(item => {
    // 1. Must have purchased the platform
    if (item.platform && !userPlatforms.includes(item.platform)) {
      return false;
    }
    // 2. Must not be temporarily disabled via toggles
    if (item.id === 'restro' && toggles.restaurant === false) return false;
    if (item.id === 'cafe' && toggles.cafe === false) return false;
    // Note: Assuming 'bar' doesn't have a toggle yet, or it's always on if purchased
    if (item.id === 'delivery' && toggles.onlineOrders === false) return false;
    if (item.id === 'tables' && toggles.reservations === false) return false;
    
    return true;
  });

  const navItems = isSuperAdmin ? superAdminNavItems : filteredBusinessNavItems;
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const currentPath = location.pathname.split('/').pop();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const queryClient = useQueryClient();

  const { data: dbOrders = [] } = useQuery({
    queryKey: ['sidebar-kds-orders'],
    queryFn: async () => {
      if (isSuperAdmin) return [];
      const res = await api.get('/orders');
      return res.data.filter((o: any) => o.status !== 'Completed' && o.status !== 'Cancelled' && o.type !== 'Delivery');
    },
    refetchInterval: 30000, // Fallback polling
    enabled: !isSuperAdmin
  });

  const hasActiveKdsOrders = dbOrders.length > 0;

  useEffect(() => {
    if (isSuperAdmin) return;
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.on('newOrder', () => {
      queryClient.invalidateQueries({ queryKey: ['sidebar-kds-orders'] });
    });
    socket.on('orderUpdated', () => {
      queryClient.invalidateQueries({ queryKey: ['sidebar-kds-orders'] });
    });
    return () => {
      socket.disconnect();
    };
  }, [isSuperAdmin, queryClient]);

  return (
    <aside className={cn(
      "w-64 bottom-0 overflow-y-auto bg-brand-sidebar text-white flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20">
            <Crown className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className={cn("font-semibold text-lg tracking-wider uppercase truncate", isSuperAdmin ? "font-display leading-none" : "font-sans")}><span className="text-white">Restro</span><span className="text-brand-accent">Hub</span></span>
            {isSuperAdmin && <span className="text-[10px] font-semibold text-slate-400 tracking-[0.2em] uppercase mt-1 truncate">Super Admin</span>}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.id || (currentPath === (isSuperAdmin ? 'super-admin' : 'admin') && item.id === 'dashboard');
            return (
              <Link
                key={item.id}
                to={`${basePath}/${item.id}`}
                onClick={() => { if (onClose) onClose(); }}
                className={cn(
                  "relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm",
                  isActive 
                    ? "bg-brand-accent text-white shadow-xl shadow-brand-accent/30" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-white")} />
                <span className={cn("font-semibold", isSuperAdmin && "truncate")}>{item.label}</span>
                {item.id === 'kds' && hasActiveKdsOrders && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse absolute right-4 top-1/2 -translate-y-1/2"></span>
                )}
                {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="ml-auto w-1 h-4 bg-white rounded-full opacity-50"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        {!isSuperAdmin && (
          <Link to="/admin/settings" onClick={() => { if (onClose) onClose(); }} className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
            currentPath === 'settings' 
              ? "bg-brand-accent text-white shadow-xl shadow-brand-accent/30" 
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          )}>
            <Settings className={cn("w-5 h-5", currentPath === 'settings' ? "text-white" : "group-hover:text-white")} />
            <span className="font-semibold">Settings</span>
            {currentPath === 'settings' && (
              <motion.div 
                layoutId="active-pill"
                className="ml-auto w-1 h-4 bg-white rounded-full opacity-50"
              />
            )}
          </Link>
        )}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm">
          <LogOut className="w-5 h-5" />
          <span className="font-semibold truncate">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export const Header: React.FC<{ onOpenSidebar?: () => void }> = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const fullName = user ? (isSuperAdmin ? 'System Root' : `${user.firstName} ${user.lastName}`) : 'Guest User';
  const roleDisplay = user ? user.role.replace('_', ' ') : 'System Admin';

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return null;
      const res = await api.get(`/businesses/me/search?q=${debouncedQuery}`);
      return res.data.data;
    },
    enabled: debouncedQuery.length >= 2 && !isSuperAdmin
  });

  useEffect(() => {
    function handleGlobalEvent(event: Event) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        if (!(target as Element).closest?.('button[aria-label="Notifications"]')) {
          setShowDropdown(false);
        }
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleGlobalEvent);
      document.addEventListener('scroll', handleGlobalEvent, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleGlobalEvent);
      document.removeEventListener('scroll', handleGlobalEvent, true);
    };
  }, [showDropdown]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const endpoint = isSuperAdmin ? '/activity' : '/messages';
        const res = await api.get(endpoint);
        if (res.data.status === 'success') {
          setNotifications(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    fetchNotifications();

    // Set up Socket.IO connection for real-time notifications
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    // SuperAdmin only listens to platform-level admin activity events
    // BusinessAdmin listens to their own restaurant message events
    const eventName = isSuperAdmin ? 'newAdminActivity' : 'newMessage';

    socket.on(eventName, (newNotif) => {
      // Play sound
      playNotificationSound();

      // Add the new notification to the top of the list
      setNotifications(prev => [newNotif, ...prev]);
      
      // Show toast notification
      if (newNotif.type === 'success') {
        toast.success(newNotif.message, { duration: 5000 });
      } else {
        toast(newNotif.message, { icon: '🔔' });
      }
    });

    socket.on('businessUpdated', async (data) => {
      if (user && user.businessId === data.businessId && token) {
        try {
          const res = await api.get('/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'success') {
            dispatch(setCredentials({ user: res.data.data, token }));
            // We can optionally show a toast
            toast.success('Business settings updated by SuperAdmin');
          }
        } catch (err) {
          console.error('Failed to refresh profile after business update', err);
        }
      }
    });

    const handleReadOne = (e: any) => {
      setNotifications(prev => prev.map(n => n._id === e.detail.id ? { ...n, isRead: true } : n));
    };
    const handleReadAll = () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    window.addEventListener('notificationsReadOne', handleReadOne);
    window.addEventListener('notificationsReadAll', handleReadAll);

    return () => {
      socket.disconnect();
      window.removeEventListener('notificationsReadOne', handleReadOne);
      window.removeEventListener('notificationsReadAll', handleReadAll);
    };
  }, [isSuperAdmin]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    try {
      const endpoint = isSuperAdmin ? '/activity/read' : '/messages/read';
      await api.put(endpoint);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const markOneRead = async (notifId: string) => {
    // Optimistically update UI immediately
    setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
    try {
      const endpoint = isSuperAdmin ? '/activity/read' : '/messages/read';
      const body = isSuperAdmin ? { logId: notifId } : { messageId: notifId };
      await api.put(endpoint, body);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 lg:ml-64 sticky top-0 z-40 glass">
      
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {isSuperAdmin ? (
          <div className="hidden sm:flex flex-col">
            <h2 className="text-xl sm:text-2xl font-semibold font-display truncate"><span className="text-black">Restro</span><span className="text-brand-accent">Hub</span> <span className="text-slate-900">Admin</span></h2>
            <p className="text-xs sm:text-sm text-slate-500 break-words">Platform-wide Management Console</p>
          </div>
        ) : (
          <div className="flex-1 max-w-xl hidden md:block" ref={searchRef}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-accent transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Search orders, menu items, or customers..." 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:bg-white transition-all font-medium text-sm text-slate-800 shadow-sm"
              />

              {/* Global Search Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && searchQuery.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-[70vh] flex flex-col"
                  >
                    {isSearching ? (
                      <div className="p-8 text-center text-slate-500">
                        <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-sm font-medium">Searching...</p>
                      </div>
                    ) : searchResults && (searchResults.orders?.length > 0 || searchResults.menuItems?.length > 0 || searchResults.customers?.length > 0) ? (
                      <div className="overflow-y-auto p-2 scrollbar-thin">
                        
                        {searchResults.orders?.length > 0 && (
                          <div className="mb-3">
                            <h3 className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white/95 backdrop-blur z-10 flex items-center gap-2">
                              <ShoppingBag size={12} /> Orders
                            </h3>
                            <div className="space-y-0.5 mt-1">
                              {searchResults.orders.map((o: any) => (
                                <button 
                                  key={o._id}
                                  onClick={() => { setShowSearchDropdown(false); navigate('/admin/transactions'); }}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                                >
                                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <ShoppingBag size={14} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">Order #{o.orderNumber || o._id.slice(-6).toUpperCase()}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{o.customer?.name || 'Guest'} • ₹{o.totalAmount || o.subtotal}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {searchResults.menuItems?.length > 0 && (
                          <div className="mb-3">
                            <h3 className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white/95 backdrop-blur z-10 flex items-center gap-2">
                              <UtensilsCrossed size={12} /> Menu Items
                            </h3>
                            <div className="space-y-0.5 mt-1">
                              {searchResults.menuItems.map((m: any) => (
                                <button 
                                  key={m._id}
                                  onClick={() => { setShowSearchDropdown(false); navigate('/admin/menu'); }}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                                >
                                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <UtensilsCrossed size={14} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{m.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{m.category} • ₹{m.price}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {searchResults.customers?.length > 0 && (
                          <div className="mb-1">
                            <h3 className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white/95 backdrop-blur z-10 flex items-center gap-2">
                              <Contact size={12} /> Customers
                            </h3>
                            <div className="space-y-0.5 mt-1">
                              {searchResults.customers.map((c: any) => (
                                <button 
                                  key={c._id}
                                  onClick={() => { setShowSearchDropdown(false); navigate('/admin/customers'); }}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                                >
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Contact size={14} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{c.phone || c.email}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                        <Search className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-sm font-medium">No results found for "{searchQuery}"</p>
                        <p className="text-xs mt-1 text-slate-400">Try searching for something else</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className={cn("hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider", isSuperAdmin ? "bg-brand-accent/10 text-brand-accent" : "bg-brand-success/10 text-brand-success")}>
          <div className={cn("w-2 h-2 rounded-full animate-pulse", isSuperAdmin ? "bg-brand-accent" : "bg-brand-success")} />
          {isSuperAdmin ? 'Network Status: Optimal' : 'Server Live'}
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            aria-label="Notifications"
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="fixed left-4 right-4 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-80 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-brand-accent hover:underline font-medium">Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
                ) : (
                  notifications.map((notif, i) => {
                    let IconComp = Bell;
                    let iconColor = "text-slate-400";
                    switch(notif.category) {
                      case 'order': IconComp = ShoppingBag; iconColor = "text-emerald-500"; break;
                      case 'payment': IconComp = CreditCard; iconColor = "text-blue-500"; break;
                      case 'inventory': IconComp = Package; iconColor = "text-amber-500"; break;
                      case 'reservation': IconComp = Calendar; iconColor = "text-purple-500"; break;
                      case 'staff': IconComp = Users; iconColor = "text-indigo-500"; break;
                      case 'system': IconComp = Settings; iconColor = "text-slate-500"; break;
                      default: IconComp = Info; iconColor = "text-blue-500"; break;
                    }

                    return (
                    <div
                      key={i}
                      onClick={() => !notif.isRead && markOneRead(notif._id)}
                      className={cn("p-3 border-b border-slate-50 transition-colors flex items-start gap-3", notif.isRead ? "hover:bg-slate-50" : "bg-amber-50/40 hover:bg-amber-50 cursor-pointer")}>
                      <div className="mt-0.5 shrink-0">
                        <IconComp size={16} className={iconColor} />
                      </div>
                      <div>
                        <p className={cn("text-xs mb-1", notif.isRead ? "font-normal text-slate-600" : "font-bold text-black")}>{notif.message}</p>
                        <span className={cn("text-[10px]", notif.isRead ? "text-slate-400" : "text-slate-500 font-medium")}>{new Date(notif.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )})
                )}
              </div>
              <Link to={isSuperAdmin ? "/super-admin/messages" : "/admin/messages"} onClick={() => setShowDropdown(false)} className="block p-3 text-center text-xs text-brand-accent font-semibold hover:bg-slate-50 transition-colors border-t border-slate-100">
                View Message Center
              </Link>
            </div>
          )}
        </div>

        <div className="h-10 w-[1px] bg-slate-200 mx-1 md:mx-2" />

        <div 
          onClick={() => navigate(isSuperAdmin ? '/super-admin/settings' : '/admin/settings')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-slate-900 break-words">{fullName}</p>
            <p className={cn("text-xs capitalize break-words", isSuperAdmin ? "text-brand-accent font-semibold uppercase tracking-widest" : "text-slate-500")}>
              {roleDisplay}
            </p>
          </div>
          <div className={cn("w-10 h-10 rounded-full border-2 shadow-sm overflow-hidden flex items-center justify-center", isSuperAdmin ? "bg-slate-200 border-brand-accent" : "bg-slate-200 border-white")}>
            {isSuperAdmin ? (
              <Crown className="w-5 h-5 text-brand-accent" />
            ) : user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : user ? (
              <span className="font-bold text-brand-accent">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
            ) : (
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh" 
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
