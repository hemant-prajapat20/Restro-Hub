import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreVertical, Building2, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomDatePicker } from '../../components/CustomDatePicker';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const AVAILABLE_PLATFORMS = ['Restaurant', 'Cafeteria', 'Bar'];

export const Businesses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const filterOptions = ['All', 'Active', 'Inactive'];
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBusinessId, setEditingBusinessId] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    businessName: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    address: '',
    state: '',
    district: '',
    subscriptionDurationMonths: 1,
    subscriptionExpiry: '',
    subscriptionAmountPaid: '',
    businessStatus: ''
  });
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Restaurant']);
  const [matrix, setMatrix] = useState<any>(null);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/businesses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setBusinesses(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPricing = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subscriptions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setMatrix(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch pricing config:", error);
    }
  };

  useEffect(() => {
    fetchBusinesses();
    fetchPricing();
  }, []);

  // Smart Pricing Engine Auto-calculator
  useEffect(() => {
    if (!matrix || selectedPlatforms.length === 0) {
      if (selectedPlatforms.length === 0) {
        setFormData(prev => ({ ...prev, subscriptionAmountPaid: '0' }));
      }
      return;
    }
    
    const count = selectedPlatforms.length;
    let tierKey = 'onePlatform';
    if (count === 2) tierKey = 'twoPlatforms';
    if (count === 3) tierKey = 'threePlatforms';

    const durKey = `months${formData.subscriptionDurationMonths}`;
    
    if (matrix[tierKey] && matrix[tierKey][durKey] !== undefined) {
      // Also calculate the target expiry date
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + Number(formData.subscriptionDurationMonths));
      
      const tzOffset = expiry.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(expiry.getTime() - tzOffset)).toISOString().slice(0, 16);

      setFormData(prev => ({ 
        ...prev, 
        subscriptionAmountPaid: matrix[tierKey][durKey].toString(),
        subscriptionExpiry: prev.subscriptionExpiry || localISOTime 
      }));
    }
  }, [selectedPlatforms, formData.subscriptionDurationMonths, matrix]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Phone number validation: allow only digits and max 10 chars
    if (name === 'ownerPhone') {
      const formatted = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (formData.ownerPhone.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform (Restaurant, Cafeteria, or Bar).");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          platforms: selectedPlatforms,
          subscriptionDurationMonths: Number(formData.subscriptionDurationMonths),
          subscriptionExpiry: formData.subscriptionExpiry,
          subscriptionAmountPaid: formData.subscriptionAmountPaid ? Number(formData.subscriptionAmountPaid) : 0,
          activeModules: ['POS']
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register business');
      }

      setSuccess(`Successfully registered ${formData.businessName}! The Business Admin can now log in.`);
      
      // Close form and open success popup immediately
      setIsModalOpen(false);
      setShowSuccessModal(true);
      
      // Still refresh table to show new record in SuperAdmin panel
      fetchBusinesses(); 

      // Reset form silently
      setFormData({
        businessName: '', ownerFirstName: '', ownerLastName: '', ownerEmail: '', ownerPhone: '', ownerPassword: '',
        address: '', state: '', district: '', subscriptionDurationMonths: 1, subscriptionExpiry: '', subscriptionAmountPaid: '', businessStatus: 'ACTIVE'
      });
      setSelectedPlatforms(['Restaurant']);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBusinessStatus = async (businessId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      const res = await fetch(`http://localhost:5000/api/businesses/${businessId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchBusinesses();
        setActionMenuOpen(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (business: any) => {
    setEditingBusinessId(business._id);
    setFormData({
      ...formData,
      businessName: business.name,
      ownerEmail: business.contactEmail,
      ownerPhone: business.contactPhone || '',
      address: business.address,
      state: business.state,
      district: business.district,
      subscriptionAmountPaid: business.subscriptionAmountPaid?.toString() || '',
      subscriptionExpiry: business.subscriptionExpiry ? new Date(business.subscriptionExpiry).toISOString().split('T')[0] : '',
      businessStatus: business.status || 'ACTIVE'
    });
    setSelectedPlatforms(business.platforms || []);
    setIsEditModalOpen(true);
    setActionMenuOpen(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusinessId) return;
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/businesses/${editingBusinessId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.businessName,
          contactEmail: formData.ownerEmail,
          address: formData.address,
          state: formData.state,
          district: formData.district,
          subscriptionExpiry: formData.subscriptionExpiry,
          subscriptionAmountPaid: formData.subscriptionAmountPaid ? Number(formData.subscriptionAmountPaid) : 0,
          platforms: selectedPlatforms,
          status: formData.businessStatus
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update business');
      }

      setIsEditModalOpen(false);
      fetchBusinesses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLoginAccess = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchBusinesses();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (b.ownerId?.firstName + " " + b.ownerId?.lastName).toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Active') return matchesSearch && b.isActive;
    if (activeFilter === 'Inactive') return matchesSearch && !b.isActive;
    return matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 font-display truncate">Business Management</h1>
          <p className="text-slate-500 mt-2 font-medium break-words">Manage all tenant restaurants and franchises.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-accent hover:bg-brand-accent/90 text-white px-6 py-3 rounded-2xl font-semibold flex items-center justify-center w-full sm:w-auto gap-2 shadow-lg shadow-brand-accent/30 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Register New Business
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50/50">
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
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="p-3 w-full bg-white border-2 border-slate-100 rounded-2xl text-slate-500 hover:text-brand-accent hover:border-brand-accent transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              <Filter className="w-5 h-5" />
              {activeFilter === 'All' ? 'Filters' : activeFilter}
            </button>
            {showFilterDropdown && (
               <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-50">
                 {filterOptions.map(opt => (
                   <button 
                     key={opt}
                     onClick={() => { setActiveFilter(opt); setShowFilterDropdown(false); }}
                     className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors ${activeFilter === opt ? 'text-brand-accent bg-brand-accent/5' : 'text-slate-600'}`}
                   >
                     {opt}
                   </button>
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto lg:overflow-visible w-full">
          <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400 w-1/5">Business Name</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400 w-1/4">Admin Owner</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400 w-1/5">Platforms</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400 w-1/6">Business Status</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400 w-1/6">Login Access</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-400 text-right w-1/12">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">Loading businesses...</td></tr>
              ) : filteredBusinesses.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">No businesses found.</td></tr>
              ) : (
                filteredBusinesses.map((business, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={business._id} 
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-primary/5 text-brand-primary flex items-center justify-center">
                           <Building2 className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-900 truncate">{business.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 truncate">
                          {business.ownerId?.firstName} {business.ownerId?.lastName}
                        </span>
                        <span className="text-xs text-slate-500 truncate">{business.ownerId?.email}</span>
                        <span className="text-xs text-brand-accent font-semibold mt-0.5">{business.ownerId?.businessAdminCode}</span>
                      </div>
                    </td>
                    <td className="p-4">
                       <div className="flex flex-wrap gap-1">
                         {business.platforms && business.platforms.map((plat: string) => (
                           <span key={plat} className="inline-block font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg text-xs truncate">
                             {plat}
                           </span>
                         ))}
                       </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        business.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${business.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {business.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleLoginAccess(business.ownerId?._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all hover:opacity-80 ${
                          business.ownerId?.isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${business.ownerId?.isActive ? 'bg-blue-500' : 'bg-slate-400'}`} />
                        {business.ownerId?.isActive ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleEditClick(business)}
                        title="Edit Details"
                        className="p-2 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-colors inline-block"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-[101] p-4 sm:p-8"
            >
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-display font-semibold text-slate-900">Register New Business</h2>
                  <p className="text-sm text-slate-500 mt-1">Provision a new tenant and setup their Business Admin account.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3 font-medium">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-3 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  {success}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-8">
                {/* 1. Admin Details */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs flex items-center justify-center">1</span>
                    Admin Credentials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="ownerFirstName" required placeholder="First Name" value={formData.ownerFirstName} onChange={handleInputChange} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-brand-accent font-medium w-full" />
                    <input type="text" name="ownerLastName" required placeholder="Last Name" value={formData.ownerLastName} onChange={handleInputChange} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-brand-accent font-medium w-full" />
                    <input type="email" name="ownerEmail" required placeholder="Admin Email" value={formData.ownerEmail} onChange={handleInputChange} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-brand-accent font-medium w-full" />
                    <input type="text" name="ownerPhone" required placeholder="Mobile Number (10 Digits)" value={formData.ownerPhone} onChange={handleInputChange} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-brand-accent font-medium w-full" />
                    <input type="text" name="ownerPassword" required placeholder="Initial Password" value={formData.ownerPassword} onChange={handleInputChange} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-brand-accent font-medium w-full md:col-span-2" />
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* 2. Business Details */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs flex items-center justify-center">2</span>
                    Company Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="businessName" required placeholder="Company / Restaurant Name" value={formData.businessName} onChange={handleInputChange} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-brand-accent font-medium w-full md:col-span-2" />
                    
                    <div className="relative w-full">
                      <button
                        type="button"
                        onClick={() => { setShowStateDropdown(!showStateDropdown); setShowDurationDropdown(false); }}
                        className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-brand-accent font-medium w-full flex justify-between items-center text-slate-700"
                      >
                        <span className="truncate">{formData.state || "Select State"}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="w-5 h-5 text-slate-400 shrink-0"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7l5 5 5-5"/></svg>
                      </button>
                      {showStateDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-[110] max-h-60 overflow-y-auto">
                          {INDIAN_STATES.map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => { setFormData({...formData, state: st}); setShowStateDropdown(false); }}
                              className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors text-slate-700"
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input type="text" name="district" required placeholder="District / City" value={formData.district} onChange={handleInputChange} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-brand-accent font-medium w-full" />
                    
                    <textarea name="address" required placeholder="Full Company & Home Address" value={formData.address} onChange={handleInputChange} rows={3} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-brand-accent font-medium w-full md:col-span-2 resize-none" />
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* 3. Subscription Details */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs flex items-center justify-center">3</span>
                    Subscription Setup
                  </h3>
                  
                  <div className="mb-6 space-y-3">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Platforms</label>
                    <div className="flex flex-wrap gap-3">
                      {AVAILABLE_PLATFORMS.map(plat => (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => togglePlatform(plat)}
                          className={`px-4 py-2 rounded-xl font-semibold border-2 transition-colors ${
                            selectedPlatforms.includes(plat)
                              ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {plat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                        <span>Base Duration</span>
                        <span className="text-brand-accent text-[10px] bg-brand-accent/10 px-2 py-0.5 rounded-full">Calculates Price</span>
                      </label>
                      <div className="relative w-full">
                        <button
                          type="button"
                          onClick={() => { setShowDurationDropdown(!showDurationDropdown); setShowStateDropdown(false); }}
                          className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-brand-accent font-medium w-full flex justify-between items-center text-slate-700"
                        >
                          <span className="truncate">{formData.subscriptionDurationMonths} Month{Number(formData.subscriptionDurationMonths) > 1 ? 's' : ''}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="w-5 h-5 text-slate-400 shrink-0"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7l5 5 5-5"/></svg>
                        </button>
                        {showDurationDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-[110]">
                            {[1, 3, 6, 12].map(m => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => { setFormData({...formData, subscriptionDurationMonths: m}); setShowDurationDropdown(false); }}
                                className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors text-slate-700"
                              >
                                {m} Month{m > 1 ? 's' : ''}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                        <span>Exact Expiry Date</span>
                        <span className="text-brand-accent text-[10px] bg-brand-accent/10 px-2 py-0.5 rounded-full">Editable</span>
                      </label>
                      <CustomDatePicker 
                        value={formData.subscriptionExpiry} 
                        onChange={(val) => setFormData({...formData, subscriptionExpiry: val})} 
                        className="px-4 py-4 sm:p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-brand-accent font-medium w-full text-sm sm:text-base hover:border-slate-200 transition-colors" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                        <span>Final Amount (₹)</span>
                        <span className="text-brand-accent text-[10px] bg-brand-accent/10 px-2 py-0.5 rounded-full">Editable</span>
                      </label>
                      <input type="number" name="subscriptionAmountPaid" required min="0" placeholder="e.g. 5000" value={formData.subscriptionAmountPaid} onChange={handleInputChange} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-brand-accent font-medium w-full" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors order-2 sm:order-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-brand-accent/30 transition-all active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
                    {isSubmitting ? 'Registering...' : 'Complete Registration'}
                  </button>
                </div>
              </form>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Popup Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-3xl shadow-2xl z-[201] p-8 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Registration Successful!</h2>
              <p className="text-slate-500 text-sm mb-8">{success}</p>
              <button 
                onClick={() => { setShowSuccessModal(false); setSuccess(''); }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-emerald-500/30"
              >
                Done
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Edit Business Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
              onClick={() => !isSubmitting && setIsEditModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[600px] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-white/50 backdrop-blur-xl">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 font-display">Edit Business</h2>
                  <p className="text-sm text-slate-500 mt-1">Modify details for this tenant.</p>
                </div>
                <button onClick={() => !isSubmitting && setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand-accent" />
                    Basic Details
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business Name</label>
                      <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Email</label>
                      <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                    Location
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">District</label>
                        <input type="text" name="district" value={formData.district} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                    Business Status
                  </h3>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, businessStatus: 'ACTIVE' })}
                      className={`flex-1 py-4 px-6 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                        formData.businessStatus === 'ACTIVE' 
                          ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${formData.businessStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`} />
                      Active / Enabled
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, businessStatus: 'SUSPENDED' })}
                      className={`flex-1 py-4 px-6 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                        formData.businessStatus === 'SUSPENDED' 
                          ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${formData.businessStatus === 'SUSPENDED' ? 'bg-red-500' : 'bg-slate-300'}`} />
                      Suspended / Deactivated
                    </button>
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                    Subscription (Time / Month)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Exact Expiry Date</label>
                      <CustomDatePicker 
                        value={formData.subscriptionExpiry}
                        onChange={(val) => setFormData(p => ({ ...p, subscriptionExpiry: val }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount Paid (₹)</label>
                      <input type="number" min="0" name="subscriptionAmountPaid" value={formData.subscriptionAmountPaid} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-4">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-4 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors order-2 sm:order-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-brand-accent/30 transition-all active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
