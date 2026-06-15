import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IndianRupee, 
  Building2, 
  Users, 
  TrendingUp,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  ChevronDown,
  X,
  Printer
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'Restro': return 'bg-orange-50 text-orange-600';
    case 'Bar': return 'bg-purple-50 text-purple-600';
    case 'Cafe': return 'bg-amber-50 text-amber-700';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const InvoiceModal: React.FC<{ txn: any; onClose: () => void }> = ({ txn, onClose }) => {
  const invoiceNo = `RH-${txn.businessAdminCode}-${new Date(txn.createdAt).getFullYear()}`;
  const expiryStr = txn.subscriptionExpiry
    ? new Date(txn.subscriptionExpiry).toLocaleDateString('en-IN', { dateStyle: 'long' })
    : 'N/A';

  const handlePrint = () => {
    const printContents = document.getElementById('invoice-print-area')?.innerHTML;
    const win = window.open('', '_blank', 'width=700,height=900');
    if (win && printContents) {
      win.document.write(`
        <html><head><title>Invoice ${invoiceNo}</title>
        <style>
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 32px; color: #1e293b; }
          .header { background: #0f172a; color: white; padding: 32px; border-radius: 16px 16px 0 0; }
          .brand { font-size: 24px; font-weight: 900; } .brand span { color: #f59e0b; }
          .subtitle { color: #94a3b8; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px; }
          .meta { display: flex; justify-content: space-between; margin-top: 24px; }
          .meta-label { color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
          .meta-value { color: white; font-weight: 700; font-family: monospace; margin-top: 4px; }
          .body { padding: 32px; border: 1px solid #f1f5f9; border-top: none; border-radius: 0 0 16px 16px; }
          .row { display: flex; gap: 48px; margin-bottom: 24px; }
          .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 8px; }
          .biz-name { font-size: 18px; font-weight: 800; } .detail { color: #64748b; font-size: 13px; margin-top: 2px; }
          .code { font-family: monospace; font-size: 18px; font-weight: 800; color: #f59e0b; }
          .badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: #ecfdf5; color: #059669; }
          .divider { border: none; border-top: 1px solid #f1f5f9; margin: 16px 0; }
          .line-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
          .tags { display: flex; gap: 4px; margin-top: 6px; }
          .tag { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 99px; background: #f1f5f9; color: #475569; }
          .total-box { background: #f8fafc; padding: 20px 24px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
          .total-label { font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #475569; }
          .total-value { font-size: 28px; font-weight: 900; }
          .amount { font-weight: 700; font-size: 16px; }
          .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; }
        </style></head><body>
        <div class="header">
          <div class="brand">Restro<span>Hub</span></div>
          <div class="subtitle">Platform Invoice</div>
          <div class="meta">
            <div><div class="meta-label">Invoice No.</div><div class="meta-value">${invoiceNo}</div></div>
            <div style="text-align:right"><div class="meta-label">Date</div><div class="meta-value">${new Date(txn.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div></div>
          </div>
        </div>
        <div class="body">
          <div class="row">
            <div>
              <div class="section-label">Bill To</div>
              <div class="biz-name">${txn.businessName}</div>
              <div class="detail">${txn.ownerName}</div>
              <div class="detail">${txn.ownerEmail}</div>
              <div class="detail">${txn.ownerPhone}</div>
            </div>
            <div>
              <div class="section-label">Business Code</div>
              <div class="code">${txn.businessAdminCode}</div>
              <div class="detail" style="margin-top:8px">Subscription Status</div>
              <div class="badge">${txn.status}</div>
            </div>
          </div>
          <hr class="divider" />
          <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:8px">
            <span>Description</span><span>Amount</span>
          </div>
          <div class="line-item">
            <div>
              <div style="font-weight:700">Platform Subscription</div>
              <div class="tags">${txn.platforms.map((p: string) => `<span class="tag">${p}</span>`).join('')}</div>
            </div>
            <div class="amount">₹${txn.amount.toLocaleString('en-IN')}</div>
          </div>
          <div class="line-item">
            <div style="color:#64748b">Valid Until</div>
            <div style="font-weight:600">${expiryStr}</div>
          </div>
          <div class="total-box">
            <div class="total-label">Total Paid</div>
            <div class="total-value">₹${txn.amount.toLocaleString('en-IN')}</div>
          </div>
          <div class="footer">Thank you for choosing RestroHub &bull; support@restrohub.com</div>
        </div>
        </body></html>
      `);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `📋 *RestroHub Platform Invoice*\n\n` +
      `Invoice No: ${invoiceNo}\n` +
      `Business: ${txn.businessName}\n` +
      `Owner: ${txn.ownerName}\n` +
      `Phone: ${txn.ownerPhone}\n` +
      `Platforms: ${txn.platforms.join(', ')}\n` +
      `Amount Paid: ₹${txn.amount.toLocaleString('en-IN')}\n` +
      `Valid Until: ${expiryStr}\n` +
      `Status: ${txn.status}\n\n` +
      `Thank you for choosing RestroHub! 🙏`
    );
    window.open(`https://wa.me/${txn.ownerPhone?.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Invoice Header */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10" />
            {/* Top bar: Back + Title */}
            <div className="relative z-10 flex items-center justify-between mb-6">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back
              </button>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Platform Invoice</span>
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>
            {/* Brand */}
            <div className="relative z-10">
              <h2 className="text-3xl font-black font-display tracking-tight">
                <span className="text-white">Restro</span><span className="text-brand-accent">Hub</span>
              </h2>
            </div>
            {/* Invoice meta */}
            <div className="relative z-10 mt-5 flex justify-between items-end">
              <div>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Invoice No.</p>
                <p className="text-white font-bold font-mono text-base mt-1">{invoiceNo}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Date</p>
                <p className="text-white font-semibold mt-1">{new Date(txn.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
              </div>
            </div>
          </div>

          {/* Invoice Body */}
          <div className="p-7 space-y-5 overflow-y-auto custom-scrollbar flex-1" id="invoice-print-area">
            {/* Bill To / Business Code */}
            <div className="flex gap-6">
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Bill To</p>
                <p className="font-bold text-slate-900 text-base">{txn.businessName}</p>
                <p className="text-sm text-slate-500 mt-0.5">{txn.ownerName}</p>
                <p className="text-sm text-slate-500">{txn.ownerEmail}</p>
                <p className="text-sm text-slate-500">{txn.ownerPhone}</p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Business Code</p>
                <p className="font-mono font-black text-brand-accent text-xl">{txn.businessAdminCode}</p>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-semibold">Status</p>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full inline-block mt-1 ${
                  txn.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>{txn.status}</span>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Line Items */}
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between items-start py-3 border-b border-slate-100 px-1">
                <div>
                  <p className="font-bold text-slate-900">Platform Subscription</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {txn.platforms.map((p: string) => (
                      <span key={p} className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getPlatformColor(p)}`}>{p}</span>
                    ))}
                  </div>
                </div>
                <p className="font-bold text-slate-900 text-base">₹{txn.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex justify-between items-center py-3 px-1">
                <p className="text-slate-500 text-sm">Valid Until</p>
                <p className="font-semibold text-slate-700 text-sm">{expiryStr}</p>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 flex justify-between items-center">
              <p className="font-bold text-slate-300 uppercase tracking-wider text-xs">Total Paid</p>
              <p className="text-2xl font-black text-white">₹{txn.amount.toLocaleString('en-IN')}</p>
            </div>

            <p className="text-center text-[11px] text-slate-400">Thank you for choosing RestroHub • support@restrohub.com</p>
          </div>

          {/* Action Buttons */}
          <div className="p-5 border-t border-slate-100 grid grid-cols-3 gap-3 shrink-0 bg-slate-50/50">
            {/* Back */}
            <button
              onClick={onClose}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors font-semibold text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back
            </button>
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bc5a] text-white transition-colors font-semibold text-xs shadow-lg shadow-green-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-brand-accent hover:bg-brand-accent/90 text-white transition-colors font-semibold text-xs shadow-lg shadow-brand-accent/20"
            >
              <Printer size={20} />
              Print
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};




