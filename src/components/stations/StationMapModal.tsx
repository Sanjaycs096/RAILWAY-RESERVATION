import React from 'react';
import { Station } from '../../types';
import { X, MapPin, Building2, Wifi, Coffee, CreditCard, ShieldAlert, Sparkles } from 'lucide-react';

interface StationMapModalProps {
  station: Station | null;
  onClose: () => void;
}

export const StationMapModal: React.FC<StationMapModalProps> = ({ station, onClose }) => {
  if (!station) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-lg">
            {station.code}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{station.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {station.city}, {station.state} • Zone: <strong className="text-indigo-600 dark:text-indigo-400">{station.zone}</strong>
            </p>
          </div>
        </div>

        {/* Spatial Map Graphic Placeholder */}
        <div className="relative h-48 w-full rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden text-white mb-6">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">GPS Coordinates</span>
              <p className="font-mono text-xs font-bold text-slate-200">{station.latitude}° N, {station.longitude}° E</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
              {station.platforms} Active Platforms
            </span>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
            <span className="text-xs font-bold text-white">Live Station Terminal Node Connected</span>
          </div>
        </div>

        {/* Station Amenities Grid */}
        <div className="space-y-3 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white">Passenger Amenities at {station.code}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {station.amenities.map((amenity, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs"
          >
            Close Directory Card
          </button>
        </div>
      </div>
    </div>
  );
};
