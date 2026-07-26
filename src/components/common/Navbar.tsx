import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { Train, Radio, MapPin, Search, LayoutDashboard, ShieldCheck, Sun, Moon, LogIn, LogOut, User as UserIcon, BookOpen, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, darkMode, toggleDarkMode, activeTab, setActiveTab, openAuthModal, logout, setIsDocsOpen, demoQuickLogin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-900 via-blue-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/20 group-hover:scale-105 transition-transform duration-200">
            <Train className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">RailNet</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                v1.0 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block">National Railway System</p>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/50">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            Home
          </button>

          <button
            onClick={() => setActiveTab('trains')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'trains'
                ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Train Search
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tracking'
                ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            Live GPS Tracking
          </button>

          <button
            onClick={() => setActiveTab('stations')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stations'
                ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Stations Directory
          </button>

          {isAuthenticated && !isAdmin && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              My Dashboard
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-indigo-900 text-white shadow-sm'
                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Action Controls & User Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Smart Notification Center */}
          <NotificationCenter />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            type="button"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200 fill-slate-700/20" />
            )}
          </button>



          {/* Authentication State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize flex items-center justify-end gap-1">
                  {isAdmin && <ShieldAlert className="w-3 h-3 text-indigo-400" />}
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-950 dark:bg-indigo-900 hover:bg-indigo-900 text-white shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
