import React, { useState } from 'react';
import { api } from '../../api/client';
import { Megaphone, X, Send, Bell, AlertTriangle, Radio, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BroadcastNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastNotificationModal: React.FC<BroadcastNotificationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('SYSTEM_ALERT');
  const [priority, setPriority] = useState('NORMAL');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsSending(true);
    const res = await api.sendBroadcastNotification({ title, message, priority, type });

    if (res.success) {
      showToast('success', 'Broadcast Sent', 'Notification dispatched to all registered passenger and staff channels.');
      onClose();
    } else {
      showToast('error', 'Broadcast Failed', res.errors?.[0] || 'Failed to dispatch broadcast.');
    }
    setIsSending(false);
  };

  const templates = [
    { title: 'Track Maintenance Delay Notice', message: 'Train services on NDLS-MMCT route may experience 15-20 min delays due to track upgrade works.', type: 'TRAIN_DELAY', priority: 'HIGH' },
    { title: 'Severe Weather Emergency Advisory', message: 'Heavy monsoons reported along West Coast line. Passengers advised to check live tracking.', type: 'EMERGENCY_ALERT', priority: 'CRITICAL' },
    { title: 'Platform Realignment Update', message: 'Train #12002 Shatabdi Express arriving at Platform 4 instead of Platform 1.', type: 'PLATFORM_CHANGE', priority: 'HIGH' },
    { title: 'Holiday Ticket Booking Festival', message: 'Book Diwali & Festival tickets 60 days in advance with zero transaction fee on UPI.', type: 'SYSTEM_ALERT', priority: 'NORMAL' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-500 border border-indigo-500/30">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Broadcast System Notification</h3>
              <p className="text-xs text-slate-500">Dispatch real-time emergency & platform alerts across In-App, Push & Email channels.</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Templates */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-400">Preset Advisory Templates</label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTitle(tpl.title);
                  setMessage(tpl.message);
                  setType(tpl.type);
                  setPriority(tpl.priority);
                }}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{tpl.title}</div>
                <div className="text-[9px] text-slate-500 truncate">{tpl.message}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notification Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-bold"
              >
                <option value="SYSTEM_ALERT">System Alert</option>
                <option value="EMERGENCY_ALERT">Emergency Alert</option>
                <option value="TRAIN_DELAY">Train Delay Notice</option>
                <option value="PLATFORM_CHANGE">Platform Realignment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-bold"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="CRITICAL font-bold text-red-500">CRITICAL Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Alert Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule Alteration Notice"
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Alert Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Detailed message sent to all active users..."
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Dispatching...' : 'Dispatch Broadcast'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
