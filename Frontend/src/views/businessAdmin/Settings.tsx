import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { ImageModal } from '../../components/ImageModal';
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
  CalendarCheck,
  Phone,
  CreditCard,
  Calendar,
  Camera,
  Trash2,
  Image as ImageIcon
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

  const dispatch = useDispatch();
  const profileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  const [viewingImage, setViewingImage] = useState<{url: string, alt: string} | null>(null);

  const handleProfileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    
    setIsUploadingProfile(true);
    const formData = new FormData(); formData.append('image', file);

    try {
      const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imageUrl = uploadRes.data.url;
      const updateRes = await api.put('/auth/profile/photo', { profilePhoto: imageUrl });
      
      dispatch(setCredentials({
        user: updateRes.data.data,
        token: localStorage.getItem('token') || ''
      }));
      toast.success('Profile photo updated');
    } catch (error: any) {
      toast.error('Failed to upload profile photo');
    } finally {
      setIsUploadingProfile(false);
      if (profileInputRef.current) profileInputRef.current.value = '';
    }
  };

  const handleHotelImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    
    setIsUploadingLogo(true);
    const formData = new FormData(); formData.append('image', file);

    try {
      const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imageUrl = uploadRes.data.url;
      const currentImages = user?.businessData?.hotelImages || [];
      const newImages = [...currentImages, imageUrl];
      
      await api.put('/businesses/me/hotel-images', { hotelImages: newImages });
      
      const updatedUser = { ...user, businessData: { ...user?.businessData, hotelImages: newImages } } as any;
      dispatch(setCredentials({
        user: updatedUser,
        token: localStorage.getItem('token') || ''
      }));
      toast.success('Hotel picture added');
    } catch (error: any) {
      toast.error('Failed to upload picture');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRemoveProfile = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updateRes = await api.put('/auth/profile/photo', { profilePhoto: null });
      dispatch(setCredentials({ user: updateRes.data.data, token: localStorage.getItem('token') || '' }));
      toast.success('Profile photo removed');
    } catch (error) { toast.error('Failed to remove photo'); }
  };

  const handleRemoveHotelImage = async (urlToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const currentImages = user?.businessData?.hotelImages || [];
      const newImages = currentImages.filter((url: string) => url !== urlToRemove);
      await api.put('/businesses/me/hotel-images', { hotelImages: newImages });
      const updatedUser = { ...user, businessData: { ...user?.businessData, hotelImages: newImages } } as any;
      dispatch(setCredentials({ user: updatedUser, token: localStorage.getItem('token') || '' }));
      toast.success('Picture removed');
    } catch (error) { toast.error('Failed to remove picture'); }
  };

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="px-8 pt-8 pb-0 max-w-[1600px] mx-auto space-y-8 font-[Inter] h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Business Settings</h1>
          <p className="text-slate-500 font-medium">Manage your profile, branch details, and active modules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-stone-200/80 rounded-[32px] p-5 lg:p-4 shadow-soft h-full flex flex-col">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
              
              <div className="relative group mb-4">
                <div 
                  onClick={() => user?.profilePhoto && setViewingImage({url: user.profilePhoto, alt: 'Profile Photo'})}
                  className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent text-3xl font-bold border-4 border-white shadow-lg overflow-hidden cursor-pointer"
                >
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'G'
                  )}
                </div>
                
                {/* Profile Photo Upload Overlay */}
                <div 
                  onClick={() => profileInputRef.current?.click()}
                  className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer transition-opacity ${isUploadingProfile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  {isUploadingProfile ? (
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                     <Camera size={20} className="text-white" />
                  )}
                </div>
                <input type="file" ref={profileInputRef} onChange={handleProfileUpload} className="hidden" accept="image/*" />
                
                {user?.profilePhoto && (
                  <button onClick={handleRemoveProfile} className="absolute -bottom-1 -right-1 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <h2 className="text-xl font-semibold text-slate-900">{user ? `${user.firstName} ${user.lastName}` : 'Guest User'}</h2>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider mt-2">
                <Crown className="w-3 h-3" />
                {user?.role.replace('_', ' ') || 'System Admin'}
              </span>
            </div>

            <div className="pt-6 space-y-5">
              <div className="flex items-start gap-3 text-sm">
                <Building2 className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Business Name</p>
                  <p className="font-semibold text-slate-900 mb-2">{user?.businessData?.name || 'IndiServe Prime'}</p>
                  
                  {/* Business Hotel Pictures Gallery */}
                  <div className="mt-2 space-y-3">
                    <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Hotel Pictures Gallery</p>
                    <div className="flex flex-wrap gap-3">
                      {user?.businessData?.hotelImages?.map((url: string, index: number) => (
                        <div key={index} className="relative group w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm">
                          <img 
                            src={url} 
                            alt={`Hotel Picture ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onClick={() => setViewingImage({url, alt: `Hotel Picture ${index + 1}`})}
                          />
                          <button 
                            onClick={(e) => handleRemoveHotelImage(url, e)} 
                            className="absolute top-1 right-1 p-1 bg-red-100/90 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}

                      {/* Add New Picture Button */}
                      <div 
                        onClick={() => logoInputRef.current?.click()}
                        className="w-24 h-24 bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer transition-colors"
                      >
                        {isUploadingLogo ? (
                          <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Camera size={20} className="text-slate-400 mb-1" />
                            <span className="text-slate-500 text-[10px] font-bold">Add Photo</span>
                          </>
                        )}
                      </div>
                      <input type="file" ref={logoInputRef} onChange={handleHotelImageUpload} className="hidden" accept="image/*" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Owner Email</p>
                  <p className="font-semibold text-slate-900">{user?.email || 'admin@indiserve.com'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Contact Phone</p>
                  <p className="font-semibold text-slate-900">{user?.phone || user?.businessData?.contactPhone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Registered Address</p>
                  <p className="font-semibold text-slate-900">{user?.businessData?.address || 'N/A'}</p>
                  <p className="text-slate-600 font-medium">
                    {[user?.businessData?.district, user?.businessData?.state].filter(Boolean).join(', ') || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full my-4" />

              <div className="flex items-start gap-3 text-sm">
                <CreditCard className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Subscription Paid</p>
                  <p className="font-semibold text-brand-success">
                    {user?.businessData?.subscriptionAmountPaid 
                      ? `₹ ${user.businessData.subscriptionAmountPaid.toLocaleString()}` 
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Plan Expiry</p>
                  <p className="font-semibold text-slate-900">
                    {user?.businessData?.subscriptionExpiry 
                      ? new Date(user.businessData.subscriptionExpiry).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            

          </div>
        </div>

        {/* Feature Toggles */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-stone-200/80 rounded-[32px] p-5 lg:p-4 shadow-soft h-full flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Active Modules & Features</h3>
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
            
            <div className="mt-auto pt-6 border-t border-slate-100 flex justify-end">
               <button className="py-3 px-6 bg-brand-accent hover:bg-yellow-500 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-brand-accent/20">
                 Save Configuration
               </button>
            </div>
          </div>
        </div>

      </div>
      
      {viewingImage && (
        <ImageModal 
          imageUrl={viewingImage.url} 
          altText={viewingImage.alt} 
          onClose={() => setViewingImage(null)} 
        />
      )}
    </div>
  );
};
