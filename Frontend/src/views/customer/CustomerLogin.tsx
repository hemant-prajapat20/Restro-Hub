import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';

export const CustomerLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsPending(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      if (data.data.role === 'CUSTOMER') {
        dispatch(setCredentials({
          user: data.data,
          token: data.data.token
        }));
        toast.success('Welcome back!');
        // Find business ID from localstorage or previous navigation if available
        const lastBusinessId = localStorage.getItem('lastBusinessId');
        if (lastBusinessId) {
            navigate(`/customer/order/${lastBusinessId}`);
        } else {
            navigate('/customer/dashboard'); // default
        }
      } else {
        toast.error('This login is for customers only.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-8 max-w-md mx-auto w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm mb-10 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20"
          >
            <ShoppingBag className="text-white" size={32} />
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Login to order your favorite food
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:mx-auto sm:w-full sm:max-w-sm"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border-0 py-4 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 bg-slate-50 font-medium transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border-0 py-4 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 bg-slate-50 font-medium transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full justify-center items-center gap-2 rounded-xl bg-orange-500 px-3 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? 'Logging in...' : 'Sign In'}
                <ArrowRight size={18} />
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            New to our app?{' '}
            <button onClick={() => navigate('/customer-register')} className="font-bold text-orange-500 hover:text-orange-600 transition-colors">
              Create an account
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
