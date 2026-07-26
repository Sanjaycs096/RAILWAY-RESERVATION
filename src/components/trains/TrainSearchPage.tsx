import React, { useState, useEffect } from 'react';
import { Train, Route, SearchFilters } from '../../types';
import { api } from '../../api/client';
import { TrainDetailsModal } from './TrainDetailsModal';
import { SkeletonCard } from '../common/SkeletonLoader';
import { Search, Filter, ArrowUpDown, Train as TrainIcon, Clock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const TrainSearchPage: React.FC = () => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Filters state
  const [fromCode, setFromCode] = useState<string>('');
  const [toCode, setToCode] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [trainType, setTrainType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'departure' | 'duration'>('departure');

  // Modal State
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const fetchTrains = async () => {
    setIsLoading(true);
    const filters: SearchFilters = {
      fromCode,
      toCode,
      trainNumberOrName: searchTerm,
      trainType,
      sortBy
    };

    const res = await api.searchTrains(filters);
    if (res.success && res.data?.trains) {
      setTrains(res.data.trains);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTrains();
  }, [fromCode, toCode, trainType, sortBy]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters or trains change
  }, [trains]);

  const totalPages = Math.ceil(trains.length / itemsPerPage);
  const paginatedTrains = trains.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrains();
  };

  const handleInspectTrain = async (train: Train) => {
    setSelectedTrain(train);
    const res = await api.getTrainDetails(train.id);
    if (res.success && res.data?.route) {
      setSelectedRoute(res.data.route);
    } else {
      setSelectedRoute(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Train Schedule & Seat Directory</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time train departure schedules, coach class availability, fares, and halt times across national stations.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">From Station</label>
            <input
              type="text"
              placeholder="e.g. NDLS"
              value={fromCode}
              onChange={e => setFromCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white uppercase font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">To Station</label>
            <input
              type="text"
              placeholder="e.g. MMCT"
              value={toCode}
              onChange={e => setToCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white uppercase font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Train # or Name</label>
            <input
              type="text"
              placeholder="Search Rajdhani, 12952..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Train Type</label>
            <select
              value={trainType}
              onChange={e => setTrainType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            >
              <option value="ALL">All Train Types</option>
              <option value="Rajdhani">Rajdhani Express</option>
              <option value="Vande Bharat">Vande Bharat</option>
              <option value="Superfast">Superfast Express</option>
              <option value="Express">Express</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Filter Trains</span>
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-3 text-xs text-slate-500">
          <span>Showing <strong>{trains.length}</strong> active express trains</span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Sort By:</span>
            <button
              onClick={() => setSortBy('departure')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                sortBy === 'departure'
                  ? 'bg-indigo-900 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Departure Time
            </button>
            <button
              onClick={() => setSortBy('duration')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                sortBy === 'duration'
                  ? 'bg-indigo-900 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Duration
            </button>
          </div>
        </div>
      </div>

      {/* Train Cards List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : trains.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <TrainIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Trains Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try clearing filters or searching for NDLS or MMCT.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedTrains.map(train => (
            <div
              key={train.id}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <TrainIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{train.trainName}</h3>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                        #{train.trainNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Type: <span className="font-semibold text-slate-700 dark:text-slate-300">{train.type}</span> • Runs: {train.runsOn.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    train.status === 'On Time'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  }`}>
                    {train.status} {train.delayMinutes > 0 && `(+${train.delayMinutes}m)`}
                  </span>
                  <button
                    onClick={() => handleInspectTrain(train)}
                    className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs shadow transition-colors flex items-center gap-1.5"
                  >
                    <span>View Fares & Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Timing & Stations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Departure</span>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">{train.departureTime}</p>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">{train.originName} ({train.originCode})</p>
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{train.duration}</span>
                  <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-700 my-1 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                  <span className="text-[10px] text-slate-400">Direct Route</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Arrival</span>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">{train.arrivalTime}</p>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">{train.destinationName} ({train.destinationCode})</p>
                </div>
              </div>

              {/* Coach Classes Badges */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 mr-2">Available Classes:</span>
                {train.coaches.map(c => (
                  <span key={c.type} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 font-medium">
                    {c.type}: <strong className="text-emerald-600 dark:text-emerald-400">₹{c.fare}</strong> ({c.availableSeats} seats)
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 pt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Simple sliding window for page numbers
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Train Details Modal */}
      {selectedTrain && (
        <TrainDetailsModal
          train={selectedTrain}
          route={selectedRoute}
          onClose={() => {
            setSelectedTrain(null);
            setSelectedRoute(null);
          }}
        />
      )}
    </div>
  );
};
