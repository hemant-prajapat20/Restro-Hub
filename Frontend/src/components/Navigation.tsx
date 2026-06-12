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
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const businessNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'POS Billing', icon: UtensilsCrossed },
  { id: 'restro', label: 'Restro Signature', icon: Crown },
  { id: 'bar', label: 'Bar Lounge', icon: Wine },
  { id: 'cafe', label: 'Cafe & Patisserie', icon: Coffee },
  { id: 'menu', label: 'Menu Catalog', icon: Layers },
  { id: 'tables', label: 'Tables', icon: Table2 },
  { id: 'kds', label: 'Kitchen (KDS)', icon: ChefHat },
  { id: 'delivery', label: 'Online Orders', icon: ShoppingBag },
  { id: 'transactions', label: 'Transactions', icon: FileText },
  { id: 'messages', label: 'Message Center', icon: Bell },
  { id: 'inventory', label: 'Inventory', icon: ClipboardList },
  { id: 'staff', label: 'Staff Directory', icon: Users },
  { id: 'customers', label: 'Customer CRM', icon: Contact },
  { id: 'reports', label: 'Reports & GST', icon: TrendingUp },
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
  const navItems = isSuperAdmin ? superAdminNavItems : businessNavItems;
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const currentPath = location.pathname.split('/').pop();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

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
            <span className={cn("font-semibold text-lg tracking-wider text-brand-accent uppercase truncate", isSuperAdmin ? "font-display leading-none" : "font-sans")}>IndiServe</span>
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm",
                isActive 
                  ? "bg-brand-accent text-white shadow-xl shadow-brand-accent/30" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-white")} />
              <span className={cn("font-semibold", isSuperAdmin && "truncate")}>{item.label}</span>
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
  const user = useSelector((state: RootState) => state.auth.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const fullName = user ? (isSuperAdmin ? 'System Root' : `${user.firstName} ${user.lastName}`) : 'Guest User';
  const roleDisplay = user ? user.role.replace('_', ' ') : 'System Admin';

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleGlobalEvent(event: Event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const target = event.target as Element;
        if (target.closest('button[aria-label="Notifications"]')) return;
        setShowDropdown(false);
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
    if (!isSuperAdmin) return;
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/activity', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setNotifications(data.data);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [isSuperAdmin]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    if (!isSuperAdmin) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/activity/read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
            <h2 className="text-xl sm:text-2xl font-semibold font-display text-slate-900 truncate">IndiServe Admin</h2>
            <p className="text-xs sm:text-sm text-slate-500 break-words">Platform-wide Management Console</p>
          </div>
        ) : (
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Search orders, menu items, or customers..." 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:bg-white transition-all font-medium text-sm text-slate-800 shadow-sm"
              />
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
            onClick={() => isSuperAdmin ? setShowDropdown(!showDropdown) : null}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"
          >
            <Bell className="w-6 h-6" />
            {isSuperAdmin && unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            {!isSuperAdmin && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-accent rounded-full border-2 border-white" />
            )}
          </button>

          {isSuperAdmin && showDropdown && (
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
                  notifications.map((notif, i) => (
                    <div key={i} className={cn("p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors", notif.isRead ? "opacity-60" : "")}>
                      <p className="text-xs font-medium text-slate-900 mb-1">{notif.message}</p>
                      <span className="text-[10px] text-slate-400">{new Date(notif.createdAt).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
              <Link to="/super-admin/messages" onClick={() => setShowDropdown(false)} className="block p-3 text-center text-xs text-brand-accent font-semibold hover:bg-slate-50 transition-colors border-t border-slate-100">
                View Message Center
              </Link>
            </div>
          )}
        </div>

        <div className="h-10 w-[1px] bg-slate-200 mx-1 md:mx-2" />

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-slate-900 break-words">{fullName}</p>
            <p className={cn("text-xs capitalize break-words", isSuperAdmin ? "text-brand-accent font-semibold uppercase tracking-widest" : "text-slate-500")}>
              {roleDisplay}
            </p>
          </div>
          <div className={cn("w-10 h-10 rounded-full border-2 shadow-sm overflow-hidden flex items-center justify-center", isSuperAdmin ? "bg-slate-200 border-brand-accent" : "bg-slate-200 border-white")}>
            {isSuperAdmin ? (
              <Crown className="w-5 h-5 text-brand-accent" />
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
