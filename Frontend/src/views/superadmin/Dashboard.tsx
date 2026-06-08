import React from 'react';
import { motion } from 'motion/react';
import { 
  IndianRupee, 
  Building2, 
  Users, 
  TrendingUp,
  CreditCard,
  AlertCircle
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  return (
    <div className="p-8 pb-24">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Monthly Recurring Revenue", value: "₹24,50,000", change: "+15%", icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50", gradient: "from-emerald-500 to-green-400" },
          { title: "Active Businesses", value: "142", change: "+8", icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50", gradient: "from-indigo-500 to-blue-400" },
          { title: "Total Users", value: "15,489", change: "+12%", icon: Users, color: "text-violet-600", bg: "bg-violet-50", gradient: "from-violet-500 to-purple-400" },
          { title: "Active Subscriptions", value: "135", change: "+5", icon: CreditCard, color: "text-rose-600", bg: "bg-rose-50", gradient: "from-rose-500 to-pink-400" }
        ].map((metric, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 border border-slate-100 flex items-center justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:opacity-10 transition-opacity" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
             
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Chart Area */}
         <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-semibold text-slate-900 truncate">Revenue Growth</h3>
               <select className="bg-slate-50 border-none outline-none font-semibold text-slate-500 rounded-xl px-4 py-2">
                 <option>Last 6 Months</option>
                 <option>This Year</option>
               </select>
            </div>
            <div className="h-64 w-full bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
               <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
               <p className="font-semibold uppercase tracking-widest text-sm break-words">Revenue Chart Visualization</p>
               <p className="text-xs mt-2 break-words">Integrate Recharts here</p>
            </div>
         </div>

         {/* Alerts & Activity */}
         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
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
    </div>
  );
};
