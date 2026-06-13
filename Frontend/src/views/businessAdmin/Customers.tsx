import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Star,
  TrendingUp, 
  Calendar,
  Phone,
  ChevronRight,
  Filter,
  Receipt,
  MessageCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

interface Transaction {
  _id: string;
  name: string;
  phone: string;
  type: string;
  total: number;
  date: string;
}

export const Customers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['customers-transactions'],
    queryFn: async () => {
      const response = await api.get('/customers');
      return response.data;
    }
  });

  const filteredTransactions = transactions.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.phone.includes(searchQuery) ||
    t._id.includes(searchQuery)
  );

  const customerSpends: Record<string, number> = {};
  transactions.forEach(t => {
    if (t.phone && t.phone !== 'N/A') {
      customerSpends[t.phone] = (customerSpends[t.phone] || 0) + t.total;
    }
  });
  const vvipCustomers = Object.values(customerSpends).filter(total => total > 20000).length;
  const totalTransactionValue = transactions.reduce((a, b) => a + b.total, 0);

  return (
    <div className="px-8 pt-8 pb-0 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 mb-2">Customer CRM & Logs</h1>
          <p className="text-slate-500">Track all global module transactions and customer details</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-[24px] shadow-soft border border-stone-200/80 flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-500">
            <Star size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">VVIP Customers</p>
            <h3 className="text-2xl font-bold text-slate-900">{vvipCustomers}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[24px] shadow-soft border border-stone-200/80 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
            <Receipt size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Transactions</p>
            <h3 className="text-2xl font-bold text-slate-900">{transactions.length}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[24px] shadow-soft border border-stone-200/80 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900">
              ₹{totalTransactionValue.toLocaleString()}
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
              placeholder="Search by name, phone, or ID..."
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
        
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Module</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading transactions...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No transactions found</td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={tx._id} 
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent font-bold">
                          {tx.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{tx.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        {tx.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        {tx._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        tx.type === 'Bar' ? 'bg-purple-100 text-purple-700' :
                        tx.type === 'Cafe' ? 'bg-amber-100 text-amber-700' :
                        tx.type === 'Signature' ? 'bg-rose-100 text-rose-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-emerald-600">₹{tx.total.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">{new Date(tx.date).toLocaleDateString()}</span>
                        <span className="text-xs text-slate-400">{new Date(tx.date).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tx.phone !== 'N/A' && (
                          <a 
                            href={`https://wa.me/${tx.phone.replace(/\D/g, '')}?text=Hello ${tx.name}, thank you for visiting Restrohub!`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Message on WhatsApp"
                          >
                            <MessageCircle size={20} />
                          </a>
                        )}
                      </div>
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
