import React, { useState, useEffect } from 'react';
import { LiveTracking } from '../../types';
import { api } from '../../api/client';
import { Radio, Gauge, Clock, Navigation, CheckCircle2, MapPin, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { IndiaTrainMap } from './IndiaTrainMap';

export const LiveTrackingPage: React.FC = () => {
  const [selectedTrainNum, setSelectedTrainNum] = useState<string>(() => {
    return sessionStorage.getItem('tracking_train_number') || '12952';
  });
  const [trackingData, setTrackingData] = useState<LiveTracking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [availableTrains, setAvailableTrains] = useState<any[]>([]);

  useEffect(() => {
    // Fetch some real trains for the dropdown
    api.searchTrains().then(res => {
      if (res.success && res.data?.trains?.length > 0) {
        const topTrains = res.data.trains.slice(0, 10);
        setAvailableTrains(topTrains);
        if (!sessionStorage.getItem('tracking_train_number')) {
          setSelectedTrainNum(topTrains[0].trainNumber);
        }
      }
    }).catch(console.error);
  }, []);

  const handleSelectTrain = (num: string) => {
    setSelectedTrainNum(num);
    sessionStorage.setItem('tracking_train_number', num);
  };

  const fetchTracking = async (num: string) => {
    setIsLoading(true);
    const res = await api.getLiveTracking(num);
    if (res.success && res.data?.tracking) {
      setTrackingData(res.data.tracking);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTracking(selectedTrainNum);
    const interval = setInterval(() => fetchTracking(selectedTrainNum), 10000); // Poll telemetry every 10s
    return () => clearInterval(interval);
  }, [selectedTrainNum]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Live GPS Train Tracking Telemetry
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time GPS coordinates, speed, delay calculations, and intermediate station route progress.
          </p>
        </div>

        {/* Train Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase">Track Train:</label>
          <select
            value={selectedTrainNum}
            onChange={e => handleSelectTrain(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            {availableTrains.map(t => (
              <option key={t.trainNumber} value={t.trainNumber}>
                #{t.trainNumber} - {t.trainName}
              </option>
            ))}
            {availableTrains.length === 0 && <option value="12952">Loading trains...</option>}
          </select>
          <button
            onClick={() => fetchTracking(selectedTrainNum)}
            className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
            title="Refresh GPS Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {trackingData && (
        <div className="space-y-6">
          {/* Main Status & Metrics Grid */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                    GPS SATELLITE LINK ACTIVE
                  </span>
                  <span className="text-xs font-mono text-slate-400">Train #{trackingData.trainNumber}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{trackingData.trainName}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  En route from <strong className="text-slate-200">{trackingData.currentStation}</strong> to <strong className="text-slate-200">{trackingData.nextStation}</strong>
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-2xl border text-center ${
                  trackingData.status === 'On Time'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  <span className="text-[10px] font-bold uppercase block">Current Schedule Status</span>
                  <span className="text-base font-extrabold">{trackingData.status} {trackingData.delayMinutes > 0 && `(+${trackingData.delayMinutes}m)`}</span>
                </div>
              </div>
            </div>

            {/* Live Metrics Telemetry Panel */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs">
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <Gauge className="w-4 h-4" />
                  <span className="font-bold">Current Speed</span>
                </div>
                <p className="text-xl font-extrabold text-white">{trackingData.speedKmh} <span className="text-xs font-normal text-slate-400">km/h</span></p>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <Navigation className="w-4 h-4" />
                  <span className="font-bold">Progress Completed</span>
                </div>
                <p className="text-xl font-extrabold text-white">{trackingData.progressPercent}%</p>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <div className="flex items-center gap-2 text-sky-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="font-bold">GPS Coordinates</span>
                </div>
                <p className="text-xs font-mono font-bold text-white mt-1">
                  {trackingData.coordinates.lat.toFixed(4)}° N, {trackingData.coordinates.lng.toFixed(4)}° E
                </p>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <div className="flex items-center gap-2 text-amber-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-bold">Last Telemetry Ping</span>
                </div>
                <p className="text-xs font-mono text-slate-300 mt-1">
                  {new Date(trackingData.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Route Progress Bar */}
            <div className="mt-8">
              <div className="flex justify-between items-center text-xs mb-2 text-slate-300 font-semibold">
                <span>Origin: {trackingData.originName || trackingData.stopsPassed[0]?.stationName || trackingData.currentStation}</span>
                <span>Destination: {trackingData.destinationName || trackingData.upcomingStops[trackingData.upcomingStops.length - 1]?.stationName || trackingData.nextStation}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${trackingData.progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-lg shadow-white/50 animate-ping"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Indian Map for GPS Tracking */}
          <IndiaTrainMap trackingData={trackingData} />

          {/* Detailed Stops Timeline */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Route Station Progress Log</h3>

            <div className="space-y-3">
              {/* Completed Stops */}
              {trackingData.stopsPassed.map((stop, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 dark:text-white">{stop.stationName} ({stop.stationCode})</span>
                    <span className="text-slate-400 text-[10px] ml-2 font-mono">Passed • {stop.distanceKm} km</span>
                  </div>
                  <div className="text-right font-mono text-slate-500">
                    <span>Arr: {stop.arrivalTime}</span> | <span>Dep: {stop.departureTime}</span>
                  </div>
                </div>
              ))}

              {/* Upcoming Stops */}
              {trackingData.upcomingStops.map((stop, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs opacity-80">
                  <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{stop.stationName} ({stop.stationCode})</span>
                    <span className="text-slate-400 text-[10px] ml-2 font-mono">Upcoming • {stop.distanceKm} km</span>
                  </div>
                  <div className="text-right font-mono text-slate-400">
                    <span>Platform #{stop.platformNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
