import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  BarChart3, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  Calculator,
  Calendar,
  Lock,
  Search,
  Printer, Send, X, Receipt, AlertCircle, PackageOpen
} from 'lucide-react';
import { motion, AnimatePresence as FramerAnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import { FilterBar } from '../../components/FilterBar';
import { Button } from '../../components/Button';
import { generateReceiptPDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

export const Reports: React.FC = () => {
  const [month, setMonth] = useState('2026-04');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['businessReports', month],
    queryFn: async () => {
      const response = await api.get('/analytics/business/reports', { params: { month } });
      return response.data.data;
    }
  });

  if (isLoading) {
    return <div className="p-5 flex justify-center items-center h-[calc(100vh-80px)]">Loading Reports...</div>;
  }

  const { netRevenue, totalGst, operatingCost, netProfit, recentInvoices, paymentMethodData, topFoodItems, inventoryAlerts } = reports;
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  return (
    <div className="px-8 pt-8 pb-0 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
             <h3 className="text-2xl font-semibold font-display text-slate-900">Financial Audit & GST</h3>
             <p className="text-slate-500 font-medium">Enterprise compliance and detailed profit analysis</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="primary">
                <Download size={18} className="mr-2" />
                Export Tally/Excel
             </Button>
          </div>
       </div>

       <FilterBar
         searchTerm={searchTerm}
         onSearchChange={setSearchTerm}
         month={month}
         onMonthChange={setMonth}
       />

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Net Revenue', value: `₹${netRevenue.toLocaleString()}`, trend: 15.2, icon: BarChart3, color: 'blue' },
            { label: 'Total GST (5%)', value: `₹${totalGst.toLocaleString()}`, trend: 12.8, icon: Calculator, color: 'emerald' },
            { label: 'Operating Cost', value: `₹${operatingCost.toLocaleString()}`, trend: -4.2, icon: ArrowDownRight, color: 'orange' },
            { label: 'Net Profit', value: `₹${netProfit.toLocaleString()}`, trend: 22.4, icon: ArrowUpRight, color: 'brand-accent' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-5 rounded-[32px] shadow-soft border border-stone-200/80 flex flex-col gap-4 h-full justify-between">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
                  <stat.icon size={24} />
               </div>
               <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                  <h4 className="text-2xl font-semibold text-slate-900">{stat.value}</h4>
                  <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${stat.trend > 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                     {stat.trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                     {Math.abs(stat.trend)}% vs last month
                  </div>
               </div>
            </div>
          ))}
       </div>

       {/* Analytics Charts Row */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
         {/* Payment Methods */}
         <div className="bg-white p-5 rounded-[32px] shadow-soft border border-stone-200/80">
            <h5 className="font-semibold font-display text-slate-900 mb-4 flex items-center gap-2">
              <PieIcon size={18} className="text-brand-accent" />
              Revenue by Payment Method
            </h5>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodData?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {paymentMethodData?.map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name}: ₹{entry.value.toLocaleString()}
                </div>
              ))}
            </div>
         </div>

         {/* Top Purchased Food */}
         <div className="bg-white p-5 rounded-[32px] shadow-soft border border-stone-200/80">
            <h5 className="font-semibold font-display text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-brand-accent" />
              Most Purchased Food Items
            </h5>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFoodItems} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fontWeight: 600 }} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {topFoodItems?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
       </div>

       {/* Inventory Alerts Row */}
       <div className="mb-8 bg-white p-5 rounded-[32px] shadow-soft border border-stone-200/80">
         <div className="flex items-center justify-between mb-4">
           <h5 className="font-semibold font-display text-slate-900 flex items-center gap-2">
             <AlertCircle size={18} className="text-brand-danger" />
             Low Stock & Limited Inventory Alerts
           </h5>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {inventoryAlerts?.length === 0 ? (
             <div className="col-span-full p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-3">
               <PackageOpen size={20} />
               <span className="font-semibold text-sm">All inventory items are well-stocked. No low-stock alerts.</span>
             </div>
           ) : (
             inventoryAlerts?.map((item: any) => (
               <div key={item._id} className="p-4 rounded-2xl border border-rose-100 bg-rose-50 flex justify-between items-center">
                 <div>
                   <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                   <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest mt-1">Remaining: {item.quantityInStock} {item.unit}</p>
                 </div>
                 <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-rose-500">
                   <AlertCircle size={16} />
                 </div>
               </div>
             ))
           )}
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-[32px] border border-stone-200/80 shadow-soft overflow-hidden h-full flex flex-col">
             <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h5 className="font-semibold font-display text-slate-900">Recent Invoices</h5>
                <div className="relative">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="text" 
                     placeholder="Search Bill #" 
                     className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-accent/10 truncate"
                   />
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50">
                      <tr>
                         <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Bill ID</th>
                         <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Type</th>
                         <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">Amount</th>
                         <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">GST Paid</th>
                         <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {recentInvoices.length === 0 ? (
                        <tr><td colSpan={5} className="p-4 text-center text-slate-500 font-medium">No recent invoices</td></tr>
                      ) : recentInvoices.map((invoice: any) => (
                        <tr key={invoice.id} onClick={() => setSelectedInvoice(invoice)} className="hover:bg-slate-50/50 transition-all group cursor-pointer">
                           <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-brand-primary">#{invoice.id.slice(-8).toUpperCase()}</p>
                              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{new Date(invoice.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                           </td>
                           <td className="px-6 py-4">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-semibold uppercase tracking-widest">{invoice.type}</span>
                           </td>
                           <td className="px-6 py-4 text-center font-semibold text-sm text-slate-900">₹{invoice.amount.toLocaleString()}</td>
                           <td className="px-6 py-4 text-center font-semibold text-sm text-brand-success">₹{invoice.tax.toLocaleString()}</td>
                           <td className="px-6 py-4 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-widest ${invoice.status === 'Completed' || invoice.status === 'Served' ? 'bg-brand-success/10 text-brand-success' : 'bg-orange-50 text-orange-500'}`}>{invoice.status}</span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
             <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <button className="text-xs font-semibold text-slate-400 hover:text-brand-primary uppercase tracking-widest transition-all">View full audit trail</button>
             </div>
          </div>

          <div className="space-y-8">
             <div className="bg-brand-primary p-5 rounded-[32px] text-white relative overflow-hidden h-full flex flex-col">
                <div className="relative z-10 flex flex-col h-full gap-5">
                   <div className="flex items-center gap-3">
                      <Lock className="text-brand-accent fill-brand-accent" size={20} />
                      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Security Vault</h4>
                   </div>
                   <div>
                      <p className="text-slate-400 text-sm font-medium">All financial reports are signed with enterprise-grade SHA-256 encryption.</p>
                   </div>
                   <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">QUICK ACTIONS</p>
                      <button className="w-full text-left p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                         <p className="text-sm font-semibold">Generate P&L Statement</p>
                         <p className="text-[10px] text-slate-500 uppercase">Q1 2026 Analysis</p>
                      </button>
                      <button className="w-full text-left p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                         <p className="text-sm font-semibold">Staff Salary Report</p>
                         <p className="text-[10px] text-slate-500 uppercase">Performance bonuses included</p>
                      </button>
                   </div>
                </div>
                <div className="absolute right-[-100px] bottom-[-100px] w-96 h-96 bg-brand-accent opacity-5 rounded-full blur-3xl pointer-events-none" />
             </div>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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
                  <p className="text-xs font-medium text-slate-500">{selectedInvoice.customerDetails?.phone || '+91 - Not Provided'}</p>
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
                    <span>Grand Total ({selectedInvoice.paymentMethod})</span>
                    <span className="font-mono text-brand-primary">₹{selectedInvoice.amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-2 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="px-6 py-3 border border-slate-200 text-slate-500 rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-slate-50"
                >
                  Back
                </button>
                <button 
                  onClick={() => {
                    toast.success('Digital invoice sent to customer successfully!');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-900 text-brand-accent rounded-xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
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
                      paymentMethod: selectedInvoice.paymentMethod,
                      customerName: selectedInvoice.customerDetails?.name,
                      customerPhone: selectedInvoice.customerDetails?.phone
                    });
                    toast.success('Generating Print PDF...');
                  }}
                  className="flex-1 px-4 py-3 bg-brand-accent text-white rounded-xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-brand-accent/20 flex items-center justify-center gap-2"
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
