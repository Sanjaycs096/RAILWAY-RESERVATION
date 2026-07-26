import React, { useState, useEffect } from 'react';
import { Notification } from '../../types';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Bell, X, Check, CheckCheck, AlertCircle, Info, ShieldAlert,
  Ticket, Radio, CreditCard, Sparkles, Filter
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { isAuthenticated, showToast } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    const res = await api.getMyNotifications();
    if (res.success && res.data) {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 12000); // Poll every 12s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleMarkRead = async (id: string) => {
    const res = await api.markNotificationRead(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const res = await api.markAllNotificationsRead();
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast('info', 'Notifications Cleared', 'All notifications marked as read.');
    }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNREAD') return !n.isRead;
    if (activeFilter === 'BOOKING') return n.type === 'BOOKING_CONFIRMED' || n.type === 'CANCELLATION';
    if (activeFilter === 'DELAYS') return n.type === 'TRAIN_DELAY' || n.type === 'PLATFORM_CHANGE';
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return <Ticket className="w-4 h-4 text-emerald-500" />;
      case 'CANCELLATION':
      case 'REFUND':
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      case 'TRAIN_DELAY':
      case 'PLATFORM_CHANGE':
        return <Radio className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Smart Notification Center"
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over / Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-fade-in text-xs">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <h3 className="font-extrabold text-sm tracking-tight">Smart Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="p-2 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60 flex items-center gap-1 overflow-x-auto text-[10px]">
            {['ALL', 'UNREAD', 'BOOKING', 'DELAYS'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeFilter === cat
                    ? 'bg-indigo-900 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <Bell className="w-8 h-8 mx-auto opacity-30" />
                <p className="font-bold">No Notifications</p>
                <p className="text-[10px]">You are all caught up on railway alerts.</p>
              </div>
            ) : (
              filtered.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                    notif.isRead
                      ? 'bg-white dark:bg-slate-900 opacity-75'
                      : 'bg-indigo-50/50 dark:bg-indigo-950/30'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getNotifIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`font-bold truncate ${notif.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[9px] text-slate-400 shrink-0">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 leading-snug">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 text-[9px] text-slate-400">
                      <span className="uppercase font-mono">{notif.channel} • {notif.priority}</span>
                      {!notif.isRead && (
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Mark Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-center border-t border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-medium">Real-time Centralized Smart Notification Engine</span>
          </div>
        </div>
      )}
    </div>
  );
};
