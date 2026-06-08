import React from 'react';
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
  Crown
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
  { id: 'users', label: 'User Directory', icon: Users },
];

export const SuperAdminSidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  return (
    <aside className="hidden lg:flex w-64 h-screen bg-brand-sidebar text-white flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20">
          <Crown className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-semibold text-lg tracking-wider text-brand-accent uppercase leading-none truncate">IndiServe</span>
          <span className="text-[10px] font-semibold text-slate-400 tracking-[0.2em] uppercase mt-1 truncate">Super Admin</span>
        </div>
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
        <Link 
          to="/super-admin/settings"
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm",
            currentPath === 'settings'
              ? "bg-brand-accent text-white shadow-xl shadow-brand-accent/30" 
              : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium truncate">System Config</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm">
          <LogOut className="w-5 h-5" />
          <span className="font-medium truncate">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export const SuperAdminHeader: React.FC = () => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 lg:ml-64 sticky top-0 z-40 glass">
      <div className="flex flex-col">
        <h2 className="text-2xl font-semibold font-display text-slate-900 truncate">IndiServe Admin</h2>
        <p className="text-sm text-slate-500 break-words">Platform-wide Management Console</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-accent/10 text-brand-accent rounded-full text-xs font-semibold uppercase tracking-wider">
          <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
          Network Status: Optimal
        </div>
        
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white truncate" />
        </button>

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
