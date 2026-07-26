import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Train, Shield, Cpu, Activity, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, setIsDocsOpen } = useAuth();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-400 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Train className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">RailNet Enterprise</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-availability railway reservation, train status telemetry, and station directory foundation. Built for high-concurrency national transit operations.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>All Systems Operational (100% Uptime)</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Platform Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('trains')} className="hover:text-white transition-colors">
                  Train Search & Schedules
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('tracking')} className="hover:text-white transition-colors">
                  Live GPS Train Telemetry
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('stations')} className="hover:text-white transition-colors">
                  National Station Directory
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors">
                  Passenger Booking Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Security & System */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Security & Architecture</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>JWT Authentication & RBAC</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Express Clean Architecture</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Neon PostgreSQL Database</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; 2026 Railway Reservation & Live Tracking Platform. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
