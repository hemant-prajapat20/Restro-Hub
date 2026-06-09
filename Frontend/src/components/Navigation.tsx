import React from 'react';
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
  Smartphone,
  Wine,
  Coffee,
  Contact,
  Crown,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  // Props removed since active state is determined by location
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'POS Billing', icon: UtensilsCrossed },
  { id: 'restro', label: 'Restro Signature', icon: Crown },
  { id: 'bar', label: 'Bar Lounge', icon: Wine },
  { id: 'cafe', label: 'Cafe & Patisserie', icon: Coffee },
  { id: 'menu', label: 'Menu Catalog', icon: Layers },
  { id: 'tables', label: 'Tables', icon: Table2 },
  { id: 'kds', label: 'Kitchen (KDS)', icon: ChefHat },
  { id: 'delivery', label: 'Online Orders', icon: ShoppingBag },
  { id: 'inventory', label: 'Inventory', icon: ClipboardList },
  { id: 'staff', label: 'Staff Directory', icon: Users },
  { id: 'customers', label: 'Customer CRM', icon: Contact },
  { id: 'reports', label: 'Reports & GST', icon: TrendingUp },
];

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store';

export const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentPath = location.pathname.split('/').pop();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="w-64 bottom-0 overflow-y-auto bg-brand-sidebar text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20">
          <Crown className="text-white w-6 h-6" />
        </div>
        <span className="font-sans font-semibold text-lg tracking-wider text-brand-accent uppercase">IndiServe Reserve</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.id || (currentPath === 'admin' && item.id === 'dashboard');
          return (
            <Link
              key={item.id}
              to={`/admin/${item.id}`}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm",
                isActive 
                  ? "bg-brand-accent text-white shadow-xl shadow-brand-accent/30" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-white")} />
              <span className="font-semibold">{item.label}</span>
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
        <Link to="/admin/settings" className={cn(
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
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Guest User';
  const roleDisplay = user ? user.role.replace('_', ' ') : 'System Admin';

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 ml-64 sticky top-0 z-40 glass">
      
      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search orders, menu items, or customers..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:bg-white transition-all font-medium text-sm text-slate-800 shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-success/10 text-brand-success rounded-full text-xs font-semibold uppercase tracking-wider">
          <div className="w-2 h-2 bg-brand-success rounded-full animate-pulse" />
          Server Live
        </div>
        
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-accent rounded-full border-2 border-white" />
        </button>

        <div className="h-10 w-[1px] bg-slate-200 mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{fullName}</p>
            <p className="text-xs text-slate-500 capitalize">{roleDisplay}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
            {user ? (
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
