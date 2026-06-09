import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  Building2, 
  Mail, 
  User, 
  MapPin, 
  Bell, 
  ShoppingBag, 
  Crown, 
  Coffee, 
  Utensils, 
  Store, 
  CalendarCheck 
} from 'lucide-react';
import { motion } from 'motion/react';

interface FeatureToggleProps {
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({ icon: Icon, title, description, enabled, onToggle }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 transition-all hover:shadow-md hover:border-brand-accent/30">
    <div className={`p-3 rounded-xl ${enabled ? 'bg-brand-accent/10 text-brand-accent' : 'bg-slate-100 text-slate-400'}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-semibold text-slate-900">{title}</h4>
        <button 
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-brand-accent' : 'bg-slate-200'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      <p className="text-sm text-slate-500 font-medium">{description}</p>
    </div>
  </div>
);

export const Settings: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Local state for UI toggles (these would sync with backend in reality)
  const [features, setFeatures] = useState({
    notifications: true,
    onlineOrders: false,
    vip: true,
    cafe: false,
    restaurant: true,
    cafeteria: false,
    reservations: true
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-[Inter]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Business Settings</h1>
          <p className="text-slate-500 font-medium">Manage your profile, branch details, and active modules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
              <div className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent text-3xl font-bold mb-4 border-4 border-white shadow-lg">
                {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'G'}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user ? `${user.firstName} ${user.lastName}` : 'Guest User'}</h2>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider mt-2">
                <Crown className="w-3 h-3" />
                {user?.role.replace('_', ' ') || 'System Admin'}
              </span>
            </div>

            <div className="pt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-slate-500 font-medium">Email Address</p>
                  <p className="font-semibold text-slate-900">{user?.email || 'admin@indiserve.com'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-slate-500 font-medium">Business ID</p>
                  <p className="font-semibold text-slate-900">{user?.businessId || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-slate-500 font-medium">Branch Location</p>
                  <p className="font-semibold text-slate-900">Connaught Place</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
              <button className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Active Modules & Features</h3>
              <p className="text-slate-500 font-medium mt-1">Enable or disable specific features for your business based on your current plan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureToggle 
                icon={Bell} 
                title="Push Notifications" 
                description="Receive instant alerts for new orders and reservations."
                enabled={features.notifications}
                onToggle={() => toggleFeature('notifications')}
              />
              <FeatureToggle 
                icon={ShoppingBag} 
                title="Online Orders (Delivery)" 
                description="Accept delivery and takeaway orders from customers online."
                enabled={features.onlineOrders}
                onToggle={() => toggleFeature('onlineOrders')}
              />
              <FeatureToggle 
                icon={Crown} 
                title="VIP Management" 
                description="Track and reward high-value customers with loyalty points."
                enabled={features.vip}
                onToggle={() => toggleFeature('vip')}
              />
              <FeatureToggle 
                icon={Utensils} 
                title="Restaurant (Restro)" 
                description="Full dining experience with KDS and POS billing."
                enabled={features.restaurant}
                onToggle={() => toggleFeature('restaurant')}
              />
              <FeatureToggle 
                icon={Coffee} 
                title="Cafe & Patisserie" 
                description="Quick service mode for cafes, bakeries, and coffee shops."
                enabled={features.cafe}
                onToggle={() => toggleFeature('cafe')}
              />
              <FeatureToggle 
                icon={Store} 
                title="Cafeteria" 
                description="Token-based ordering for corporate cafeterias and canteens."
                enabled={features.cafeteria}
                onToggle={() => toggleFeature('cafeteria')}
              />
              <FeatureToggle 
                icon={CalendarCheck} 
                title="Table Booking" 
                description="Allow customers to pre-book tables or event slots."
                enabled={features.reservations}
                onToggle={() => toggleFeature('reservations')}
              />
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
               <button className="py-3 px-6 bg-brand-accent hover:bg-yellow-500 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-brand-accent/20">
                 Save Configuration
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
