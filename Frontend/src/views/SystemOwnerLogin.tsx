import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setCredentials } from '../store/slices/authSlice';
import { ShieldAlert, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export const SystemOwnerLogin: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated as Super Admin, just redirect to dashboard
  if (isAuthenticated && user?.role === 'SUPER_ADMIN') {
    return <Navigate to="/super-admin" replace />;
  }

  const handleSecretLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/secret-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Invalid Secret Key.');

      dispatch(setCredentials({
        user: {
          _id: data.data._id,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          email: data.data.email,
          role: data.data.role,
        },
        token: data.data.token
      }));

      // Navigate securely to super admin
      navigate('/super-admin');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[112vh] bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dark Mode Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-accent/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-[24px] shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center shadow-lg shadow-brand-accent/30">
            <ShieldAlert className="text-white w-8 h-8" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">System Owner</h1>
          <p className="text-slate-400 text-sm mt-2">Enter the master secret key to bypass authentication and unlock the SuperAdmin Panel.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSecretLogin} className="space-y-4">
          <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-xl focus-within:border-brand-accent transition-all">
             <input 
               type="password" 
               required
               placeholder="Master Secret Key" 
               className="bg-transparent w-full outline-none text-white font-medium placeholder:text-slate-500 text-center"
               value={secretKey}
               onChange={(e) => setSecretKey(e.target.value)}
             />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all mt-6 shadow-lg shadow-brand-accent/20"
          >
             {isLoading ? 'VERIFYING...' : 'UNLOCK SYSTEM'}
             {!isLoading && <Lock size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
