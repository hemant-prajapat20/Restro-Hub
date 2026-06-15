import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  ShoppingBag, 
  Timer,
  AlertCircle,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { io } from 'socket.io-client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

const StatCard = ({ title, value, subValue, trend, icon: Icon, color }: any) => (
  <div className="bg-white p-5 rounded-[32px] shadow-soft border border-stone-200/80 flex items-start justify-between h-full">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-semibold font-display text-slate-900">{value}</h3>
      <div className="flex items-center gap-1.5 mt-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
          trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </span>
        <span className="text-[10px] text-slate-400 font-medium uppercase">{subValue}</span>
      </div>
    </div>
    <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
      <Icon size={24} />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [graphPeriod, setGraphPeriod] = React.useState<'Today' | 'This Week'>('Today');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.on('newOrder', () => {
      queryClient.invalidateQueries({ queryKey: ['businessAnalytics'] });
    });
    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['businessAnalytics'],
    queryFn: async () => {
      const response = await api.get('/analytics/business');
      return response.data.data;
    }
  });

  if (isLoading) {
    return <div className="p-5 flex justify-center items-center h-[calc(100vh-80px)]">Loading Dashboard...</div>;
  }

  const { dailyRevenue, totalRevenue, totalOrders, activeTotalStaff, avgTableTurnTime, salesData, weeklySalesData, categoryData, topItems, aiInsights } = analytics;

  const currentGraphData = graphPeriod === 'Today' ? salesData : weeklySalesData;

  return (
    <div className="px-8 pt-8 pb-0 space-y-8 max-w-[1600px] mx-auto overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar font-[Inter] font-semibold">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue?.toLocaleString() || 0}`} 
          subValue="all time" 
          trend={4.2} 
          icon={ShoppingBag}
          color="orange"
        />
        <StatCard 
          title="Today Revenue" 
          value={`₹${dailyRevenue.toLocaleString()}`} 
          subValue="vs yesterday" 
          trend={12.5} 
          icon={CreditCard}
          color="blue"
        />
        <StatCard 
          title="Today Total Order" 
          value={totalOrders || 0} 
          subValue="today's count" 
          trend={5.4} 
          icon={Timer}
          color="amber"
        />
        <StatCard 
          title="Total Staff" 
          value={activeTotalStaff || 0} 
          subValue="currently active" 
          trend={2.1} 
          icon={Users}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-[32px] shadow-soft border border-stone-200/80 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-semibold font-display">Revenue Velocity</h4>
              <p className="text-sm text-slate-500">Live sales performance across day parts</p>
            </div>
            <select 
              value={graphPeriod}
              onChange={(e) => setGraphPeriod(e.target.value as 'Today' | 'This Week')}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
            </select>
          </div>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={currentGraphData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 12}}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#2563EB" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights & Alerts */}
        <div className="bg-brand-sidebar p-5 rounded-[32px] shadow-soft text-white relative overflow-hidden h-full flex flex-col">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="text-brand-accent fill-brand-accent" size={20} />
              <h4 className="text-lg font-semibold font-display uppercase tracking-wider text-slate-300 text-sm">AI Business Insights</h4>
            </div>
            <div className="space-y-4">
              {aiInsights && aiInsights.length > 0 ? aiInsights.map((insight: any, index: number) => (
                <div key={index} className="bg-white/10 p-4 rounded-xl border border-white/10">
                  <p className="text-sm font-medium mb-1">{insight.title}</p>
                  <p className="text-xs text-slate-400">{insight.description}</p>
                  {insight.action && (
                    <button className="mt-3 text-xs font-semibold text-brand-accent hover:underline">{insight.action}</button>
                  )}
                </div>
              )) : (
                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                  <p className="text-xs text-slate-400">Not enough data to generate insights yet.</p>
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-brand-accent opacity-10 rounded-full blur-3xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-[32px] shadow-soft border border-stone-200/80 h-full flex flex-col">
           <h4 className="text-lg font-semibold font-display mb-6">Sales Mix by Category</h4>
           <div className="flex flex-col lg:flex-row items-center gap-5 h-auto lg:h-[250px] min-w-0">
             <div className="w-full lg:w-1/2 h-[250px] lg:h-full min-w-0 flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                 <PieChart>
                   <Pie
                     data={categoryData}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {categoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="w-full lg:w-1/2 space-y-4">
               {categoryData.map((cat) => (
                 <div key={cat.name} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: cat.color}} />
                     <span className="text-sm font-medium text-slate-600">{cat.name}</span>
                   </div>
                   <span className="text-sm font-semibold">{cat.value}%</span>
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white p-5 rounded-[32px] shadow-soft border border-stone-200/80 h-full flex flex-col">
           <h4 className="text-lg font-semibold font-display mb-6">Top Performing Items</h4>
           <div className="space-y-4">
              {topItems && topItems.length > 0 ? topItems.map((item: any) => (
                <div key={item.name} className="space-y-2">
                   <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.sales} units sold</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{item.revenue}</p>
                   </div>
                   <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-brand-accent rounded-full"
                      />
                   </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500 font-medium">No sales data available yet.</p>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Recent Transactions Widget */}
        <div className="bg-white p-6 rounded-[32px] shadow-soft border border-stone-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold font-display">Recent Transactions</h4>
              <p className="text-sm text-slate-500">Last 6 platform transactions</p>
            </div>
            <button className="text-xs font-semibold text-brand-primary uppercase tracking-widest hover:underline" onClick={() => window.location.href = '/admin/transactions'}>View All</button>
          </div>
          <div className="overflow-x-auto custom-scrollbar w-full pb-2">
            <table className="w-full min-w-[500px] text-left">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Bill ID</th>
                     <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">Module</th>
                     <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  <RecentTransactionsTable />
               </tbody>
            </table>
          </div>
        </div>

        {/* Live Staff Activity Widget */}
        <div className="bg-white p-6 rounded-[32px] shadow-soft border border-stone-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold font-display">Live Staff Activity</h4>
              <p className="text-sm text-slate-500">Currently clocked in members</p>
            </div>
            <button className="text-xs font-semibold text-brand-primary uppercase tracking-widest hover:underline" onClick={() => window.location.href = '/admin/staff'}>View All</button>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
             <LiveStaffWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentTransactionsTable = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['recentOrdersWidget'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data.slice(0, 6);
    }
  });

  if (isLoading) return <tr><td colSpan={3} className="p-4 text-center text-slate-400 font-medium">Loading transactions...</td></tr>;
  if (!orders || orders.length === 0) return <tr><td colSpan={3} className="p-4 text-center text-slate-400 font-medium">No recent transactions</td></tr>;

  return (
    <>
      {orders.map((invoice: any) => {
        const invId = invoice._id || invoice.id || '';
        const shortId = invId ? invId.slice(-8).toUpperCase() : 'N/A';
        return (
          <tr key={invId} onClick={() => window.open(`/invoice/${invId}`, '_blank')} className="hover:bg-slate-50/50 transition-all group cursor-pointer">
             <td className="px-6 py-4">
                <p className="text-sm font-semibold text-brand-primary">#{shortId}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">{new Date(invoice.createdAt || invoice.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
             </td>
           <td className="px-6 py-4 text-center">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-widest">{invoice.type}</span>
           </td>
           <td className="px-6 py-4 text-center font-bold text-sm text-emerald-600">₹{invoice.total?.toLocaleString() || invoice.amount?.toLocaleString()}</td>
        </tr>
        )
      })}
    </>
  );
};

const LiveStaffWidget = () => {
  const { data: staff, isLoading } = useQuery({
    queryKey: ['staffActivityWidget'],
    queryFn: async () => {
      const res = await api.get('/staff');
      return res.data.filter((s: any) => s.status === 'Clocked In' || s.status === 'On Break').slice(0, 5);
    }
  });

  if (isLoading) return <div className="text-center text-slate-400 font-medium py-4">Loading staff activity...</div>;
  if (!staff || staff.length === 0) return <div className="text-center text-slate-400 font-medium py-4">No staff currently clocked in</div>;

  return (
    <>
      {staff.map((member: any) => (
        <div key={member._id} className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-accent/10 border-2 border-white shadow-sm">
              <img src={member.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{member.name}</p>
              <p className="text-xs text-slate-500">{member.role}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest ${member.status === 'Clocked In' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {member.status}
          </span>
        </div>
      ))}
    </>
  );
};
