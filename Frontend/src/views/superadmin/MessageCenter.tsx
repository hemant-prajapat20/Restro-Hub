import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Search, ShoppingBag, CreditCard, Package, Calendar, Users, Settings } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'order', label: 'Orders', icon: ShoppingBag },
  { id: 'payment', label: 'Payments', icon: CreditCard },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'reservation', label: 'Reservations', icon: Calendar },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'system', label: 'System', icon: Settings },
];

export const MessageCenter: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching logs', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // Listen for real-time messages
    import('socket.io-client').then(({ io }) => {
      const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
      socket.on('newMessage', (newNotif) => {
        setLogs(prev => [newNotif, ...prev]);
      });
      return () => socket.disconnect();
    });
  }, []);

  const handleDoubleClick = async (logId: string, isRead: boolean) => {
    if (isRead) return; // Already read
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/activity/read', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logId })
      });
      
      if (res.ok) {
        // Optimistically update the UI
        setLogs(prev => prev.map(log => log._id === logId ? { ...log, isRead: true } : log));
      }
    } catch (error) {
      console.error('Error marking message as read', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'order': return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'inventory': return <Package className="w-5 h-5 text-amber-500" />;
      case 'reservation': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'staff': return <Users className="w-5 h-5 text-indigo-500" />;
      case 'system': return <Settings className="w-5 h-5 text-slate-500" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || log.category === activeTab || (!log.category && activeTab === 'system');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 truncate">Message Center</h1>
            <p className="text-xs sm:text-sm text-slate-500 break-words">Track all platform-wide activities, registrations, and updates</p>
          </div>
        </div>
        <div className="relative w-full sm:w-auto shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                isActive ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-brand-accent' : 'text-slate-400'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p>No messages found in this category.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div 
                key={log._id} 
                onDoubleClick={() => handleDoubleClick(log._id, log.isRead)}
                className={`p-6 flex items-start gap-4 transition-colors select-none cursor-pointer border-l-4 ${
                  log.isRead ? 'bg-white border-transparent hover:bg-slate-50' : 'bg-brand-accent/5 border-brand-accent hover:bg-brand-accent/10'
                }`}
                title="Double-click to mark as seen"
              >
                <div className="mt-1 relative">
                  {!log.isRead && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-white"></span>
                  )}
                  {getCategoryIcon(log.category || 'system')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-2">
                    <h3 className={`break-words ${log.isRead ? 'text-slate-800 font-semibold' : 'text-black font-bold'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </h3>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full shrink-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm break-words ${log.isRead ? 'text-slate-500 font-normal' : 'text-black font-bold'}`}>
                    {log.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
