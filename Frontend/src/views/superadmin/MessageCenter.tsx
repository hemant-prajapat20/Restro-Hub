import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, Building2, CreditCard, ShieldCheck, 
  ShieldOff, RefreshCcw, CheckCheck, Trash2, Info,
  CheckCircle2, AlertTriangle, XCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const getActionMeta = (action: string, category: string) => {
  switch (action) {
    case 'BUSINESS_REGISTERED':
      return { icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'New Business', border: 'border-emerald-200' };
    case 'BUSINESS_ACTIVATED':
      return { icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Activated', border: 'border-blue-200' };
    case 'BUSINESS_DEACTIVATED':
      return { icon: ShieldOff, color: 'text-red-500', bg: 'bg-red-50', label: 'Deactivated', border: 'border-red-200' };
    case 'SUBSCRIPTION_PAYMENT':
      return { icon: CreditCard, color: 'text-violet-500', bg: 'bg-violet-50', label: 'Payment', border: 'border-violet-200' };
    case 'PLAN_UPDATED':
      return { icon: RefreshCcw, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Plan Updated', border: 'border-amber-200' };
    default:
      return { icon: Info, color: 'text-slate-500', bg: 'bg-slate-50', label: 'System', border: 'border-slate-200' };
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
    default: return <Info className="w-4 h-4 text-blue-500" />;
  }
};

export const MessageCenter: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/activity`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setLogs(data.data);
        setUnreadCount(data.data.filter((l: any) => !l.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching logs', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    import('socket.io-client').then(({ io }) => {
      const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
      socket.on('newAdminActivity', (newLog) => {
        setLogs(prev => [newLog, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.success('New platform activity!');
      });
      return () => socket.disconnect();
    });
  }, []);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/activity/read`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      setLogs(prev => prev.map(log => ({ ...log, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markOneRead = async (logId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/activity/read`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logId })
      });
      setLogs(prev => prev.map(log => log._id === logId ? { ...log, isRead: true } : log));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().replace(/_/g, ' ').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 pb-24 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6 text-brand-accent" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900">Platform Notifications</h1>
            <p className="text-xs sm:text-sm text-slate-500">Business registrations, plan changes, payments & status updates</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-56 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <CheckCheck size={15} />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: logs.length, color: 'text-slate-800', bg: 'bg-white' },
          { label: 'Unread', value: unreadCount, color: 'text-brand-accent', bg: 'bg-brand-accent/5 border-brand-accent/20' },
          { label: 'Businesses', value: logs.filter(l => l.category === 'business').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Payments', value: logs.filter(l => l.category === 'payment').length, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-slate-100 rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm text-slate-400 mt-1">Platform activities like new signups, plan changes and payments will appear here.</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="divide-y divide-slate-50">
              {filteredLogs.map((log) => {
                const meta = getActionMeta(log.action, log.category);
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => !log.isRead && markOneRead(log._id)}
                    className={`p-5 flex items-start gap-4 cursor-pointer transition-all group border-l-4 ${
                      log.isRead ? 'bg-white border-transparent hover:bg-slate-50/50' : 'bg-brand-accent/[0.03] border-brand-accent'
                    }`}
                    title={log.isRead ? '' : 'Click to mark as read'}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} border ${meta.border}`}>
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                          {getTypeIcon(log.type)}
                          {!log.isRead && (
                            <span className="w-2 h-2 bg-brand-accent rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock size={11} />
                          {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                      <h3 className={`text-sm font-semibold ${log.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </h3>
                      <p className={`text-sm mt-0.5 ${log.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                        {log.message}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
