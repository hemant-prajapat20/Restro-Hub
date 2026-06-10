import React from 'react';
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
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

export const Reports: React.FC = () => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['businessReports'],
    queryFn: async () => {
      const response = await api.get('/analytics/business/reports');
      return response.data.data;
    }
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center h-[calc(100vh-80px)]">Loading Reports...</div>;
  }

  const { netRevenue, totalGst, operatingCost, netProfit, recentInvoices } = reports;
  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar pb-24 font-[Inter] font-semibold">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
             <h3 className="text-2xl font-semibold font-display text-slate-900">Financial Audit & GST</h3>
             <p className="text-slate-500 font-medium">Enterprise compliance and detailed profit analysis</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                <Calendar size={18} />
                April 2026
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-brand-primary/10">
                <Download size={18} />
                Export Tally/Excel
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Net Revenue', value: `₹${netRevenue.toLocaleString()}`, trend: 15.2, icon: BarChart3, color: 'blue' },
            { label: 'Total GST (5%)', value: `₹${totalGst.toLocaleString()}`, trend: 12.8, icon: Calculator, color: 'emerald' },
            { label: 'Operating Cost', value: `₹${operatingCost.toLocaleString()}`, trend: -4.2, icon: ArrowDownRight, color: 'orange' },
            { label: 'Net Profit', value: `₹${netProfit.toLocaleString()}`, trend: 22.4, icon: ArrowUpRight, color: 'brand-accent' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-8 rounded-[32px] shadow-soft border border-stone-200/80 flex flex-col gap-4 h-full justify-between">
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

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[32px] border border-stone-200/80 shadow-soft overflow-hidden h-full flex flex-col">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h5 className="font-semibold font-display text-slate-900">Recent Invoices</h5>
                <div className="relative">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="text" 
                     placeholder="Search Bill #" 
                     className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-accent/10"
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
                        <tr key={invoice.id} className="hover:bg-slate-50/50 transition-all group">
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
             <div className="bg-brand-primary p-8 rounded-[32px] text-white relative overflow-hidden h-full flex flex-col">
                <div className="relative z-10 flex flex-col h-full gap-8">
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
    </div>
  );
};
