import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, Shield, Key } from 'lucide-react';
import { motion } from 'motion/react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.status === 'success') {
          setUsers(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.businessAdminCode && user.businessAdminCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              placeholder="Search globally by email, name, or admin code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-accent font-medium transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400">User</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Admin Code</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Role</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-semibold">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-semibold">No users found.</td></tr>
              ) : (
                filteredUsers.map((user, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={user._id} 
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 break-words">{user.firstName} {user.lastName}</p>
                          <p className="text-sm font-medium text-slate-500 break-words">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.businessAdminCode ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-widest bg-brand-accent/10 text-brand-accent">
                          <Key className="w-3 h-3" />
                          {user.businessAdminCode}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm font-medium italic">N/A</span>
                      )}
                    </td>
                    <td className="p-4">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                         user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                       }`}>
                         {user.role === 'SUPER_ADMIN' && <Shield className="w-3 h-3" />}
                         {user.role.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
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
