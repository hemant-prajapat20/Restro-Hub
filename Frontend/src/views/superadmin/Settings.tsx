import React from 'react';
import { Settings as SettingsIcon, Save, Server, Shield, Mail } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="p-8 pb-24 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 font-display truncate">System Configuration</h1>
        <p className="text-slate-500 mt-2 font-medium break-words">Global settings for the RestroHub Platform.</p>
      </div>

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
                 <input type="text" defaultValue="IndiServe Pro" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-accent transition-all font-semibold" />
              </div>
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Maintenance Mode</label>
                 <div className="flex items-center gap-4">
                    <button className="px-6 py-3 rounded-xl font-semibold bg-slate-100 text-slate-600 border-2 border-slate-200 hover:bg-slate-200">Enabled</button>
                    <button className="px-6 py-3 rounded-xl font-semibold bg-brand-success/10 text-brand-success border-2 border-brand-success">Disabled</button>
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
                 <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-accent transition-all font-semibold text-slate-700">
                    <option>24 Hours</option>
                    <option>7 Days</option>
                    <option>30 Days</option>
                 </select>
              </div>
           </div>
        </div>

        <button className="w-full bg-brand-primary hover:opacity-90 text-white font-semibold py-5 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-brand-primary/20 mt-8">
           <Save size={22} />
           SAVE GLOBAL CONFIGURATION
        </button>
      </div>
    </div>
  );
};
