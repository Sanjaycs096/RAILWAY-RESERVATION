import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register, forgotPassword, demoQuickLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(authModalMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'passenger' | 'admin'>('passenger');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  // Password Strength Check
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (mode === 'login') {
      await login({ email, password });
    } else if (mode === 'register') {
      await register({ name, email, password, role, phone });
    } else if (mode === 'forgot') {
      await forgotPassword(email);
      setMode('login');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-900/10 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {mode === 'login' && 'Passenger & Admin Login'}
            {mode === 'register' && 'Create Railway Account'}
            {mode === 'forgot' && 'Reset Account Password'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login' && 'Access bookings, live tracking telemetry, and profile.'}
            {mode === 'register' && 'Join the national railway network platform.'}
            {mode === 'forgot' && 'Enter your registered email to receive reset instructions.'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 text-xs font-semibold">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanjay Kumar"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@railway.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 dark:text-slate-300 font-medium">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>



              {/* Password Policy Indicator */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">Password Security Requirements:</p>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                    At least 6 characters
                  </span>
                </div>
              </div>
            </>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to Account'}
                  {mode === 'register' && 'Complete Registration'}
                  {mode === 'forgot' && 'Send Password Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold text-center text-slate-400 uppercase tracking-wider mb-2">
            Quick One-Click Demo Access
          </p>
          <div className="flex justify-center text-xs">
            <button
              onClick={() => demoQuickLogin('passenger')}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-center transition-colors"
            >
              Demo Passenger
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
