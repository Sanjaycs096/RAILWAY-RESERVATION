import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, Users, IndianRupee, Clock, AlertTriangle, MapPin,
  Download, Filter, Activity, PieChart as PieIcon, BarChart3, RefreshCw
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const loadAnalytics = async () => {
    setIsLoading(true);
    const res = await api.getAnalyticsOverview();
    if (res.success && res.data) {
      setData(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const { metrics, revenueTrends, popularRoutes, classDistribution, stationTraffic, delayStats } = data;

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" />
            <span>Business Intelligence & Operational Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time revenue telemetry, occupancy heatmaps, delay statistics, and passenger traffic analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e: any) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Quarterly (90D)</option>
            <option value="1y">Year to Date (1Y)</option>
          </select>

          <button
            onClick={() => api.downloadReport('revenue')}
            className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Export Analytics CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">₹{metrics.totalRevenue.toLocaleString()}</p>
          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% vs last month
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Bookings</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics.totalBookings.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-semibold">Average 120 bookings/day</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">On-Time Reliability</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{delayStats.onTimePercentage}%</p>
          <span className="text-[10px] text-emerald-500 font-semibold">Avg Delay: {delayStats.averageDelayMinutes} mins</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cancellation Rate</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics.cancellationRatePct}%</p>
          <span className="text-[10px] text-slate-500 font-semibold">Instant refund processing</span>
        </div>
      </div>

      {/* Main Charts Row 1: Revenue & Bookings Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Revenue & Volume Trend</h3>
              <p className="text-xs text-slate-500">Gross fare revenue (₹) and total seats booked per month</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrends}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Travel Class Share Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Travel Class Breakdown</h3>
            <PieIcon className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classDistribution}
                  dataKey="percentage"
                  nameKey="classType"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={45}
                  paddingAngle={5}
                >
                  {classDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
            {classDistribution.map((c: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">{c.classType}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{c.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Popular Corridors & Station Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Corridors */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Highest Density Train Corridors</h3>
          <div className="space-y-3">
            {popularRoutes.map((r: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center font-bold text-xs text-slate-900 dark:text-white">
                  <span>{r.corridor}</span>
                  <span className="text-emerald-500">{r.occupancyPct}% Occupancy</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${r.occupancyPct}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Est. Fare Revenue: ${r.revenue.toLocaleString()}</span>
                  <span>Avg Delay: {r.delaysAvgMin} mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Station Traffic & Platform Utilization */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Station Hub Passenger Traffic</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-700/50 uppercase text-slate-500 dark:text-slate-400 font-bold">
                <tr>
                  <th className="p-2.5">Station Code</th>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Daily Passengers</th>
                  <th className="p-2.5">Platform Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {stationTraffic.map((stn: any) => (
                  <tr key={stn.stationCode} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-2.5 font-bold font-mono text-indigo-600 dark:text-indigo-400">{stn.stationCode}</td>
                    <td className="p-2.5 text-slate-900 dark:text-white font-semibold">{stn.stationName}</td>
                    <td className="p-2.5 font-bold text-slate-700 dark:text-slate-200">{stn.dailyPassengers.toLocaleString()}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                        {stn.utilizationRatePct}% Capacity
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
