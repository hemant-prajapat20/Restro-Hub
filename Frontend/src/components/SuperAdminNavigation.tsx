import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Blocks,
  CreditCard,
  Users, 
  LifeBuoy,
  Settings, 
  LogOut,
  Bell,
  Crown,
  Menu,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link, useLocation } from 'react-router-dom';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { id: 'dashboard', label: 'Platform Analytics', icon: LayoutDashboard },
  { id: 'businesses', label: 'Business Management', icon: Building2 },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'messages', label: 'Message Center', icon: Bell },
  { id: 'settings', label: 'System Config', icon: Settings },
];

export const SuperAdminSidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  return (
    <aside className={cn(
      "w-64 bg-brand-sidebar text-white flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20">
            <Crown className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-semibold text-lg tracking-wider text-brand-accent uppercase leading-none truncate">IndiServe</span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-[0.2em] uppercase mt-1 truncate">Super Admin</span>
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
          const isActive = currentPath === item.id || (currentPath === 'super-admin' && item.id === 'dashboard');
          return (
            <Link
              key={item.id}
              to={`/super-admin/${item.id}`}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm",
                isActive 
                  ? "bg-brand-accent text-white shadow-xl shadow-brand-accent/30" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
              onClick={() => {
                if (onClose) onClose();
              }}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-white")} />
              <span className="font-semibold truncate">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="super-active-pill"
                  className="ml-auto w-1 h-4 bg-white rounded-full opacity-50"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm">
          <LogOut className="w-5 h-5" />
          <span className="font-medium truncate">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export const SuperAdminHeader: React.FC<{ onOpenSidebar?: () => void }> = ({ onOpenSidebar }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleGlobalEvent(event: Event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // If clicking the bell icon itself, let the onClick handler deal with it to avoid double toggling
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
    const interval = setInterval(fetchNotifications, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
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
      <div className="flex items-center gap-4">
        {onOpenSidebar && (
          <button 
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="hidden sm:flex flex-col">
          <h2 className="text-xl sm:text-2xl font-semibold font-display text-slate-900 truncate">IndiServe Admin</h2>
          <p className="text-xs sm:text-sm text-slate-500 break-words">Platform-wide Management Console</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-accent/10 text-brand-accent rounded-full text-xs font-semibold uppercase tracking-wider">
          <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
          Network Status: Optimal
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

        <div className="h-10 w-[1px] bg-slate-200 mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 break-words">System Root</p>
            <p className="text-xs text-brand-accent font-semibold uppercase tracking-widest break-words">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-brand-accent shadow-sm overflow-hidden flex items-center justify-center">
             <Crown className="w-5 h-5 text-brand-accent" />
          </div>
        </div>
      </div>
    </header>
  );
};
