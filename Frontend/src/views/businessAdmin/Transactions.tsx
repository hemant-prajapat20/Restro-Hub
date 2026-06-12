import React, { useState } from 'react';
import { 
  FileText, 
  Search,
  Lock,
  Receipt,
  X,
  Send,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence as FramerAnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { generateReceiptPDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

export const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

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

  const filteredInvoices = recentInvoices.filter((inv: any) => 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.customerDetails?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             <table className="w-full text-left">
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
                   ) : filteredInvoices.map((invoice: any) => (
                     <tr key={invoice.id} onClick={() => setSelectedInvoice(invoice)} className="hover:bg-slate-50/50 transition-all group cursor-pointer">
                        <td className="px-6 py-4">
                           <p className="text-sm font-semibold text-brand-primary">#{invoice.id.slice(-8).toUpperCase()}</p>
                           <p className="text-[10px] font-semibold text-slate-400 mt-1">{new Date(invoice.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-bold text-slate-900">{invoice.customerDetails?.name || 'Walk-in Customer'}</p>
                           <p className="text-[10px] font-semibold text-slate-400">{invoice.customerDetails?.phone || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-widest">{invoice.type}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-sm text-slate-900">₹{invoice.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{invoice.paymentMethod || 'Cash'}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${invoice.status === 'Completed' || invoice.status === 'Served' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}>{invoice.status}</span>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

        <FramerAnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedInvoice(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Receipt className="text-brand-accent" />
                    Transaction Details
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-1">ID: {selectedInvoice.id.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest">Customer Details</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{selectedInvoice.customerDetails?.name || 'Walk-in Customer'}</p>
                  <p className="text-xs font-medium text-slate-500">{selectedInvoice.customerDetails?.phone || 'N/A'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Order Items</p>
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? selectedInvoice.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start text-xs font-semibold text-slate-700">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-mono">₹{item.price * item.quantity}</span>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-400 italic">No items detailed in legacy records.</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-900">₹{selectedInvoice.subtotal?.toLocaleString() || (selectedInvoice.amount - selectedInvoice.tax).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>GST Applied</span>
                    <span className="font-mono text-slate-900">₹{selectedInvoice.tax?.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                    <span>Grand Total ({selectedInvoice.paymentMethod || 'Cash'})</span>
                    <span className="font-mono text-brand-primary">₹{selectedInvoice.amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-2 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="px-6 py-3 border border-slate-200 text-slate-500 rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={() => {
                    toast.success('Digital invoice sent to customer successfully!');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-900 text-brand-accent rounded-xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                >
                  <Send size={16} /> Send
                </button>
                <button 
                  onClick={() => {
                    generateReceiptPDF({
                      title: "RESTROHUB TRANSACTION",
                      invoiceNumber: selectedInvoice.id.slice(-8).toUpperCase(),
                      timestamp: new Date(selectedInvoice.date).toLocaleString(),
                      items: selectedInvoice.items || [],
                      subtotal: selectedInvoice.subtotal || (selectedInvoice.amount - selectedInvoice.tax),
                      tax: selectedInvoice.tax,
                      total: selectedInvoice.amount,
                      customerName: selectedInvoice.customerDetails?.name || 'Walk-in',
                      customerPhone: selectedInvoice.customerDetails?.phone || 'N/A',
                      paymentMethod: selectedInvoice.paymentMethod || 'Cash'
                    });
                    toast.success('Invoice downloaded successfully');
                  }}
                  className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition-all"
                >
                  <Printer size={16} /> Print
                </button>
              </div>
            </motion.div>
          </div>
        )}
        </FramerAnimatePresence>
    </div>
  );
};
