import React, { useState } from 'react';
import { api } from '../../api/client';
import { FileText, Download, Calendar, CheckCircle2, Clock, Mail, Shield, Filter, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ReportsManager: React.FC = () => {
  const { showToast } = useAuth();
  const [selectedType, setSelectedType] = useState('revenue');
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [scheduledFrequency, setScheduledFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [scheduleEmail, setScheduleEmail] = useState('admin@railway.gov');
  const [isScheduled, setIsScheduled] = useState(false);

  const reportTypes = [
    { id: 'revenue', title: 'Revenue & Sales Report', desc: 'Gross fare breakdown, refund deductions, and class revenue share' },
    { id: 'bookings', title: 'Passenger Booking Manifest', desc: 'Detailed PNR log with passenger demographics, seat numbers & fares' },
    { id: 'trains', title: 'Train Operations & Delay Report', desc: 'Fleet performance, delay minutes, and punctuality indexes' },
    { id: 'refunds', title: 'Refunds & Cancellation Audit', desc: 'Processed cancellations, cancellation fees, and refund turnaround times' },
    { id: 'stations', title: 'Station Terminal Traffic Report', desc: 'Platform utilization, amenities status, and boarding volumes' },
    { id: 'ai', title: 'AI Operational Insights & Forecasts', desc: 'Predictive demand curves, route optimization, and delay alerts' },
    { id: 'audit', title: 'System Security Audit Trail', desc: 'User logins, CRUD actions, IP tracking, and permission updates' }
  ];

  const handleDownload = async (typeId: string) => {
    try {
      await api.downloadReport(typeId);
      showToast('success', 'Report Exported', `${typeId.toUpperCase()} report downloaded successfully.`);
    } catch(err) {
      showToast('error', 'Download Failed', 'Could not generate report.');
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduled(true);
    showToast('success', 'Report Scheduled', `Automated ${scheduledFrequency} report will be sent to ${scheduleEmail}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-500" />
          <span>Enterprise Reporting & Export Hub</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generate compliant audit logs, revenue ledgers, passenger manifests, and AI operational summaries in PDF, CSV, or Excel formats.
        </p>
      </div>

      {/* Grid of Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((rpt) => (
          <div
            key={rpt.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
              selectedType === rpt.id
                ? 'bg-indigo-950/20 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                  Official Ledger
                </span>
                <button
                  onClick={() => setSelectedType(rpt.id)}
                  className="text-xs text-slate-400 hover:text-indigo-500"
                >
                  Select
                </button>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{rpt.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rpt.desc}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-400">CSV • PDF • EXCEL</span>
              <button
                onClick={() => handleDownload(rpt.id)}
                className="px-3 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Automated Report Scheduling Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-500 border border-indigo-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Automated Scheduled Report Delivery</h3>
            <p className="text-xs text-slate-500">Configure recurring automated report dispatch directly to administrator email addresses.</p>
          </div>
        </div>

        <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pt-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Frequency</label>
            <select
              value={scheduledFrequency}
              onChange={(e: any) => setScheduledFrequency(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-600"
            >
              <option value="daily">Daily Midnight Summary</option>
              <option value="weekly">Weekly Operational Digest</option>
              <option value="monthly">Monthly Financial Ledger</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Format</label>
            <select
              value={selectedFormat}
              onChange={(e: any) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-600"
            >
              <option value="csv">CSV Spreadsheets</option>
              <option value="pdf">PDF Document with Charts</option>
              <option value="excel">Microsoft Excel (.xlsx)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Recipient Email</label>
            <input
              type="email"
              value={scheduleEmail}
              onChange={(e) => setScheduleEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-600"
              required
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
          >
            <Clock className="w-4 h-4" />
            <span>Enable Automated Dispatch</span>
          </button>
        </form>

        {isScheduled && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Automated report cron schedule activated for <strong>{scheduleEmail}</strong> ({scheduledFrequency.toUpperCase()} frequency).</span>
          </div>
        )}
      </div>
    </div>
  );
};
