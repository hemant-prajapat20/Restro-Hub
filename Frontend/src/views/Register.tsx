import React, { useState } from 'react';
import { 
  ArrowRight,
  Globe,
  Lock,
  UtensilsCrossed
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      // Save user and token in Redux store
      dispatch(setCredentials({
        user: {
          _id: data.data._id,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          email: data.data.email,
          role: data.data.role
        },
        token: data.data.token
      }));

      // Successfully saved to MongoDB, now redirect
      navigate('/customer');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Elements matching Login.tsx */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-brand-success/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        {/* Hero Section */}
        <div className="hidden lg:block space-y-8">
           <div className="w-20 h-20 bg-brand-accent rounded-[32px] flex items-center justify-center shadow-2xl shadow-brand-accent/40 rotate-3">
              <UtensilsCrossed className="text-white w-10 h-10" />
           </div>
           <div className="space-y-4">
              <h1 className="text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                 Your Favorite Food. <br/><span className="text-brand-accent">Delivered Faster.</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-md">
                 Join thousands of food lovers. Experience seamless ordering, exclusive loyalty rewards, and live tracking.
              </p>
           </div>
           <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}`} className="w-12 h-12 rounded-full border-4 border-white" alt="User" />
                 ))}
                 <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">+10k</div>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Happy Customers</p>
           </div>
        </div>

        {/* Register Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[480px] mx-auto lg:mx-0 justify-self-center lg:justify-self-end bg-white rounded-[24px] sm:rounded-[40px] shadow-soft border border-slate-200 overflow-hidden"
        >
          <div className="p-6 sm:p-8 md:p-12">
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-black font-display tracking-tight text-brand-primary">IndiServe</h1>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">Create Account</h2>
                <p className="text-slate-500 mt-2 font-medium">Register as a customer to start ordering.</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="p-4 sm:p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl sm:rounded-3xl focus-within:border-brand-accent focus-within:bg-white transition-all">
                      <input 
                        type="text" 
                        name="firstName"
                        required
                        placeholder="First Name" 
                        className="bg-transparent w-full outline-none text-lg font-bold text-slate-900 placeholder:text-slate-400"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                   </div>
                   <div className="p-4 sm:p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl sm:rounded-3xl focus-within:border-brand-accent focus-within:bg-white transition-all">
                      <input 
                        type="text" 
                        name="lastName"
                        required
                        placeholder="Last Name" 
                        className="bg-transparent w-full outline-none text-lg font-bold text-slate-900 placeholder:text-slate-400"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                   </div>
                 </div>

                 <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl sm:rounded-3xl group focus-within:border-brand-accent focus-within:bg-white transition-all">
                    <div className="flex items-center gap-2 pr-4 border-r-2 border-slate-200/50">
                       <img src="https://flagcdn.com/in.svg" className="w-6 h-4 rounded-sm shadow-sm" alt="India" />
                       <span className="text-slate-800 font-black">+91</span>
                    </div>
                    <input 
                      type="tel" 
                      name="phone"
                      maxLength={10}
                      required
                      placeholder="Phone Number" 
                      className="bg-transparent border-none outline-none flex-1 text-lg font-bold text-slate-900 placeholder:text-slate-400"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    />
                 </div>

                 <div className="p-4 sm:p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl sm:rounded-3xl focus-within:border-brand-accent focus-within:bg-white transition-all">
                    <input 
                      type="email" 
                      name="email"
                      required
                      placeholder="Email Address" 
                      className="bg-transparent w-full outline-none text-lg font-bold text-slate-900 placeholder:text-slate-400"
                      value={formData.email}
                      onChange={handleChange}
                    />
                 </div>

                 <div className="p-4 sm:p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl sm:rounded-3xl focus-within:border-brand-accent focus-within:bg-white transition-all">
                    <input 
                      type="password" 
                      name="password"
                      required
                      placeholder="Create Password" 
                      className="bg-transparent w-full outline-none text-lg font-bold text-slate-900 placeholder:text-slate-400"
                      value={formData.password}
                      onChange={handleChange}
                    />
                 </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white font-black py-4 sm:py-5 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-brand-primary/20 mt-6"
                >
                   {isLoading ? 'CREATING...' : 'CREATE ACCOUNT'}
                   {!isLoading && <ArrowRight size={22} strokeWidth={3} />}
                </button>
              </form>
              
              <div className="text-center mt-6">
                <Link to="/login" className="text-brand-accent font-bold hover:underline">
                  Already have an account? Login here
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="bg-slate-50/50 p-6 sm:p-8 border-t border-slate-100/50 flex flex-wrap sm:flex-nowrap items-center justify-center gap-4 sm:gap-8 mix-blend-multiply">
             <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                <Globe size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Sync</span>
             </div>
             <div className="w-[1px] h-4 bg-slate-300" />
             <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                <Lock size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Encrypted</span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
