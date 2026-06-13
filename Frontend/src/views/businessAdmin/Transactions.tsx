import React, { useState } from 'react';
import { 
  FileText, 
  Search,
  Lock,
  Receipt,
  X,
  Send,
  Printer,
  Download
} from 'lucide-react';
import { motion, AnimatePresence as FramerAnimatePresence } from 'motion/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import { generateReceiptPDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

export const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.on('newOrder', () => {
      queryClient.invalidateQueries({ queryKey: ['businessReportsAll'] });
    });
    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['businessReportsAll'],
    queryFn: async () => {
      // Reusing the reports endpoint which fetches all recentInvoices
      // In a real production app, this would be a paginated /api/orders endpoint
      const response = await api.get('/analytics/business/reports');
      return response.data.data;
    }
  });

  if (isLoading) {
    return <div className="p-5 flex justify-center items-center h-[calc(100vh-80px)]">Loading Transactions...</div>;
  }

  const { recentInvoices } = reports || { recentInvoices: [] };

  const filteredInvoices = recentInvoices.filter((inv: any) => {
    const invId = inv._id || inv.id || '';
    return invId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.customerDetails?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="px-8 pt-8 pb-0 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
             <h3 className="text-2xl font-semibold font-display text-slate-900 flex items-center gap-3">
               <FileText className="w-8 h-8 text-brand-primary" />
               Transaction Ledger
             </h3>
             <p className="text-slate-500 font-medium">All historical platform transactions and digital invoices</p>
          </div>
       </div>

       <div className="bg-white rounded-[32px] border border-stone-200/80 shadow-soft overflow-hidden flex flex-col h-[calc(100vh-220px)]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <h5 className="font-semibold font-display text-slate-900 text-lg">Transaction History</h5>
             <div className="relative w-72">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Bill ID or Customer..." 
                  className="pl-12 pr-4 py-3 w-full bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                />
             </div>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
             <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                   <tr>
                      <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Bill ID & Date</th>
                      <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Customer Details</th>
                      <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">Module</th>
                      <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">Total Amount</th>
                      <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">Payment</th>
                      <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredInvoices.length === 0 ? (
                     <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-medium">No transactions found</td></tr>
                   ) : filteredInvoices.map((invoice: any) => {
                     const invId = invoice._id || invoice.id || '';
                     const shortId = invId ? invId.slice(-8).toUpperCase() : 'N/A';
                     return (
                     <tr key={invId} onClick={() => window.open(`/invoice/${invId}`, '_blank')} className="hover:bg-slate-50/50 transition-all group cursor-pointer">
                        <td className="px-6 py-4">
                           <p className="text-sm font-semibold text-brand-primary">#{shortId}</p>
                           <p className="text-[10px] font-semibold text-slate-400 mt-1">{new Date(invoice.createdAt || invoice.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-bold text-slate-900">{invoice.customerDetails?.name || 'Walk-in Customer'}</p>
                           <p className="text-[10px] font-semibold text-slate-400">{invoice.customerDetails?.phone || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                             invoice.source === 'Online' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                           }`}>
                             {invoice.source === 'Online' ? 'ONLINE ORDER' : invoice.type}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-sm text-slate-900">₹{invoice.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{invoice.paymentMethod || 'Cash'}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${invoice.status === 'Completed' || invoice.status === 'Served' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}>{invoice.status}</span>
                        </td>
                     </tr>
                     );
                   })}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};
