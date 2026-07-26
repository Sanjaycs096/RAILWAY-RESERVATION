import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Train, Station, User, AuditLog } from '../../types';
import { api } from '../../api/client';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ReportsManager } from './ReportsManager';
import { BroadcastNotificationModal } from './BroadcastNotificationModal';

import {
  ShieldCheck, Train as TrainIcon, MapPin, Users, Activity, Plus,
  Trash2, RefreshCw, BarChart3, FileText, Megaphone, Sparkles, Shield
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, showToast } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'trains' | 'stations' | 'users' | 'analytics' | 'reports' | 'audit'>('trains');

  // Modals & Drawers
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);


  // Lists
  const [trains, setTrains] = useState<Train[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Pagination
  const [trainsPage, setTrainsPage] = useState(1);
  const [stationsPage, setStationsPage] = useState(1);
  const itemsPerPage = 10;

  // Forms modal
  const [isAddTrainOpen, setIsAddTrainOpen] = useState(false);
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);

  // New Train Form State
  const [newTrainNum, setNewTrainNum] = useState('');
  const [newTrainName, setNewTrainName] = useState('');
  const [newOrigin, setNewOrigin] = useState('NDLS');
  const [newDest, setNewDest] = useState('MMCT');
  const [newType, setNewType] = useState<'Superfast' | 'Rajdhani' | 'Vande Bharat' | 'Express'>('Superfast');

  // New Station Form State
  const [newStnCode, setNewStnCode] = useState('');
  const [newStnName, setNewStnName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZone, setNewZone] = useState('NR');

  const loadAdminData = async () => {
    setIsLoading(true);
    const [mRes, tRes, sRes, uRes, aRes] = await Promise.all([
      api.getAdminMetrics(),
      api.searchTrains(),
      api.getStations(),
      api.getAdminUsers(),
      api.getAuditLogs()
    ]);

    if (mRes.success) setMetrics(mRes.data?.metrics);
    if (tRes.success && tRes.data?.trains) { setTrains(tRes.data.trains); setTrainsPage(1); }
    if (sRes.success && sRes.data?.stations) { setStations(sRes.data.stations); setStationsPage(1); }
    if (uRes.success && uRes.data?.users) setUsersList(uRes.data.users);
    if (aRes.success && aRes.data?.auditLogs) setAuditLogs(aRes.data.auditLogs);

    setIsLoading(false);
  };

  const currentTrains = trains.slice((trainsPage - 1) * itemsPerPage, trainsPage * itemsPerPage);
  const totalTrainPages = Math.ceil(trains.length / itemsPerPage);

  const currentStations = stations.slice((stationsPage - 1) * itemsPerPage, stationsPage * itemsPerPage);
  const totalStationPages = Math.ceil(stations.length / itemsPerPage);

  const getVisiblePages = (currentPage: number, totalPages: number) => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, Math.max(5, currentPage + 2));
    if (currentPage <= 3) end = Math.min(5, totalPages);
    if (currentPage >= totalPages - 2) start = Math.max(1, totalPages - 4);
    return Array.from({ length: end - start + 1 }).map((_, i) => start + i);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.createTrain({
      trainNumber: newTrainNum,
      trainName: newTrainName,
      originCode: newOrigin,
      destinationCode: newDest,
      type: newType,
      departureTime: '09:00',
      arrivalTime: '21:00',
      duration: '12h 00m'
    });

    if (res.success) {
      showToast('success', 'Train Created', `Train #${newTrainNum} added successfully`);
      setIsAddTrainOpen(false);
      loadAdminData();
    } else {
      showToast('error', 'Error', res.errors?.[0] || 'Failed to create train');
    }
  };

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.createStation({
      code: newStnCode,
      name: newStnName,
      city: newCity,
      state: newState,
      zone: newZone,
      platforms: 6,
      latitude: 28.6139,
      longitude: 77.2090,
      amenities: ['Wi-Fi', 'Food Plaza', 'ATM']
    });

    if (res.success) {
      showToast('success', 'Station Created', `Station ${newStnCode.toUpperCase()} added`);
      setIsAddStationOpen(false);
      loadAdminData();
    } else {
      showToast('error', 'Error', res.errors?.[0] || 'Failed to create station');
    }
  };

  const handleDeleteTrain = async (id: string) => {
    if (!confirm('Are you sure you want to delete this train record?')) return;
    const res = await api.deleteTrain(id);
    if (res.success) {
      showToast('info', 'Train Deleted', 'Train removed from system.');
      loadAdminData();
    }
  };

  const handleDeleteStation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this station?')) return;
    const res = await api.deleteStation(id);
    if (res.success) {
      showToast('info', 'Station Deleted', 'Station removed from directory.');
      loadAdminData();
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const res = await api.updateUserStatus(userId, nextStatus);
    if (res.success) {
      showToast('success', 'Status Updated', `User status changed to ${nextStatus}`);
      loadAdminData();
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'passenger' ? 'admin' : 'passenger';
    const res = await api.updateUserRole(userId, nextRole);
    if (res.success) {
      showToast('success', 'Role Updated', `User role changed to ${nextRole}`);
      loadAdminData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Enterprise Admin Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System CRUD operations, user role administration, station directories, and security audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/20"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Broadcast Alert</span>
          </button>


          <button
            onClick={loadAdminData}
            className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Trains</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{metrics.totalTrains}</p>
            <p className="text-[10px] text-emerald-500 mt-1 font-semibold">{metrics.activeTrains} On Time</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Stations Indexed</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{metrics.totalStations}</p>
            <p className="text-[10px] text-slate-500 mt-1">Directory Verified</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Registered Users</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{metrics.totalUsers}</p>
            <p className="text-[10px] text-indigo-500 mt-1 font-semibold">{metrics.adminsCount} Administrators</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Security Audit Logs</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{metrics.auditLogsCount}</p>
            <p className="text-[10px] text-emerald-500 mt-1 font-semibold">{metrics.systemHealth}</p>
          </div>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl gap-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('trains')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'trains'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Manage Trains ({trains.length})
        </button>
        <button
          onClick={() => setActiveTab('stations')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'stations'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Manage Stations ({stations.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          User Roles ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Business Analytics
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Manage Trains */}
      {activeTab === 'trains' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Train Fleet Directory</h3>
            <button
              onClick={() => setIsAddTrainOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Train</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-700/50 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <tr>
                  <th className="p-3">Train #</th>
                  <th className="p-3">Train Name</th>
                  <th className="p-3">Route Corridor</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {currentTrains.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">#{t.trainNumber}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{t.trainName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{t.originCode} &rarr; {t.destinationCode}</td>
                    <td className="p-3 font-semibold">{t.type}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteTrain(t.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete Train"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Train Pagination Controls */}
          {totalTrainPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500">
                Showing {((trainsPage - 1) * itemsPerPage) + 1} to {Math.min(trainsPage * itemsPerPage, trains.length)} of {trains.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTrainsPage(Math.max(1, trainsPage - 1))}
                  disabled={trainsPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {getVisiblePages(trainsPage, totalTrainPages).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTrainsPage(p)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      trainsPage === p
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setTrainsPage(Math.min(totalTrainPages, trainsPage + 1))}
                  disabled={trainsPage === totalTrainPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manage Stations */}
      {activeTab === 'stations' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Station Terminals Directory</h3>
            <button
              onClick={() => setIsAddStationOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Station</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-700/50 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Station Name</th>
                  <th className="p-3">City & State</th>
                  <th className="p-3">Zone</th>
                  <th className="p-3">Platforms</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {currentStations.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{s.code}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{s.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{s.city}, {s.state}</td>
                    <td className="p-3 font-semibold">{s.zone}</td>
                    <td className="p-3 font-bold">{s.platforms}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteStation(s.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete Station"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Station Pagination Controls */}
          {totalStationPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500">
                Showing {((stationsPage - 1) * itemsPerPage) + 1} to {Math.min(stationsPage * itemsPerPage, stations.length)} of {stations.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setStationsPage(Math.max(1, stationsPage - 1))}
                  disabled={stationsPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {getVisiblePages(stationsPage, totalStationPages).map((p) => (
                  <button
                    key={p}
                    onClick={() => setStationsPage(p)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      stationsPage === p
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setStationsPage(Math.min(totalStationPages, stationsPage + 1))}
                  disabled={stationsPage === totalStationPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: User Roles & Access Control */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">User Accounts & Role Segregation</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-700/50 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserRole(u.id, u.role)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-500/20"
                      >
                        Toggle Role ({u.role === 'admin' ? 'Make Passenger' : 'Make Admin'})
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Business Analytics */}
      {activeTab === 'analytics' && <AnalyticsDashboard />}



      {/* Tab 6: Security Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Security & Audit Event Stream</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-700/50 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{log.action}</td>
                    <td className="p-3 text-slate-500">{log.resource}</td>
                    <td className="p-3 text-slate-400">{log.ipAddress}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Train Modal */}
      {isAddTrainOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-800 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Express Train</h3>
            <form onSubmit={handleCreateTrain} className="space-y-3">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Train Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12901"
                  value={newTrainNum}
                  onChange={e => setNewTrainNum(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Train Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gujarat Mail"
                  value={newTrainName}
                  onChange={e => setNewTrainName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Origin Code</label>
                  <input
                    type="text"
                    required
                    value={newOrigin}
                    onChange={e => setNewOrigin(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Destination Code</label>
                  <input
                    type="text"
                    required
                    value={newDest}
                    onChange={e => setNewDest(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTrainOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-900 text-white font-bold">
                  Save Train
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Station Modal */}
      {isAddStationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-800 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Railway Station</h3>
            <form onSubmit={handleCreateStation} className="space-y-3">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Station Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JAT"
                  value={newStnCode}
                  onChange={e => setNewStnCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jammu Tawi"
                  value={newStnName}
                  onChange={e => setNewStnName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Jammu"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Jammu & Kashmir"
                    value={newState}
                    onChange={e => setNewState(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStationOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-900 text-white font-bold">
                  Save Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Notification Modal */}
      <BroadcastNotificationModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
      />


    </div>
  );
};
