import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  Smile, 
  DollarSign, 
  CheckCircle,
  X,
  Sparkles,
  Settings,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  shift: string;
  status: 'Clocked In' | 'On Break' | 'Off-Duty';
  salary: number;
  contact: string;
  email: string;
  score: number; // Quality / Performance rating
  image: string;
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const StaffManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Form states for New Staff
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'Male'|'Female'>('Male');
  const [newRole, setNewRole] = useState('');
  const [newShift, setNewShift] = useState<'Morning (6 AM - 2 PM)' | 'Evening (2 PM - 10 PM)' | 'Night (10 PM - 6 AM)' | 'General (10 AM - 7 PM)'>('General (10 AM - 7 PM)');
  const [newSalary, setNewSalary] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newScore, setNewScore] = useState('5.0');
  
  // Category management
  const [newCategoryName, setNewCategoryName] = useState('');

  const { data: crew = [], isLoading } = useQuery<StaffMember[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await api.get('/staff');
      return response.data.map((item: any) => ({
        ...item,
        id: item._id
      }));
    }
  });

  const { data: staffCategories = [], isLoading: categoriesLoading } = useQuery<string[]>({
    queryKey: ['staffCategories'],
    queryFn: async () => {
      const response = await api.get('/staff/categories');
      return response.data;
    }
  });

  const updateStaffCategoriesMutation = useMutation({
    mutationFn: async (categories: string[]) => {
      await api.post('/staff/categories', { categories });
    },
    onSuccess: () => {
      toast.success('Staff categories updated');
      queryClient.invalidateQueries({ queryKey: ['staffCategories'] });
    },
    onError: () => toast.error('Failed to update categories')
  });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await api.put(`/staff/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    }
  });

  const addStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/staff', data);
    },
    onSuccess: () => {
      toast.success('Staff onboarded successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setNewName('');
      setNewSalary('');
      setNewContact('');
      setNewEmail('');
      setNewGender('Male');
      setShowAddModal(false);
      setEditingStaffId(null);
    },
    onError: () => toast.error('Failed to save staff details')
  });

  const filteredCrew = crew.filter(member => {
    const matchesCategory = selectedRoleFilter === 'All' || member.role === selectedRoleFilter;
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpdateStatus = (memberId: string, nextStatus: 'Clocked In' | 'On Break' | 'Off-Duty') => {
    updateStaffMutation.mutate({ id: memberId, data: { status: nextStatus } });
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSalary || !newContact) return;

    const assignedRole = newRole || (staffCategories.length > 0 ? staffCategories[0] : 'Staff');

    const isFemale = newGender === 'Female';
    const seedName = isFemale ? `Sophia-${newName}` : `Felix-${newName}`;
    
    // Use explicit hair styles to guarantee gender appearance in avataaars
    const avatarParams = isFemale 
      ? `&hair=longHairStraight,longHairCurly,longHairMiaWallace&clothing=blazerAndSweater,collarAndSweater`
      : `&hair=shortHairShortFlat,shortHairShortWaved,shortHairTheCaesar&clothing=blazerAndShirt,shirtCrewNeck&facialHairProbability=20`;

    const staffData = {
      name: newName,
      role: assignedRole,
      shift: newShift,
      salary: Number(newSalary),
      contact: newContact,
      email: newEmail || `${newName.toLowerCase().replace(/\s/g, '')}@indiserve.pro`,
      score: Number(newScore) || 5.0,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedName}${avatarParams}`
    };

    if (editingStaffId) {
      updateStaffMutation.mutate({ id: editingStaffId, data: staffData });
      toast.success('Staff updated successfully');
      setShowAddModal(false);
      setEditingStaffId(null);
      // Reset form
      setNewName(''); setNewSalary(''); setNewContact(''); setNewEmail(''); setNewGender('Male');
    } else {
      addStaffMutation.mutate({ ...staffData, status: 'Off-Duty' });
    }
  };

  const handleEditClick = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setNewName(staff.name);
    setNewRole(staff.role);
    setNewShift(staff.shift as any);
    setNewSalary(staff.salary.toString());
    setNewContact(staff.contact);
    setNewEmail(staff.email);
    setNewScore(staff.score.toString());
    
    // Infer gender from image URL (since we used Sophia or Felix)
    if (staff.image && staff.image.includes('Sophia')) {
       setNewGender('Female');
    } else {
       setNewGender('Male');
    }
    
    setShowAddModal(true);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (staffCategories.includes(newCategoryName.trim())) {
      toast.error('Category already exists');
      return;
    }
    const newCategories = [...staffCategories, newCategoryName.trim()];
    updateStaffCategoriesMutation.mutate(newCategories);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (category: string) => {
    const newCategories = staffCategories.filter(c => c !== category);
    updateStaffCategoriesMutation.mutate(newCategories);
  };

  if (isLoading || categoriesLoading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="px-8 pt-8 pb-0 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar font-[Inter] font-semibold">
      {/* Golden Staff Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-stone-900 to-stone-950 rounded-2xl border border-amber-900/40 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-brand-accent font-semibold text-xs uppercase tracking-[0.25em]">
            <Sparkles size={12} className="text-amber-500 animate-ping" />
            Vanguard Employee roster
          </div>
          <h3 className="text-2xl font-semibold font-display text-white tracking-tight">Staff & Shift Directory</h3>
          <p className="text-sm text-stone-400 max-w-xl">
             Supervise active brigade attendance, adjust sommelier allocations, configure clock-ins, and recruit certified hospitality personnel.
          </p>
        </div>

        {/* Attendance Summary */}
        <div className="relative z-10 flex flex-wrap gap-4">
          <div className="px-6 py-4 bg-stone-900/80 border border-stone-800 rounded-2xl flex items-center gap-3">
             <Clock className="text-amber-500" size={24} />
             <div>
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest font-sans">Active On-Duty Brigade</p>
                <p className="text-lg font-semibold text-white font-mono">
                   {crew.filter(m => m.status === 'Clocked In').length} / {crew.length} Crew
                </p>
             </div>
          </div>
          <div className="px-6 py-4 bg-stone-900/80 border border-stone-800 rounded-2xl flex items-center gap-3">
             <TrendingUp className="text-amber-500" size={24} />
             <div>
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest font-sans">Monthly Payroll projection</p>
                <p className="text-lg font-semibold text-white font-mono">
                   ₹{(crew.reduce((acc, current) => acc + current.salary, 0) / 1000).toFixed(0)}K
                </p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Roster actions search filter */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-stone-200/60 shadow-soft">
        <div className="relative flex-1 w-full xl:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', ...staffCategories].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRoleFilter(role)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-widest transition-all ${
                selectedRoleFilter === role 
                  ? 'bg-brand-primary text-brand-accent shadow-lg shadow-brand-primary/10' 
                  : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
              }`}
            >
              {role}
            </button>
          ))}
          <div className="h-6 w-[1px] bg-stone-200 mx-2 hidden xl:block" />
          
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="p-3 bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 transition-all border border-stone-200"
            title="Manage Staff Categories"
          >
            <Settings size={20} />
          </button>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-brand-accent text-stone-950 font-semibold rounded-2xl text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-brand-accent/25"
          >
            <Plus size={16} strokeWidth={3} />
            Recruit Member
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
         <AnimatePresence>
            {filteredCrew.map((member) => (
               <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[32px] p-5 border border-stone-200/80 shadow-soft hover:border-brand-accent group transition-all flex flex-col justify-between h-full"
               >
                  <div>
                     <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 p-1 overflow-hidden">
                           <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col items-end">
                           <span className={`px-2.5 py-1 rounded-full text-[8px] font-semibold uppercase tracking-wider ${
                              member.status === 'Clocked In' ? 'bg-green-50 text-green-700 border border-green-200/40' : 
                              member.status === 'On Break' ? 'bg-amber-50 text-amber-700 border border-amber-200/40' : 'bg-stone-100 text-stone-500 border border-stone-200/40'
                           } border`}>
                              {member.status}
                           </span>
                           <span className="text-[10px] font-mono text-amber-500 font-semibold tracking-tight mt-1 flex items-center gap-1">
                              <Smile size={10} />
                              CS {member.score} / 5.0
                           </span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between">
                        <h5 className="text-lg font-semibold text-stone-900 group-hover:text-brand-accent transition-colors block">{member.name}</h5>
                        <button 
                           onClick={(e) => { e.stopPropagation(); handleEditClick(member); }}
                           className="p-1.5 text-stone-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-all"
                           title="Edit Staff"
                        >
                           <Edit2 size={14} />
                        </button>
                     </div>
                     <p className="text-[10.5px] font-semibold text-stone-400 uppercase tracking-widest mt-1 block">ID: MAISON-{member.id}</p>
                     
                     <div className="mt-4 py-3 border-y border-stone-50 space-y-2">
                        <div className="flex items-center gap-2 text-stone-500 font-medium text-xs">
                           <Briefcase size={12} className="text-amber-500" />
                           <span>{member.role}</span>
                        </div>
                        <div className="flex items-center gap-2 text-stone-500 font-medium text-xs">
                           <Clock size={12} className="text-amber-500" />
                           <span>{member.shift}</span>
                        </div>
                     </div>

                     <div className="mt-4 space-y-1">
                        <p className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-700 transition-colors">
                           <Phone size={12} />
                           {member.contact}
                        </p>
                        <p className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-700 transition-colors truncate">
                           <Mail size={12} />
                           {member.email}
                        </p>
                     </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-50 flex items-center justify-between">
                     <div>
                        <p className="text-[8px] font-semibold text-stone-400 uppercase tracking-widest">Base Salary</p>
                        <p className="text-sm font-semibold text-stone-800">₹{member.salary.toLocaleString()} / mo</p>
                     </div>
                     <div className="flex gap-1">
                        {member.status !== 'Clocked In' && (
                           <button 
                             onClick={() => handleUpdateStatus(member.id, 'Clocked In')}
                             className="p-2 bg-green-50 border border-green-200 text-green-700 rounded-xl hover:bg-green-100 transition-all text-[10px] font-semibold"
                           >
                             CLOCK IN
                           </button>
                        )}
                        {member.status === 'Clocked In' && (
                           <button 
                             onClick={() => handleUpdateStatus(member.id, 'On Break')}
                             className="p-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl hover:bg-amber-100 transition-all text-[10px] font-semibold"
                           >
                             BREAK
                           </button>
                        )}
                        {member.status !== 'Off-Duty' && (
                           <button 
                             onClick={() => handleUpdateStatus(member.id, 'Off-Duty')}
                             className="p-2 bg-stone-50 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-100 transition-all text-[10px] font-semibold"
                           >
                             EXIT
                           </button>
                        )}
                     </div>
                  </div>
               </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {/* Categories Management Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
              onClick={() => setShowCategoryModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-amber-900/10"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Manage Categories</h3>
                  <p className="text-sm text-slate-500">Add or remove staff categories</p>
                </div>
                <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button 
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 mt-4 custom-scrollbar">
                  {staffCategories.map(category => (
                    <div key={category} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="font-medium text-slate-700">{category}</span>
                      <button 
                        onClick={() => handleDeleteCategory(category)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {staffCategories.length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-sm">No custom categories found.</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Recruit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-4 border border-amber-900/10 overflow-hidden"
            >
              <h3 className="text-2xl font-semibold text-stone-900 mb-2 font-display">
                {editingStaffId ? 'Edit Team Member' : 'Recruit Team Member'}
              </h3>
              <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-6">
                {editingStaffId ? 'Update staff details and avatar' : 'Onboard certified luxury hospitality brigade personnel'}
              </p>

              <form onSubmit={handleSaveStaff} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Recruit Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Master Sommelier Dev" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Gender</label>
                    <select 
                      value={newGender} 
                      onChange={(e) => setNewGender(e.target.value as 'Male'|'Female')}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm text-stone-600"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Certified Specialty Role</label>
                    <select 
                      value={newRole} 
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm text-stone-600"
                    >
                      <option value="" disabled>Select a Category...</option>
                      {staffCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Assigned Shift</label>
                    <select 
                      value={newShift} 
                      onChange={(e) => setNewShift(e.target.value as any)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm text-stone-600"
                    >
                      <option value="General (10 AM - 7 PM)">General (10 AM - 7 PM)</option>
                      <option value="Morning (6 AM - 2 PM)">Morning (6 AM - 2 PM)</option>
                      <option value="Evening (2 PM - 10 PM)">Evening (2 PM - 10 PM)</option>
                      <option value="Night (10 PM - 6 AM)">Night (10 PM - 6 AM)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Monthly Base Salary (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      placeholder="e.g. 85000" 
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Performance Score</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 4.9" 
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Secretariat Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. dev@indiserve.pro" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-semibold text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">Premium Call Contact</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. +91 9999123456" 
                      value={newContact}
                      onChange={(e) => setNewContact(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-semibold text-stone-400 hover:bg-stone-50 rounded-2xl text-xs uppercase tracking-widest">DISCARD</button>
                  <button type="submit" className="flex-[2] py-4 bg-brand-primary text-brand-accent font-semibold rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20">
                    {editingStaffId ? 'UPDATE STAFF' : 'INDIVIEW COMMISSION'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