export const SuperAdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    monthlyRecurringRevenue: 0,
    activeBusinesses: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    chartData: [] as any[]
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [txnLoading, setTxnLoading] = useState(true);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [timeFilter, setTimeFilter] = useState('Last 6 Months');
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [txnSearch, setTxnSearch] = useState('');
  const [showAllTxns, setShowAllTxns] = useState(false);
  const timeOptions = ['Last 7 Days', 'Last 30 Days', 'Last 6 Months', 'Last Year'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${baseUrl}/analytics/superadmin`, { headers });
        const data = await response.json();
        if (data.status === 'success') setMetrics(data.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${baseUrl}/analytics/superadmin/transactions`, { headers });
        const data = await response.json();
        if (data.status === 'success') setTransactions(data.data);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setTxnLoading(false);
      }
    };

    fetchAnalytics();
    fetchTransactions();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  const filteredTxns = transactions.filter(t =>
    t.businessName?.toLowerCase().includes(txnSearch.toLowerCase()) ||
    t.ownerName?.toLowerCase().includes(txnSearch.toLowerCase()) ||
    t.businessAdminCode?.toLowerCase().includes(txnSearch.toLowerCase())
  );

  const displayedTxns = showAllTxns ? filteredTxns : filteredTxns.slice(0, 6);

  return (
    <div className="p-4 sm:p-8 pb-24 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Monthly Recurring Revenue", value: isLoading ? '...' : formatCurrency(metrics.monthlyRecurringRevenue), change: "+15%", icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50", gradient: "from-emerald-500 to-green-400" },
          { title: "Active Businesses", value: isLoading ? '...' : metrics.activeBusinesses.toString(), change: "+8", icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50", gradient: "from-indigo-500 to-blue-400" },
          { title: "Total Users", value: isLoading ? '...' : metrics.totalUsers.toString(), change: "+12%", icon: Users, color: "text-violet-600", bg: "bg-violet-50", gradient: "from-violet-500 to-purple-400" },
          { title: "Active Subscriptions", value: isLoading ? '...' : metrics.activeSubscriptions.toString(), change: "+5", icon: CreditCard, color: "text-rose-600", bg: "bg-rose-50", gradient: "from-rose-500 to-pink-400" }
        ].map((metric, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 border border-slate-100 flex items-center justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:opacity-10 transition-opacity" />
             <div className="relative z-10 flex-1 pr-2">
                <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider text-[10px] sm:text-[11px] break-words">{metric.title}</p>
                <div className="flex items-center gap-3">
                   <h3 className="text-2xl font-semibold text-slate-900 font-display tracking-tight break-words">{metric.value}</h3>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                   <span className={`inline-flex shrink-0 items-center text-[10px] sm:text-xs font-semibold ${metric.color} ${metric.bg} px-2 py-1 rounded-lg`}>
                     <TrendingUp className="w-3 h-3 mr-1" />
                     {metric.change}
                   </span>
                   <span className="text-[10px] sm:text-xs text-slate-400 font-medium">vs last month</span>
                </div>
             </div>
             <div className={`relative z-10 shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${metric.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className="w-5 h-5 sm:w-6 sm:h-6" />
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
         {/* Main Chart Area */}
         <div className="lg:col-span-2 bg-white rounded-3xl p-4 sm:p-8 border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
               <h3 className="text-xl font-semibold text-slate-900 truncate">Revenue Growth</h3>
               <div className="relative w-full sm:w-auto z-20">
                 <button 
                   onClick={() => setShowTimeFilter(!showTimeFilter)}
                   className="bg-slate-50 border-2 border-slate-50 outline-none font-semibold text-slate-500 rounded-xl px-4 py-2 w-full flex items-center justify-between gap-3 text-sm sm:text-base cursor-pointer hover:border-slate-200 transition-colors"
                 >
                   {timeFilter}
                   <ChevronDown className="w-4 h-4 text-slate-400" />
                 </button>
                 {showTimeFilter && (
                   <div className="absolute top-full right-0 left-0 sm:left-auto sm:min-w-[160px] mt-2 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden">
                     {timeOptions.map(opt => (
                       <button 
                         key={opt}
                         onClick={() => { setTimeFilter(opt); setShowTimeFilter(false); }}
                         className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors ${timeFilter === opt ? 'text-brand-accent bg-brand-accent/5' : 'text-slate-600'}`}
                       >
                         {opt}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
            </div>
            <div className="w-full h-[300px] sm:h-[350px]">
               {isLoading ? (
                 <div className="w-full h-full bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                    <p className="font-semibold uppercase tracking-widest text-sm">Loading Chart Data...</p>
                 </div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                   <AreaChart data={metrics.chartData}>
                     <defs>
                       <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(value) => `₹${(value/1000)}k`} />
                     <Tooltip 
                       contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                   </AreaChart>
                 </ResponsiveContainer>
               )}
            </div>
         </div>

         {/* Alerts */}
         <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2 truncate">
               <AlertCircle className="w-5 h-5 text-orange-500" />
               System Alerts
            </h3>
            <div className="space-y-4 flex-1">
               {[
                 { msg: "Payment failed for 'Spice Symphony'", time: "10 mins ago", type: "error" },
                 { msg: "New business 'Cafe Mocha' registered", time: "1 hour ago", type: "success" },
                 { msg: "Server load exceeding 80% threshold", time: "2 hours ago", type: "warning" },
                 { msg: "Daily backup completed successfully", time: "5 hours ago", type: "info" }
               ].map((alert, i) => (
                 <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      alert.type === 'error' ? 'bg-red-500' : 
                      alert.type === 'success' ? 'bg-green-500' :
                      alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <div>
                       <p className="font-semibold text-slate-700 text-sm break-words">{alert.msg}</p>
                       <p className="text-xs font-medium text-slate-400 mt-1 break-words">{alert.time}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* ── Subscription Transaction History ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Subscription Transaction History</h3>
              <p className="text-xs text-slate-400 font-medium">Plan purchases, upgrades & renewals for all business accounts</p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={txnSearch}
              onChange={(e) => setTxnSearch(e.target.value)}
              placeholder="Search business or code..."
              className="w-full pl-4 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-accent/20 outline-none bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                {['Invoice', 'Business', 'Owner Details', 'Platforms', 'Amount', 'Expiry', 'Status', ''].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {txnLoading ? (
                <tr><td colSpan={8} className="p-10 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading transactions...
                </td></tr>
              ) : filteredTxns.length === 0 ? (
                <tr><td colSpan={8} className="p-10 text-center text-slate-400">
                  <Receipt className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  No subscription transactions found
                </td></tr>
              ) : displayedTxns.map((txn, idx) => {
                const expiryDate = txn.subscriptionExpiry ? new Date(txn.subscriptionExpiry) : null;
                const isExpired = expiryDate && expiryDate < new Date();
                const isExpiringSoon = expiryDate && !isExpired && (expiryDate.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000;
                const invoiceNo = `RH-${txn.businessAdminCode}-${new Date(txn.createdAt).getFullYear()}`;
                return (
                  <motion.tr
                    key={txn.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-brand-accent font-mono">{invoiceNo}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(txn.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">{txn.businessName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{txn.businessAdminCode}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700">{txn.ownerName}</p>
                      <p className="text-[10px] text-slate-400">{txn.ownerEmail}</p>
                      <p className="text-[10px] text-slate-400">{txn.ownerPhone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {txn.platforms.map((p: string) => (
                          <span key={p} className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getPlatformColor(p)}`}>{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">₹{txn.amount.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-sm font-semibold ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-amber-500' : 'text-slate-600'}`}>
                        {isExpired ? <XCircle size={14} /> : isExpiringSoon ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                        {expiryDate ? expiryDate.toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A'}
                      </div>
                      {isExpired && <p className="text-[10px] text-red-400 font-medium">Expired</p>}
                      {isExpiringSoon && <p className="text-[10px] text-amber-500 font-medium">Expiring soon</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        txn.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>{txn.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedTxn(txn)}
                        className="text-[10px] font-bold uppercase tracking-widest text-brand-accent hover:underline opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        <Receipt size={12} /> Invoice
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* View All / Show Less footer */}
        {filteredTxns.length > 6 && (
          <div className="p-4 border-t border-slate-100 text-center bg-slate-50/50">
            <button
              onClick={() => setShowAllTxns(prev => !prev)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-brand-accent hover:text-brand-accent text-slate-600 text-sm font-bold transition-all"
            >
              {showAllTxns ? (
                <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg> Show Less</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg> View All {filteredTxns.length} Transactions</>
              )}
            </button>
          </div>
        )}
      </motion.div>

      {/* Invoice Modal */}
      {selectedTxn && <InvoiceModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} />}
    </div>
  );
};
