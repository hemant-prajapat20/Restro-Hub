import React, { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

const MOCK_BUSINESSES = [
  { id: 1, name: "Spice Symphony", owner: "Rahul Sharma", plan: "Enterprise", status: "Active", outlets: 5 },
  { id: 2, name: "Cafe Mocha", owner: "Priya Singh", plan: "Pro", status: "Active", outlets: 2 },
  { id: 3, name: "Burger Point", owner: "Amit Kumar", plan: "Basic", status: "Suspended", outlets: 1 },
  { id: 4, name: "The Golden Dragon", owner: "Mei Lin", plan: "Enterprise", status: "Active", outlets: 8 },
];

export const Businesses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8 pb-24">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 font-display truncate">Business Management</h1>
          <p className="text-slate-500 mt-2 font-medium break-words">Manage all tenant restaurants and franchises.</p>
        </div>
        <button className="bg-brand-accent hover:bg-brand-accent/90 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg shadow-brand-accent/30 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          Register New Business
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search businesses by name or owner..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-accent font-medium transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-500 hover:text-brand-accent hover:border-brand-accent transition-colors flex items-center gap-2 font-semibold">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Business Name</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Owner</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Plan</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Outlets</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Status</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BUSINESSES.map((business, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={business.id} 
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary/5 text-brand-primary flex items-center justify-center">
                         <Building2 className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-slate-900 truncate">{business.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-600">{business.owner}</td>
                  <td className="p-4">
                     <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm truncate">
                       {business.plan}
                     </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-900">{business.outlets}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      business.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${business.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {business.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
