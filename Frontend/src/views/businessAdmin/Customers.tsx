import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Star, 
  TrendingUp, 
  Calendar,
  Mail,
  Phone,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  totalVisits: number;
  lifetimeSpent: number;
  lastVisit: string;
}

export const Customers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await api.get('/customers');
      return response.data;
    }
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  return (
    <div className="px-8 pt-8 pb-0 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 mb-2">Customer CRM</h1>
          <p className="text-slate-500">Manage loyalty, track visits, and view customer history</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-[24px] shadow-soft border border-stone-200/80 flex items-center gap-4">
          <div className="p-4 bg-brand-accent/10 rounded-2xl text-brand-accent">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Customers</p>
            <h3 className="text-2xl font-bold text-slate-900">{customers.length}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[24px] shadow-soft border border-stone-200/80 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
            <Star size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">VIP Members</p>
            <h3 className="text-2xl font-bold text-slate-900">{customers.filter(c => c.lifetimeSpent > 20000).length}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[24px] shadow-soft border border-stone-200/80 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Avg Lifetime Value</p>
            <h3 className="text-2xl font-bold text-slate-900">
              ₹{customers.length > 0 ? Math.round(customers.reduce((a, b) => a + b.lifetimeSpent, 0) / customers.length).toLocaleString() : 0}
            </h3>
          </div>
        </div>
      </div>

      {/* CRM List */}
      <div className="bg-white rounded-[32px] shadow-soft border border-stone-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-[350px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
            Filters
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Visits</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lifetime Value</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading customers...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No customers found</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={customer._id} 
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                          {customer.lifetimeSpent > 20000 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">VIP</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail size={14} className="text-slate-400" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-900">{customer.totalVisits}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-900">₹{customer.lifetimeSpent.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(customer.lastVisit).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="p-2 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
