import React from 'react';
import { CreditCard, Check } from 'lucide-react';
import { motion } from 'motion/react';

const PLANS = [
  { name: 'Basic', price: '₹1,999', period: '/month', features: ['POS Billing', 'Up to 2 Users', 'Email Support'] },
  { name: 'Pro', price: '₹4,999', period: '/month', features: ['Basic Features', 'KDS & Delivery', 'Up to 10 Users', 'Priority Support'], highlighted: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['All Modules', 'Unlimited Users', 'Dedicated Account Manager', 'Custom Integrations'] },
];

export const Subscriptions: React.FC = () => {
  return (
    <div className="p-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 font-display truncate">Subscription Tiers</h1>
        <p className="text-slate-500 mt-2 font-medium break-words">Manage SaaS pricing plans and feature gates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, i) => (
          <motion.div 
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-3xl p-8 border-2 ${plan.highlighted ? 'border-brand-accent bg-brand-accent/5' : 'border-slate-200 bg-white'} relative`}
          >
             {plan.highlighted && (
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-accent text-white px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest shadow-lg">
                 Most Popular
               </div>
             )}
             <CreditCard className={`w-8 h-8 mb-6 ${plan.highlighted ? 'text-brand-accent' : 'text-slate-400'}`} />
             <h3 className="text-2xl font-semibold text-slate-900 truncate">{plan.name}</h3>
             <div className="mt-4 mb-8">
                <span className="text-4xl font-semibold font-display text-slate-900 truncate">{plan.price}</span>
                <span className="text-slate-500 font-medium truncate">{plan.period}</span>
             </div>
             
             <ul className="space-y-4 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-slate-700 font-medium">
                     <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.highlighted ? 'bg-brand-accent/20 text-brand-accent' : 'bg-slate-100 text-slate-400'}`}>
                        <Check className="w-3 h-3" />
                     </div>
                     {f}
                  </li>
                ))}
             </ul>
             
             <button className={`w-full py-4 rounded-2xl font-semibold transition-all ${plan.highlighted ? 'bg-brand-accent text-white shadow-xl shadow-brand-accent/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                Edit Plan
             </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
