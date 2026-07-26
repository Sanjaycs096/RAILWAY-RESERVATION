import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';

import { Sparkles } from 'lucide-react';

import { LandingPage } from './components/landing/LandingPage';
import { TrainSearchPage } from './components/trains/TrainSearchPage';
import { StationDirectoryPage } from './components/stations/StationDirectoryPage';
import { LiveTrackingPage } from './components/tracking/LiveTrackingPage';
import { PassengerDashboard } from './components/dashboard/PassengerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

const MainContent: React.FC = () => {
  const { activeTab, isAdmin } = useAuth();

  return (
    <main className="flex-1">
      {activeTab === 'home' && <LandingPage />}
      {activeTab === 'trains' && <TrainSearchPage />}
      {activeTab === 'stations' && <StationDirectoryPage />}
      {activeTab === 'tracking' && <LiveTrackingPage />}
      {activeTab === 'dashboard' && (!isAdmin ? <PassengerDashboard /> : <AdminDashboard />)}
      {activeTab === 'admin' && <AdminDashboard />}
    </main>
  );
};

export default function App() {


  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-indigo-500 selection:text-white relative">
        <Navbar />
        <MainContent />
        <Footer />
        <AuthModal />
        <ToastContainer />


      </div>
    </AuthProvider>
  );
}
