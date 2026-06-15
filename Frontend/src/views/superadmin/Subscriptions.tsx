import React from 'react';
import { ShieldCheck, Info, ArrowRight, Building2, UtensilsCrossed, Wine, Coffee } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const Subscriptions: React.FC = () => {
  const navigate = useNavigate();

  const guidelines = [
    {
      title: 'Core Base Tier',
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-slate-500',
      description: 'The foundation plan offering core modules like POS, CRM, and Inventory without platform-specific dashboards.',
      platforms: '0 Platforms (Core Features Only)',
      pricingRules: [
        '1 Month: Base Rate (e.g. ₹500)',
        '3 Months: 5% Discount applied to base rate',
        '6 Months: 10% Discount applied to base rate',
        '12 Months: 15% Discount applied to base rate'
      ]
    },
    {
      title: 'Single Platform Tier',
      icon: <UtensilsCrossed className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: 'Ideal for standalone businesses focusing on a single operation model.',
      platforms: 'Choose any ONE (Restaurant OR Cafeteria OR Bar)',
      pricingRules: [
        '1 Month: Base Rate (e.g. ₹1000)',
        '3 Months: 5% Discount applied to base rate',
        '6 Months: 10% Discount applied to base rate',
        '12 Months: 15% Discount applied to base rate'
      ]
    },
    {
      title: 'Dual Platform Tier',
      icon: <Coffee className="w-6 h-6" />,
      color: 'bg-indigo-500',
      description: 'Perfect for businesses combining two operations under one roof.',
      platforms: 'Choose any TWO (e.g., Restaurant + Bar)',
      pricingRules: [
        '1 Month: Dual Rate (e.g. ₹1800)',
        '3 Months: 8% Discount applied to base rate',
        '6 Months: 12% Discount applied to base rate',
        '12 Months: 20% Discount applied to base rate'
      ]
    },
    {
      title: 'All-Inclusive Enterprise',
      icon: <Wine className="w-6 h-6" />,
      color: 'bg-brand-accent',
      description: 'The ultimate package for large hospitality groups running all platforms.',
      platforms: 'All THREE (Restaurant + Cafeteria + Bar)',
      pricingRules: [
        '1 Month: Enterprise Rate (e.g. ₹2500)',
        '3 Months: 10% Discount applied to base rate',
        '6 Months: 15% Discount applied to base rate',
        '12 Months: 25% Discount applied to base rate'
      ]
    }
  ];

  return (
    <div className="p-4 sm:p-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 font-display truncate">Subscription Guidelines</h1>
          <p className="text-slate-500 mt-2 font-medium break-words">Rules and pricing structures for provisioning new tenant accounts.</p>
        </div>
        <button 
          onClick={() => navigate('/super-admin/businesses')}
          className="bg-brand-accent hover:bg-brand-accent/90 text-white px-8 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/30 transition-all active:scale-95 shrink-0 w-full sm:w-auto"
        >
          <Building2 className="w-5 h-5" />
          Register New Business
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-3xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row gap-4 items-start">
        <div className="shrink-0 w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">How Pricing Works</h3>
          <p className="text-slate-600 font-medium leading-relaxed">
            The platform automatically calculates the final subscription price based on the number of platforms selected and the duration of the commitment. The calculated amount is shown on the registration page, but <span className="font-bold text-brand-accent">SuperAdmins can always manually override the final amount</span> before confirming registration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {guidelines.map((guide, i) => (
          <motion.div 
            key={guide.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col relative overflow-hidden group hover:border-slate-300 transition-colors"
          >
            <div className={`absolute top-0 left-0 w-full h-2 ${guide.color}`} />
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg ${guide.color}`}>
              {guide.icon}
            </div>
            
            <h3 className="text-2xl font-display font-semibold text-slate-900 mb-2">{guide.title}</h3>
            <p className="text-slate-500 font-medium mb-6">{guide.description}</p>
            
            <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Included Platforms</span>
              <span className="font-semibold text-slate-800">{guide.platforms}</span>
            </div>
            
            <div className="mt-auto">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Pricing Structure</span>
              <ul className="space-y-3">
                {guide.pricingRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium text-sm">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
