import React, { useState } from 'react';
import { Train, Route } from '../../types';
import { X, Clock, MapPin, ShieldCheck, CheckCircle2, AlertCircle, Info, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BookingWizardModal } from '../booking/BookingWizardModal';

interface TrainDetailsModalProps {
  train: Train | null;
  route: Route | null;
  onClose: () => void;
}

export const TrainDetailsModal: React.FC<TrainDetailsModalProps> = ({ train, route, onClose }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('2A');
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  if (!train) return null;

  const handleOpenWizard = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setIsWizardOpen(true);
  };

  if (isWizardOpen) {
    return (
      <BookingWizardModal
        train={train}
        initialClass={selectedClass}
        onClose={() => {
          setIsWizardOpen(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider">
              {train.type} Express
            </span>
            <span className="text-xs text-slate-300 font-mono">Train #{train.trainNumber}</span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">{train.trainName}</h2>
          <p className="text-xs text-slate-300 mt-1">
            {train.originName} ({train.originCode}) &rarr; {train.destinationName} ({train.destinationCode})
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Journey Timing Overview */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Departure</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{train.departureTime}</p>
              <p className="text-[11px] text-slate-500">{train.originName}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{train.duration}</span>
              <div className="w-full h-0.5 bg-slate-300 dark:bg-slate-700 my-1 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-600"></div>
              </div>
              <span className="text-[10px] text-slate-400">{train.runsOn.join(', ')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Arrival</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{train.arrivalTime}</p>
              <p className="text-[11px] text-slate-500">{train.destinationName}</p>
            </div>
          </div>

          {/* Coach Classes & Seat Selection */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Coach Class Availability & Fares</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {train.coaches.map(coach => (
                <div
                  key={coach.type}
                  onClick={() => setSelectedClass(coach.type)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedClass === coach.type
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-white ring-2 ring-indigo-500/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span>{coach.type} - {coach.name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹{coach.fare}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 flex justify-between items-center">
                    <span>Available Seats:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{coach.availableSeats}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Intermediate Station Stops Timeline */}
          {route && route.stops && (
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                Route Schedule & Station Halts ({route.stops.length} Stations)
              </h3>
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-700/50 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                    <tr>
                      <th className="p-3">Station</th>
                      <th className="p-3">Arrival</th>
                      <th className="p-3">Departure</th>
                      <th className="p-3">Distance</th>
                      <th className="p-3">Platform</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                    {route.stops.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="p-3 font-semibold">
                          {s.stationName} <span className="text-slate-400 font-mono text-[10px]">({s.stationCode})</span>
                        </td>
                        <td className="p-3 font-mono">{s.arrivalTime}</td>
                        <td className="p-3 font-mono">{s.departureTime}</td>
                        <td className="p-3">{s.distanceKm} km</td>
                        <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">Platform #{s.platformNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Reservation Trigger */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500">Selected Class: <strong className="text-slate-900 dark:text-white uppercase">{selectedClass}</strong></span>
          </div>
          <button
            onClick={handleOpenWizard}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-900 to-emerald-700 hover:from-indigo-800 hover:to-emerald-600 text-white font-bold shadow-md transition-all flex items-center gap-2"
          >
            <span>Proceed to Reservation & Seat Selection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
