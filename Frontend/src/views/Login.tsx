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

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials. Please register.');
      }

      dispatch(setCredentials({
        user: {
          _id: data.data._id,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          email: data.data.email,
          role: data.data.role,
          businessId: data.data.businessId,
          outletId: data.data.outletId
        },
        token: data.data.token
      }));

      // Role-based routing
      if (data.data.role === 'CUSTOMER') {
        navigate('/customer');
      } else if (data.data.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[112vh] bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-brand-success/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-center relative z-10 h-full max-h-[800px]">
        {/* Hero Section */}
        <div className="hidden lg:block space-y-6">
          <div className="w-12 h-12 bg-brand-accent rounded-[16px] flex items-center justify-center shadow-xl shadow-brand-accent/40 rotate-3">
            <UtensilsCrossed className="text-white w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 leading-[1.1] tracking-tighter">
              The Operating System for <br /><span className="text-brand-accent">Modern Dining.</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-sm">
              Transform your restaurant operations with industrial-grade POS, Live KDS, and AI-driven growth insights.
            </p>
          </div>
          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} className="w-12 h-12 rounded-full border-4 border-white" alt="User" />
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">+2k</div>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Trusted by leading Chains</p>
          </div>

          <div className="pt-8 grid grid-cols-1 gap-5 max-w-sm">
            {[
              { title: "Real-time Order Sync", desc: "Instantly sync orders across POS, KDS, and Admin dashboards." },
              { title: "Multi-Outlet Management", desc: "Manage menus, staff, and inventory for multiple locations easily." },
              { title: "Enterprise Grade Security", desc: "Bank-level encryption keeping your business data safe." }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[380px] mx-auto lg:mx-0 justify-self-center lg:justify-self-end bg-white rounded-[20px] shadow-soft border border-slate-200 flex flex-col"
        >
          <div className="p-6">
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-black font-display tracking-tight text-brand-primary">IndiServe Pro</h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">Welcome Back</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Log in to your account to continue.</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold text-sm">
                  {error}
                  <div className="mt-2">
                    <Link to="/register" className="underline font-black hover:text-red-700">Please register here</Link>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3" autoComplete="off">
                <div className="p-2.5 sm:p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus-within:border-brand-accent focus-within:bg-white transition-all">
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="off"
                    placeholder="Email Address"
                    className="bg-transparent w-full outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="p-2.5 sm:p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus-within:border-brand-accent focus-within:bg-white transition-all">
                  <input
                    type="password"
                    name="password"
                    required
                    autoComplete="new-password"
                    placeholder="Password"
                    className="bg-transparent w-full outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white font-black py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-brand-primary/20 mt-2"
                >
                  {isLoading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
                  {!isLoading && <ArrowRight size={18} strokeWidth={3} />}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link to="/register" className="text-brand-accent font-bold hover:underline">
                  Don't have an account? Register here
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="bg-slate-50/50 p-4 border-t border-slate-100/50 flex flex-wrap sm:flex-nowrap items-center justify-center gap-4 mix-blend-multiply">
            <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
              <Globe size={14} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Live Sync</span>
            </div>
            <div className="w-[1px] h-3 bg-slate-300" />
            <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
              <Lock size={14} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Encrypted</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-40 pointer-events-none w-full text-center">
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.5em] sm:tracking-[1em] text-slate-400">Enterprise Standard 2026</p>
      </div>
    </div>
  );
};

