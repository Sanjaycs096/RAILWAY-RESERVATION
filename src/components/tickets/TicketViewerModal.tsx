import React, { useState } from 'react';
import { Booking, Payment } from '../../types';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import {
  X, QrCode, Printer, AlertTriangle, CheckCircle2, ShieldCheck,
  CreditCard, Train, MapPin, Calendar, Clock, DollarSign, RefreshCw
} from 'lucide-react';

interface TicketViewerModalProps {
  booking: Booking;
  payment?: Payment | null;
  onClose: () => void;
  onTicketUpdated?: () => void;
}

export const TicketViewerModal: React.FC<TicketViewerModalProps> = ({
  booking,
  payment,
  onClose,
  onTicketUpdated
}) => {
  const { showToast } = useAuth();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Change of travel plans');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const isCancelled = booking.status === 'CANCELLED';
  const baseFare = booking.totalFare || booking.fare || 75;
  const cancellationFeeQuote = Math.round(baseFare * 0.15 * 100) / 100;
  const refundQuote = Math.max(0, Math.round((baseFare - cancellationFeeQuote) * 100) / 100);

  const handleCancelTicket = async () => {
    setIsCancelling(true);
    const res = await api.cancelBooking(booking.id, cancelReason);
    setIsCancelling(false);

    if (res.success && res.data) {
      showToast('success', 'Ticket Cancelled', `Refund of ₹${res.data.refundAmount} has been processed.`);
      if (onTicketUpdated) onTicketUpdated();
      onClose();
    } else {
      showToast('error', 'Cancellation Error', res.errors?.[0] || 'Unable to cancel ticket.');
    }
  };

  const handlePrintTicket = async () => {
    const element = document.getElementById('ticket-pdf-content');
    if (!element) return;
    try {
      showToast('info', 'Generating PDF...', 'Please wait while we prepare your ticket.');
      const imgData = await htmlToImage.toPng(element, { pixelRatio: 2 });
      // @ts-ignore
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Ticket_PNR_${booking.pnr}.pdf`);
    } catch(err: any) {
      console.error('PDF Generation Error:', err);
      showToast('error', 'Download Failed', err.message || 'Could not generate PDF.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div id="ticket-pdf-content" className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden text-xs text-slate-800 dark:text-slate-200">

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
              isCancelled
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              Status: {booking.status}
            </span>
            <span className="text-xs text-slate-300 font-mono">PNR: {booking.pnr}</span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">{booking.trainName}</h2>
          <p className="text-xs text-slate-300 mt-1">Train #{booking.trainNumber} • Class {booking.travelClass}</p>
        </div>

        {/* Ticket Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Cancellation Notice Banner */}
          {isCancelled && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Ticket Cancelled</span>
              </div>
              <p className="text-[11px]">
                Reason: {booking.cancellationReason || 'User requested cancellation'} • Refunded: <strong className="font-mono text-emerald-600">₹{booking.refundAmount?.toFixed(2)}</strong>
              </p>
            </div>
          )}

          {/* Origin & Destination Route Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">From Station</span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{booking.fromStationName}</p>
              <p className="font-mono text-slate-500">({booking.fromStationCode})</p>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{booking.journeyDate}</span>
              <div className="w-full h-0.5 bg-slate-300 dark:bg-slate-700 my-1 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-600"></div>
              </div>
              <span className="text-[10px] text-slate-400">Platform #{booking.platformNumber || 1}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">To Station</span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{booking.toStationName}</p>
              <p className="font-mono text-slate-500">({booking.toStationCode})</p>
            </div>
          </div>

          {/* Passenger & Seat Assignment */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Assigned Passengers & Seats</h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-700/50 text-[10px] uppercase text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">Passenger</th>
                    <th className="p-3">Age / Gender</th>
                    <th className="p-3">Coach</th>
                    <th className="p-3">Seat / Berth</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                  {booking.passengers && booking.passengers.length > 0 ? (
                    booking.passengers.map((p, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold">{p.name}</td>
                        <td className="p-3 text-slate-500">{p.age} yrs / {p.gender}</td>
                        <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{p.coachAssigned || booking.coachNumber}</td>
                        <td className="p-3 font-mono font-bold text-emerald-600">{p.seatAssigned || booking.seatNumber}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">{p.status || 'CONFIRMED'}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 font-semibold">{booking.passengerName}</td>
                      <td className="p-3 text-slate-500">Adult</td>
                      <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{booking.coachNumber}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{booking.seatNumber}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">{booking.status}</span></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* QR Barcode Section */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white text-slate-900 rounded-xl flex items-center justify-center p-2">
                <QrCode className="w-12 h-12" />
              </div>
              <div>
                <p className="font-bold text-sm">Security Verification QR</p>
                <p className="text-[11px] text-slate-400">Scan at automated platform gates and ticket inspectors</p>
                <p className="font-mono text-[10px] text-emerald-400 mt-1">PNR: {booking.pnr}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 font-bold">Total Fare</span>
              <p className="text-2xl font-mono font-extrabold text-amber-400">₹{baseFare.toFixed(2)}</p>
            </div>
          </div>

          {/* Cancellation Confirmation Box */}
          {isCancelConfirmOpen && !isCancelled && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Ticket Cancellation</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Cancellation Fee (15%): <strong className="font-mono text-red-600">₹{cancellationFeeQuote}</strong> • Estimated Refund Amount: <strong className="font-mono text-emerald-600">₹{refundQuote}</strong>
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="Change of travel plans">Change of travel plans</option>
                  <option value="Train delay or schedule conflict">Train delay or schedule conflict</option>
                  <option value="Duplicate booking made">Duplicate booking made</option>
                  <option value="Emergency cancellation">Emergency cancellation</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelConfirmOpen(false)}
                  className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  Keep Ticket
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancelTicket}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow flex items-center gap-1.5"
                >
                  {isCancelling ? 'Processing...' : `Confirm & Claim ₹${refundQuote} Refund`}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between" data-html2canvas-ignore>
          <button
            type="button"
            onClick={handlePrintTicket}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ticket</span>
          </button>

          <div className="flex items-center gap-2">
            {!isCancelled && !isCancelConfirmOpen && (
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs border border-red-500/20"
              >
                Cancel Ticket & Refund
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-indigo-900 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
