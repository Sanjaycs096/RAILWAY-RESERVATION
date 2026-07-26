import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Search, Train, Calendar, Radio, MapPin, ShieldCheck, ArrowRight, Clock, Award, Users, ChevronDown, Check, Zap, Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab } = useAuth();

  // Search state
  const [fromCode, setFromCode] = useState('NDLS');
  const [toCode, setToCode] = useState('MMCT');
  const [journeyDate, setJourneyDate] = useState('2026-08-01');
  const [travelClass, setTravelClass] = useState('2A');

  // Live PNR / Status quick check
  const [pnrInput, setPnrInput] = useState('');

  // Accordion open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [metrics, setMetrics] = useState({
    trainsCount: 5420,
    stationsCount: 8500,
    telemetryPrecision: 99.8,
    passengersServed: '12.5M+'
  });

  useEffect(() => {
    api.getPublicMetrics().then(res => {
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    }).catch(console.error);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('trains');
  };

  const faqs = [
    {
      q: "What features are included in Phase 1 Enterprise Foundation?",
      a: "Phase 1 implements complete train search, real-time GPS telemetry simulation, station directory, JWT role-based access control (Passenger vs. Admin), passenger dashboard, and admin CRUD management for trains, stations, routes, and security audit logging."
    },
    {
      q: "How does the Live Train GPS Tracking Telemetry work?",
      a: "Live tracking models spatial GPS coordinates, current speed in km/h, delay status in minutes, and stations passed vs. upcoming stops with high-precision route progress calculation."
    },
    {
      q: "Is the platform API architecture standardized?",
      a: "Yes! Every single REST endpoint enforces a unified response structure: { success: boolean, message: string, data: object } for success, and { success: false, message: string, errors: array } for failures."
    },
    {
      q: "Can I manage trains and stations as an Administrator?",
      a: "Absolutely. Switch to the Admin role using the Demo Quick Switcher in the top bar or sign in as Admin to access full CRUD operations, soft-delete capabilities, and live audit logs."
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background Decorative Blur */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl text-center mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enterprise Railway Reservation System • Version 1.0</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4">
              Next-Gen National <br />
              <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                Railway Network Platform
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Seamless ticket search, real-time train status telemetry, station directory, and passenger experience powered by robust clean architecture.
            </p>
          </div>

          {/* Railway Journey Search Bar */}
          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 text-slate-900 dark:text-white max-w-5xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  From Station
                </label>
                <div className="relative">
                  <Train className="w-4 h-4 absolute left-3 top-3 text-indigo-600 dark:text-indigo-400" />
                  <select
                    value={fromCode}
                    onChange={e => setFromCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="NDLS">NDLS - New Delhi</option>
                    <option value="MMCT">MMCT - Mumbai Central</option>
                    <option value="SBC">SBC - Bengaluru City</option>
                    <option value="MAS">MAS - Chennai Central</option>
                    <option value="HWH">HWH - Howrah Junction</option>
                    <option value="ADI">ADI - Ahmedabad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  To Station
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-emerald-600 dark:text-emerald-400" />
                  <select
                    value={toCode}
                    onChange={e => setToCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="MMCT">MMCT - Mumbai Central</option>
                    <option value="NDLS">NDLS - New Delhi</option>
                    <option value="SBC">SBC - Bengaluru City</option>
                    <option value="MAS">MAS - Chennai Central</option>
                    <option value="HWH">HWH - Howrah Junction</option>
                    <option value="ADI">ADI - Ahmedabad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Travel Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-indigo-500" />
                  <input
                    type="date"
                    value={journeyDate}
                    onChange={e => setJourneyDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Class & Quota
                </label>
                <div className="relative">
                  <select
                    value={travelClass}
                    onChange={e => setTravelClass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1A">AC 1st Class (1A)</option>
                    <option value="2A">AC 2-Tier (2A)</option>
                    <option value="3A">AC 3-Tier (3A)</option>
                    <option value="CC">AC Chair Car (CC)</option>
                    <option value="SL">Sleeper Class (SL)</option>
                  </select>
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-emerald-700 hover:from-indigo-800 hover:to-emerald-600 text-white font-bold text-sm shadow-xl shadow-indigo-950/40 transition-all flex items-center justify-center gap-3 group"
                >
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Search Trains & Check Availability</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Platform Key Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Train className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.trainsCount.toLocaleString()}+</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Daily Express Trains</p>
          </div>

          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.stationsCount.toLocaleString()}+</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Indexed Railway Stations</p>
          </div>

          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.telemetryPrecision}%</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Telemetry Precision</p>
          </div>

          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.passengersServed}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Passengers Served</p>
          </div>
        </div>
      </section>

      {/* 3. Featured Routes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              High-Speed Corridors
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Featured Railway Routes
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('trains')}
            className="mt-2 md:mt-0 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All Train Routes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Route 1 */}
          <div
            onClick={() => setActiveTab('trains')}
            className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold uppercase">
                Rajdhani Express
              </span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">₹2,250 / seat</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              New Delhi &rarr; Mumbai Central
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Train #12952 • 1,384 km • 15h 40m</p>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center text-xs text-slate-500">
              <span>Runs Daily</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                View Schedule <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Route 2 */}
          <div
            onClick={() => setActiveTab('trains')}
            className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold uppercase">
                Vande Bharat
              </span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">₹1,380 / seat</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              New Delhi &rarr; Ahmedabad
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Train #20901 • 890 km • 06h 15m</p>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center text-xs text-slate-500">
              <span>Except Tuesdays</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                View Schedule <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Route 3 */}
          <div
            onClick={() => setActiveTab('trains')}
            className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[10px] font-bold uppercase">
                Karnataka Superfast
              </span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">₹1,550 / seat</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              New Delhi &rarr; Bengaluru City
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Train #12628 • 2,398 km • 39h 40m</p>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center text-xs text-slate-500">
              <span>Runs Daily</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                View Schedule <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Platform Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Enterprise Grade
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Engineered for Modern Rail Transit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Built with strict software principles prioritizing security, real-time speed, and fault tolerance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Live Train GPS Telemetry</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time calculations for speed (km/h), upcoming station arrival countdown, and delay metrics with zero lag.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">JWT Security & Role Control</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Bcrypt password hashing, token refreshes, session timeout handling, and role segregation for Passengers and Admins.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Comprehensive Station Directory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore national railway stations, platform counts, spatial coordinates, and amenity checklists (Wi-Fi, lounges, food courts).
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQs Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Phase 1 Foundation details and technical capabilities
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex justify-between items-center font-bold text-slate-900 dark:text-white text-sm"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
