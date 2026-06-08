import React from 'react';
import { Users as UsersIcon, Search, Shield } from 'lucide-react';
import { motion } from 'motion/react';

const MOCK_USERS = [
  { id: 1, name: "System Root", email: "admin@restrohub.com", role: "Super Admin", lastActive: "Just now" },
  { id: 2, name: "Rahul Sharma", email: "rahul@spicesymphony.com", role: "Business Admin", lastActive: "2 hrs ago" },
  { id: 3, name: "Priya Singh", email: "priya@cafemocha.com", role: "Business Admin", lastActive: "1 day ago" },
];

export const Users: React.FC = () => {
  return (
    <div className="p-8 pb-24">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 font-display truncate">User Directory</h1>
          <p className="text-slate-500 mt-2 font-medium break-words">Global user management across all tenants.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search globally by email or name..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-accent font-medium transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400">User</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Role</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((user, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={user.id} 
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 break-words">{user.name}</p>
                        <p className="text-sm font-medium text-slate-500 break-words">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                     <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                       user.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                     }`}>
                       {user.role === 'Super Admin' && <Shield className="w-3 h-3" />}
                       {user.role}
                     </span>
                  </td>
                  <td className="p-4 font-medium text-slate-500">{user.lastActive}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
