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

import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

const StatCard = ({ title, value, subValue, trend, icon: Icon, color }: any) => (
  <div className="bg-white p-8 rounded-[32px] shadow-soft border border-stone-200/80 flex items-start justify-between h-full">
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
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['businessAnalytics'],
    queryFn: async () => {
      const response = await api.get('/analytics/business');
      return response.data.data;
    }
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center h-[calc(100vh-80px)]">Loading Dashboard...</div>;
  }

  const { dailyRevenue, totalOrders, activeCustomers, avgTableTurnTime, salesData, categoryData } = analytics;

  return (
    <div className="px-8 pt-8 pb-0 space-y-8 max-w-[1600px] mx-auto overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar font-[Inter] font-semibold">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Daily Revenue" 
          value={`₹${dailyRevenue.toLocaleString()}`} 
          subValue="vs yesterday" 
          trend={12.5} 
          icon={CreditCard}
          color="blue"
        />
        <StatCard 
          title="Total Orders" 
          value={totalOrders} 
          subValue="vs average" 
          trend={4.2} 
          icon={ShoppingBag}
          color="orange"
        />
        <StatCard 
          title="Active Customers" 
          value={activeCustomers} 
          subValue="current dining" 
          trend={-2.1} 
          icon={Users}
          color="emerald"
        />
        <StatCard 
          title="Avg. Table Turn Time" 
          value={avgTableTurnTime} 
          subValue="target 40m" 
          trend={-8.4} 
          icon={Timer}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-soft border border-stone-200/80 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-semibold font-display">Revenue Velocity</h4>
              <p className="text-sm text-slate-500">Live sales performance across day parts</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium">
              <option>Today</option>
              <option>Yesterday</option>
            </select>
          </div>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="99%" height={300}>
              <AreaChart data={salesData}>
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
        <div className="bg-brand-sidebar p-8 rounded-[32px] shadow-soft text-white relative overflow-hidden h-full flex flex-col">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="text-brand-accent fill-brand-accent" size={20} />
              <h4 className="text-lg font-semibold font-display uppercase tracking-wider text-slate-300 text-sm">AI Business Insights</h4>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <p className="text-sm font-medium mb-1">Stock Alert</p>
                <p className="text-xs text-slate-400">Chicken Breast stock is below threshold. Estimated depletion: 3.5 hours.</p>
                <button className="mt-3 text-xs font-semibold text-brand-accent hover:underline">REORDER NOW</button>
              </div>
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <p className="text-sm font-medium mb-1">Peak Prediction</p>
                <p className="text-xs text-slate-400">High traffic predicted at 7:30 PM due to local events. 12% increase expected.</p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <p className="text-sm font-medium mb-1">Upselling Opportunity</p>
                <p className="text-xs text-slate-400">Recommend "Mango Lassi" with "Biryani" - 24% conversion rate today.</p>
              </div>
            </div>
          </div>
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-brand-accent opacity-10 rounded-full blur-3xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-8 rounded-[32px] shadow-soft border border-stone-200/80 h-full flex flex-col">
           <h4 className="text-lg font-semibold font-display mb-6">Sales Mix by Category</h4>
           <div className="flex flex-col lg:flex-row items-center gap-8 h-auto lg:h-[250px] min-w-0">
             <div className="w-full lg:w-1/2 h-[250px] lg:h-full min-w-0 flex items-center justify-center">
               <ResponsiveContainer width="99%" height={250}>
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
        <div className="bg-white p-8 rounded-[32px] shadow-soft border border-stone-200/80 h-full flex flex-col">
           <h4 className="text-lg font-semibold font-display mb-6">Top Performing Items</h4>
           <div className="space-y-4">
              {[
                { name: 'Butter Chicken', sales: 142, revenue: '₹53,960', progress: 100 },
                { name: 'Paneer Tikka', sales: 118, revenue: '₹37,760', progress: 85 },
                { name: 'Dal Makhani', sales: 94, revenue: '₹26,320', progress: 65 },
                { name: 'Garlic Naan', sales: 312, revenue: '₹18,720', progress: 50 },
              ].map((item) => (
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
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
