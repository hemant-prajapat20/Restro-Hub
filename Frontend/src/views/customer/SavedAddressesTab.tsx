import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { MapPin, Plus, Trash2, Home, Briefcase, Map } from 'lucide-react';
import toast from 'react-hot-toast';

interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

const SavedAddressesTab = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/customer-orders/addresses');
      setAddresses(response.data.data);
    } catch (error) {
      toast.error('Failed to load saved addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customer-orders/addresses', newAddress);
      toast.success('Address saved successfully');
      setShowAddForm(false);
      setNewAddress({ label: 'Home', street: '', city: '', state: '', zipCode: '', isDefault: false });
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/customer-orders/addresses/${id}`);
      toast.success('Address deleted');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const getIconForLabel = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home': return <Home size={20} />;
      case 'work': return <Briefcase size={20} />;
      default: return <Map size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MapPin className="text-orange-500" size={24} />
          Saved Addresses
        </h2>
        
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold px-4 py-2 rounded-xl transition-all"
          >
            <Plus size={18} />
            Add New
          </button>
        )}
      </div>
      
      {showAddForm && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-200 mb-8">
          <h3 className="font-extrabold text-slate-900 mb-4">Add a new delivery address</h3>
          <form onSubmit={handleSaveAddress} className="space-y-4">
            
            <div className="flex gap-4 mb-2">
                {['Home', 'Work', 'Other'].map(lbl => (
                    <button 
                        key={lbl} type="button"
                        onClick={() => setNewAddress({...newAddress, label: lbl})}
                        className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${newAddress.label === lbl ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {getIconForLabel(lbl)} {lbl}
                    </button>
                ))}
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Street Address</label>
                <input required type="text" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50" placeholder="e.g. 123 Main St, Apt 4B" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                    <input required type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50" placeholder="e.g. Jaipur" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">State</label>
                    <input required type="text" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50" placeholder="e.g. Rajasthan" />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Zip / Postal Code</label>
                <input required type="text" value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50" placeholder="e.g. 302001" />
            </div>

            <div className="flex items-center gap-2 mt-4">
               <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500" />
               <label htmlFor="isDefault" className="font-bold text-slate-700">Set as default address</label>
            </div>

            <div className="flex gap-4 mt-6">
                <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20">
                    Save Address
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all">
                    Cancel
                </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div key={address._id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-orange-200 transition-colors relative group">
             {address.isDefault && (
                 <div className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                     Default
                 </div>
             )}
             
             <div className="flex items-start gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${address.label.toLowerCase() === 'home' ? 'bg-blue-50 text-blue-500' : address.label.toLowerCase() === 'work' ? 'bg-purple-50 text-purple-500' : 'bg-orange-50 text-orange-500'}`}>
                     {getIconForLabel(address.label)}
                 </div>
                 
                 <div className="flex-1">
                     <h3 className="font-black text-slate-900 text-lg flex items-center justify-between">
                         {address.label}
                         
                         <button onClick={() => handleDelete(address._id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                             <Trash2 size={18} />
                         </button>
                     </h3>
                     <p className="text-slate-500 font-medium text-sm mt-1 leading-relaxed">
                         {address.street}<br/>
                         {address.city}, {address.state} {address.zipCode}
                     </p>
                 </div>
             </div>
          </div>
        ))}

        {addresses.length === 0 && !showAddForm && (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-slate-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No addresses saved</h3>
                <p className="text-slate-500 font-medium mb-4">Add your delivery addresses for a faster checkout.</p>
                <button onClick={() => setShowAddForm(true)} className="text-orange-500 font-bold hover:underline">Add New Address</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default SavedAddressesTab;
