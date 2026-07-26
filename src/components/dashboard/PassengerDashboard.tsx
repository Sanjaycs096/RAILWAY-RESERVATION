import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../types';
import { api } from '../../api/client';
import { TicketViewerModal } from '../tickets/TicketViewerModal';
import { Ticket, User as UserIcon, Search, ShieldCheck, Clock, CheckCircle2, ArrowRight, Calendar, AlertCircle, Eye, Printer, Navigation } from 'lucide-react';

export const PassengerDashboard: React.FC = () => {
  const { user, setActiveTab, showToast } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pnrSearch, setPnrSearch] = useState<string>('');
  const [pnrResult, setPnrResult] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  const handleTrackTrain = (trainNumber: string) => {
    sessionStorage.setItem('tracking_train_number', trainNumber);
    setActiveTab('tracking');
  };

  const fetchMyBookings = async () => {
    setIsLoading(true);
    const res = await api.getMyBookings();
    if (res.success && res.data?.bookings) {
      setBookings(res.data.bookings);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handlePnrLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrSearch.trim()) return;

    const res = await api.getPNRStatus(pnrSearch.trim());
    if (res.success && res.data?.booking) {
      setPnrResult(res.data.booking);
      showToast('success', 'PNR Status Found', `Booking for ${res.data.booking.passengerName} confirmed.`);
    } else {
      setPnrResult(null);
      showToast('error', 'PNR Search Failed', res.errors?.[0] || 'Invalid or non-existent PNR number.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-2xl">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 uppercase">
                {user?.role} Tier
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{user?.email} • Member since {new Date(user?.createdAt || '').toLocaleDateString()}</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('trains')}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          <span>Book New Journey</span>
        </button>
      </div>

      {/* PNR Status Quick Verification Widget */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-500" />
          <span>Public PNR Status Search</span>
        </h3>
        <form onSubmit={handlePnrLookup} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter 10-Digit PNR Number (e.g., 8109234123)..."
            value={pnrSearch}
            onChange={e => setPnrSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs shadow transition-colors"
          >
            Check Status
          </button>
        </form>

        {pnrResult && (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
            <div className="flex flex-wrap justify-between items-center gap-2 font-bold text-emerald-400">
              <span>PNR #{pnrResult.pnr} Status: {pnrResult.status}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTrackTrain(pnrResult.trainNumber)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[11px] hover:bg-indigo-500 font-bold flex items-center gap-1.5 shadow"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Track Train</span>
                </button>
                <button
                  onClick={() => setSelectedTicket(pnrResult)}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] hover:bg-emerald-500 font-bold flex items-center gap-1 shadow"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Digital Ticket</span>
                </button>
              </div>
            </div>
            <p className="text-slate-300">
              Train: <strong>{pnrResult.trainName}</strong> (#{pnrResult.trainNumber}) from {pnrResult.fromStationName} to {pnrResult.toStationName}
            </p>
          </div>
        )}
      </div>

      {/* Bookings & Tickets List */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">My Active Tickets & Reservation History</h2>

        {bookings.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Ticket className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Active Reservations</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Book your first train journey using Train Search.</p>
            <button
              onClick={() => setActiveTab('trains')}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-900 text-white text-xs font-bold"
            >
              Search Trains
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map(bkg => (
              <div
                key={bkg.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      PNR #{bkg.pnr}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{bkg.trainName}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase ${
                    bkg.status === 'CANCELLED'
                      ? 'bg-red-500/10 border-red-500/30 text-red-600'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {bkg.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Route Journey</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {bkg.fromStationName} &rarr; {bkg.toStationName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Class & Seat</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {bkg.travelClass} • Coach {bkg.coachNumber} ({bkg.seatNumber})
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-slate-500 pt-1">
                  <span>Date: <strong>{bkg.journeyDate}</strong></span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTrackTrain(bkg.trainNumber)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                      title="Track Live GPS Location"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track Train</span>
                    </button>
                    <button
                      onClick={() => setSelectedTicket(bkg)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Ticket & QR</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Viewer Modal */}
      {selectedTicket && (
        <TicketViewerModal
          booking={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdated={() => {
            fetchMyBookings();
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
};
