import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const CustomerRegister: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.firstName || !formData.phone) return;
    setIsPending(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      
      toast.success('Registration successful! Please login.');
      navigate('/customer-login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 max-w-md mx-auto w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm mb-10 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20"
          >
            <ShoppingBag className="text-white" size={32} />
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Join us to order delicious food
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:mx-auto sm:w-full sm:max-w-sm"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm bg-slate-50 font-medium transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm bg-slate-50 font-medium transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Email address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm bg-slate-50 font-medium transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm bg-slate-50 font-medium transition-all"
                placeholder="+91 9999999999"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm bg-slate-50 font-medium transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full justify-center items-center gap-2 rounded-xl bg-orange-500 px-3 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? 'Creating Account...' : 'Sign Up'}
                <ArrowRight size={18} />
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <button onClick={() => navigate('/customer-login')} className="font-bold text-orange-500 hover:text-orange-600 transition-colors">
              Log in
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
