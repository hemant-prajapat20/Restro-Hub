import React from 'react';
import { Blocks, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

const MOCK_MODULES = [
  { id: 'pos', name: 'Industrial POS Billing', active: 142, description: 'Core billing and point of sale module.' },
  { id: 'kds', name: 'Kitchen Display System (KDS)', active: 89, description: 'Live order tracking for kitchen staff.' },
  { id: 'delivery', name: 'Delivery Management Hub', active: 110, description: 'Zomato/Swiggy integration and fleet tracking.' },
  { id: 'qrmenu', name: 'Customer QR Ordering', active: 65, description: 'Contactless dining and table orders.' },
];

export const Modules: React.FC = () => {
  return (
    <div className="p-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 font-display truncate">Module Assignment</h1>
        <p className="text-slate-500 mt-2 font-medium break-words">Control which features are available to which tenants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_MODULES.map((mod, i) => (
          <motion.div 
            key={mod.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex gap-6"
          >
             <div className="w-16 h-16 rounded-2xl bg-brand-primary/5 text-brand-primary flex items-center justify-center shrink-0">
                <Blocks className="w-8 h-8" />
             </div>
             <div>
                <h3 className="text-xl font-semibold text-slate-900 truncate">{mod.name}</h3>
                <p className="text-slate-500 text-sm mt-1 mb-4 break-words">{mod.description}</p>
                
                <div className="flex items-center gap-2">
                   <div className="px-3 py-1 bg-green-100 text-green-700 font-semibold text-xs rounded-full flex items-center gap-1 uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" />
                      {mod.active} Active Licenses
                   </div>
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
