import React, { useState } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

export const MessageCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['businessMessages'],
    queryFn: async () => {
      const response = await api.get('/messages');
      return response.data.data;
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await api.put('/messages/read', { messageId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessMessages'] });
    }
  });

  const handleDoubleClick = (messageId: string, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(messageId);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return <div className="p-5 flex justify-center items-center h-[calc(100vh-80px)]">Loading Messages...</div>;
  }

  const filteredMessages = (messages || []).filter((msg: any) => 
    msg.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
    msg.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-4 sm:p-6 rounded-[32px] shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 truncate">Message Center</h1>
            <p className="text-xs sm:text-sm text-slate-500 break-words font-medium">System alerts, updates, and recent transaction notifications</p>
          </div>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold w-full sm:w-64 focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="font-semibold text-sm">No messages found in the system.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMessages.map((msg: any) => (
              <div 
                key={msg._id} 
                onDoubleClick={() => handleDoubleClick(msg._id, msg.isRead)}
                className={`p-6 flex items-start gap-4 transition-colors select-none cursor-pointer border-l-4 ${
                  msg.isRead ? 'bg-white border-transparent hover:bg-slate-50/50' : 'bg-brand-accent/5 border-brand-accent hover:bg-brand-accent/10'
                }`}
                title="Double-click to mark as seen"
              >
                <div className="mt-1 relative">
                  {!msg.isRead && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-white"></span>
                  )}
                  {getIcon(msg.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-2">
                    <h3 className={`break-words ${msg.isRead ? 'text-slate-800 font-semibold' : 'text-black font-bold'}`}>
                      {msg.action}
                    </h3>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full shrink-0">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm break-words ${msg.isRead ? 'text-slate-500 font-normal' : 'text-black font-bold'}`}>
                    {msg.message}
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
