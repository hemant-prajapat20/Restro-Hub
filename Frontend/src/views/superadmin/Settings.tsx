import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Server, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const [formData, setFormData] = useState({
    platformName: 'IndiServe Pro',
    maintenanceMode: false,
    jwtExpirationTime: '30 Days'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/settings', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (data.status === 'success' && data.data) {
          setFormData({
            platformName: data.data.platformName,
            maintenanceMode: data.data.maintenanceMode,
            jwtExpirationTime: data.data.jwtExpirationTime
          });
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccess('Global configuration saved successfully.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 font-semibold">Loading Configuration...</div>;

  return (
    <div className="p-8 pb-24 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 font-display truncate">System Configuration</h1>
        <p className="text-slate-500 mt-2 font-medium break-words">Global settings for the RestroHub Platform.</p>
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

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <Server className="w-6 h-6 text-brand-accent" />
              <h2 className="text-xl font-semibold text-slate-900 truncate">Platform Settings</h2>
           </div>
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Platform Name</label>
                 <input 
                   type="text" 
                   value={formData.platformName}
                   onChange={e => setFormData({ ...formData, platformName: e.target.value })}
                   className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-accent transition-all font-semibold" 
                 />
              </div>
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Maintenance Mode</label>
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setFormData({ ...formData, maintenanceMode: true })}
                      className={`px-6 py-3 rounded-xl font-semibold border-2 transition-colors ${
                        formData.maintenanceMode 
                          ? 'bg-red-50 text-red-600 border-red-200' 
                          : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Enabled
                    </button>
                    <button 
                      onClick={() => setFormData({ ...formData, maintenanceMode: false })}
                      className={`px-6 py-3 rounded-xl font-semibold border-2 transition-colors ${
                        !formData.maintenanceMode 
                          ? 'bg-brand-success/10 text-brand-success border-brand-success' 
                          : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Disabled
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <Shield className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-slate-900 truncate">Security & Authentication</h2>
           </div>
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">JWT Expiration Time</label>
                 <select 
                   value={formData.jwtExpirationTime}
                   onChange={e => setFormData({ ...formData, jwtExpirationTime: e.target.value })}
                   className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-accent transition-all font-semibold text-slate-700"
                 >
                    <option value="24 Hours">24 Hours</option>
                    <option value="7 Days">7 Days</option>
                    <option value="30 Days">30 Days</option>
                 </select>
              </div>
           </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white font-semibold py-5 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-brand-primary/20 mt-8"
        >
           <Save size={22} />
           {isSaving ? 'SAVING...' : 'SAVE GLOBAL CONFIGURATION'}
        </button>
      </div>
    </div>
  );
};
