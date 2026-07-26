import React, { useState, useEffect } from 'react';
import { Station } from '../../types';
import { api } from '../../api/client';
import { StationMapModal } from './StationMapModal';
import { SkeletonCard } from '../common/SkeletonLoader';
import { MapPin, Search, Building2, Wifi, Coffee, Layers, Globe, ArrowRight } from 'lucide-react';

export const StationDirectoryPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const fetchStations = async () => {
    setIsLoading(true);
    const res = await api.getStations(searchQuery, selectedZone);
    if (res.success && res.data?.stations) {
      setStations(res.data.stations);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStations();
  }, [searchQuery, selectedZone]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when stations change
  }, [stations]);

  const totalPages = Math.ceil(stations.length / itemsPerPage);
  const paginatedStations = stations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">National Station Directory</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore railway station codes, terminal zones, platform capacities, and passenger amenities across the rail network.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search station by name, code (NDLS, MMCT) or city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={selectedZone}
            onChange={e => setSelectedZone(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Railway Zones</option>
            <option value="NR">NR - Northern Railway</option>
            <option value="WR">WR - Western Railway</option>
            <option value="SR">SR - Southern Railway</option>
            <option value="SWR">SWR - South Western Railway</option>
            <option value="ER">ER - Eastern Railway</option>
          </select>
        </div>
      </div>

      {/* Station Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : stations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <MapPin className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Stations Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try resetting search filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedStations.map(stn => (
              <div
              key={stn.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-lg font-black font-mono px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {stn.code}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-full">
                    {stn.platforms} Platforms
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">{stn.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stn.city}, {stn.state} • Zone: <strong className="text-slate-700 dark:text-slate-200">{stn.zone}</strong>
                </p>

                {/* Amenities Badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {stn.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono text-[10px]">
                  {stn.latitude.toFixed(2)}°N, {stn.longitude.toFixed(2)}°E
                </span>
                <button
                  onClick={() => setSelectedStation(stn)}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Terminal Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          </div>

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

      {/* Station Map Modal */}
      {selectedStation && (
        <StationMapModal station={selectedStation} onClose={() => setSelectedStation(null)} />
      )}
    </div>
  );
};
