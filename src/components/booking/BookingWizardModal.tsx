import React, { useState, useEffect } from 'react';
import { Train, Coach, Seat, Passenger, Booking, Payment, Coupon } from '../../types';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { SeatMapGrid } from './SeatMapGrid';
import {
  X, CheckCircle2, User, Users, ShieldCheck, Tag, CreditCard,
  QrCode, ArrowRight, ArrowLeft, AlertCircle, Heart, Sparkles, Check, Download, Printer
} from 'lucide-react';

interface BookingWizardModalProps {
  train: Train;
  initialClass?: string;
  onClose: () => void;
  onBookingSuccess?: (booking: Booking) => void;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  train,
  initialClass = '2A',
  onClose,
  onBookingSuccess
}) => {
  const { user, showToast } = useAuth();

  // Wizard Steps: 1: Class/Date, 2: Passengers, 3: Seat Map, 4: Payment, 5: Confirmed Ticket
  const [step, setStep] = useState<number>(1);

  // Step 1 State
  const [journeyDate, setJourneyDate] = useState<string>('2026-08-01');
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);

  // Step 2 State - Passengers List
  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      name: user?.name || 'Sanjay Kumar',
      age: 34,
      gender: 'Male',
      berthPreference: 'Lower',
      isSeniorCitizen: false,
      specialAssistance: false,
      concessionType: 'None'
    }
  ]);

  // Step 3 State - Seat Selection
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [activeCoachIndex, setActiveCoachIndex] = useState<number>(0);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  // Step 4 State - Payment & Coupon
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'Stripe' | 'PayPal' | 'UPI' | 'Net Banking' | 'Credit Card' | 'Debit Card' | 'Wallet'>('UPI');
  const [upiId, setUpiId] = useState<string>('passenger@upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Step 5 State - Confirmed Ticket
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [confirmedPayment, setConfirmedPayment] = useState<Payment | null>(null);

  // Fetch seat map on class change
  useEffect(() => {
    const fetchSeats = async () => {
      const res = await api.getTrainSeats(train.trainNumber, selectedClass);
      if (res.success && res.data?.coaches) {
        setCoaches(res.data.coaches);
      }
    };
    fetchSeats();
  }, [train.trainNumber, selectedClass]);

  // Calculations
  const coachMeta = train.coaches.find(c => c.type === selectedClass) || train.coaches[0];
  const unitFare = coachMeta?.fare || 75;
  const rawBaseFare = unitFare * passengers.length;
  const taxAmount = Math.round((rawBaseFare - discountAmount) * 0.05 * 100) / 100;
  const finalFare = Math.max(0, Math.round((rawBaseFare - discountAmount + taxAmount) * 100) / 100);

  // Passenger Actions
  const handleAddPassenger = () => {
    if (passengers.length >= 6) {
      showToast('warning', 'Limit Reached', 'Maximum 6 passengers allowed per reservation ticket.');
      return;
    }
    setPassengers([
      ...passengers,
      {
        name: '',
        age: 28,
        gender: 'Male',
        berthPreference: 'Side Lower',
        isSeniorCitizen: false,
        specialAssistance: false,
        concessionType: 'None'
      }
    ]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    const updated = passengers.filter((_, idx) => idx !== index);
    setPassengers(updated);
    if (selectedSeats.length > updated.length) {
      setSelectedSeats(selectedSeats.slice(0, updated.length));
    }
  };

  const handleUpdatePassenger = (index: number, field: keyof Passenger, value: any) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };

    // Senior citizen auto detection
    if (field === 'age') {
      const ageNum = Number(value);
      if (ageNum >= 60) {
        updated[index].isSeniorCitizen = true;
        updated[index].concessionType = 'Senior Citizen';
      }
    }

    setPassengers(updated);
  };

  // Seat Selection Toggle
  const handleToggleSeat = (seat: Seat) => {
    const isAlreadySelected = selectedSeats.some(s => s.id === seat.id);
    if (isAlreadySelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= passengers.length) {
        showToast('info', 'Seats Matched', `Selected seats match your passenger count (${passengers.length}).`);
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Coupon Validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const res = await api.validateCoupon(couponCode, rawBaseFare);
    if (res.success && res.data?.valid) {
      setAppliedCoupon(res.data.coupon || null);
      setDiscountAmount(res.data.discount);
      showToast('success', 'Coupon Applied', `Saved $${res.data.discount} with code ${couponCode.toUpperCase()}`);
    } else {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      showToast('error', 'Coupon Invalid', res.message || 'Unable to apply promo coupon code.');
    }
  };

  // Final Payment Processing & Reservation
  const handleProcessReservation = async () => {
    setIsProcessingPayment(true);

    // Simulate 1.2s gateway handshake
    await new Promise(r => setTimeout(r, 1200));

    const selectedSeatIds = selectedSeats.map(s => s.seatNumber);

    const res = await api.createBooking({
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      fromStationCode: train.originCode,
      fromStationName: train.originName,
      toStationCode: train.destinationCode,
      toStationName: train.destinationName,
      journeyDate,
      travelClass: selectedClass,
      passengers,
      selectedSeatIds,
      paymentMethod,
      couponCode: appliedCoupon?.code,
      fare: rawBaseFare
    });

    setIsProcessingPayment(false);

    if (res.success && res.data) {
      setConfirmedBooking(res.data.booking);
      setConfirmedPayment(res.data.payment);
      setStep(5);
      showToast('success', 'Reservation Complete!', `PNR: ${res.data.booking.pnr} issued successfully.`);
      if (onBookingSuccess) onBookingSuccess(res.data.booking);
    } else {
      showToast('error', 'Payment Failed', res.errors?.[0] || 'Transaction rejected by gateway.');
    }
  };

  const handlePrintTicket = async () => {
    const element = document.getElementById('wizard-ticket-pdf-content');
    if (!element) return;
    try {
      showToast('info', 'Generating PDF...', 'Please wait while we prepare your ticket.');
      const imgData = await htmlToImage.toPng(element, { pixelRatio: 2 });
      // @ts-ignore
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Ticket_PNR_${confirmedBooking?.pnr}.pdf`);
    } catch(err: any) {
      console.error('PDF Generation Error:', err);
      showToast('error', 'Download Failed', err.message || 'Could not generate PDF.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                Module 1: Reservation Engine
              </span>
              <span className="text-xs text-slate-300 font-mono">#{train.trainNumber}</span>
            </div>
            <h2 className="text-xl font-extrabold mt-0.5 tracking-tight">{train.trainName}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Bar */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-3 border-b border-slate-200 dark:border-slate-700/60 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px] text-xs">
            <div className={`flex items-center gap-2 font-bold ${step >= 1 ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-indigo-900 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
              <span>Class & Date</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-700"></div>

            <div className={`flex items-center gap-2 font-bold ${step >= 2 ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-indigo-900 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
              <span>Passengers</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-700"></div>

            <div className={`flex items-center gap-2 font-bold ${step >= 3 ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-indigo-900 text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
              <span>Seat Selection</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-700"></div>

            <div className={`flex items-center gap-2 font-bold ${step >= 4 ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 4 ? 'bg-indigo-900 text-white' : 'bg-slate-200 text-slate-500'}`}>4</span>
              <span>Payment</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-700"></div>

            <div className={`flex items-center gap-2 font-bold ${step >= 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 5 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>5</span>
              <span>Digital Ticket</span>
            </div>
          </div>
        </div>

        {/* Body Content by Step */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800 dark:text-slate-200">

          {/* STEP 1: Class & Date Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Journey Date</label>
                  <input
                    type="date"
                    value={journeyDate}
                    onChange={e => setJourneyDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Route Corridor</label>
                  <p className="font-bold text-slate-900 dark:text-white pt-2">
                    {train.originName} ({train.originCode}) &rarr; {train.destinationName} ({train.destinationCode})
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Choose Coach Class</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {train.coaches.map(c => (
                    <div
                      key={c.type}
                      onClick={() => setSelectedClass(c.type)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedClass === c.type
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center font-extrabold text-sm">
                        <span>{c.type} - {c.name}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">₹{c.fare}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">Available Seats: <strong className="text-emerald-600">{c.availableSeats}</strong></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Multi-Passenger Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Passenger Details</h3>
                  <p className="text-slate-500 text-[11px]">Add up to 6 passengers for this ticket reservation.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPassenger}
                  className="px-3 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>+ Add Passenger</span>
                </button>
              </div>

              {passengers.map((p, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider text-[10px]">
                      Passenger #{idx + 1}
                    </span>
                    {passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePassenger(idx)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ananya Sharma"
                        value={p.name}
                        onChange={e => handleUpdatePassenger(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Age</label>
                      <input
                        type="number"
                        min="1"
                        max="110"
                        value={p.age}
                        onChange={e => handleUpdatePassenger(idx, 'age', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gender</label>
                      <select
                        value={p.gender}
                        onChange={e => handleUpdatePassenger(idx, 'gender', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Berth Preference</label>
                      <select
                        value={p.berthPreference}
                        onChange={e => handleUpdatePassenger(idx, 'berthPreference', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <option value="Lower">Lower Berth</option>
                        <option value="Middle">Middle Berth</option>
                        <option value="Upper">Upper Berth</option>
                        <option value="Side Lower">Side Lower</option>
                        <option value="Side Upper">Side Upper</option>
                        <option value="No Preference">No Preference</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={p.specialAssistance}
                          onChange={e => handleUpdatePassenger(idx, 'specialAssistance', e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        <span>Wheelchair Assistance</span>
                      </label>
                      {p.isSeniorCitizen && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold text-[10px]">
                          Senior Concession Eligible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: Interactive Seat Selection Grid */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Interactive Coach & Seat Map Selection</h3>
                <p className="text-slate-500 text-[11px]">Click on available green seats to reserve specific spots for your {passengers.length} passenger(s).</p>
              </div>

              <SeatMapGrid
                coaches={coaches}
                activeCoachIndex={activeCoachIndex}
                setActiveCoachIndex={setActiveCoachIndex}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
                maxPassengers={passengers.length}
              />
            </div>
          )}

          {/* STEP 4: Fare Itemization, Coupon & Payment Gateway */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left: Itemized Fare Breakdown */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Itemized Fare Breakdown</h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Base Fare ({passengers.length} x ₹{unitFare}):</span>
                      <span className="font-mono font-bold">₹{rawBaseFare.toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Promo Discount ({appliedCoupon?.code}):</span>
                        <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Taxes & GST (5%):</span>
                      <span className="font-mono">₹{taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between font-extrabold text-base text-slate-900 dark:text-white">
                      <span>Total Amount Due:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono">₹{finalFare.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Promo Coupon Form */}
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Apply Coupon / Promo Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. RAIL10, SUPER20"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono uppercase text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Available codes: <strong className="text-indigo-500">RAIL10</strong> (10% off), <strong className="text-indigo-500">SUPER20</strong> (20% off), <strong className="text-indigo-500">SENIOR50</strong> (₹250 off)</p>
                  </div>
                </div>

                {/* Right: Payment Gateway Simulator */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Select Payment Gateway</h3>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'UPI', label: 'UPI (GPay / PhonePe)' },
                      { id: 'Credit Card', label: 'Credit / Debit Card' },
                      { id: 'Razorpay', label: 'Razorpay Enterprise' },
                      { id: 'Stripe', label: 'Stripe Connect' },
                      { id: 'Net Banking', label: 'Net Banking' },
                      { id: 'Wallet', label: 'Railway Wallet' }
                    ].map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                          paymentMethod === pm.id
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-white ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Enter Virtual Payment Address (VPA)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                      />
                    </div>
                  )}

                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px]">
                    <ShieldCheck className="w-4 h-4 inline mr-1.5" />
                    Encrypted with 256-bit SSL Railway Banking Gateway Security.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 5: Confirmed Digital Ticket */}
          {step === 5 && confirmedBooking && (
            <div id="wizard-ticket-pdf-content" className="space-y-6 animate-fade-in">
              <div className="p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase text-[10px]">
                      Ticket Status: {confirmedBooking.status}
                    </span>
                    <h3 className="text-2xl font-extrabold tracking-tight mt-1">{confirmedBooking.trainName}</h3>
                    <p className="text-xs text-slate-300">Train #{confirmedBooking.trainNumber} • {confirmedBooking.travelClass} Class</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">PNR Number</span>
                    <p className="text-2xl font-mono font-extrabold text-amber-400">{confirmedBooking.pnr}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">From</span>
                    <p className="font-extrabold text-sm">{confirmedBooking.fromStationName}</p>
                    <p className="text-slate-400 font-mono">{confirmedBooking.fromStationCode}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">To</span>
                    <p className="font-extrabold text-sm">{confirmedBooking.toStationName}</p>
                    <p className="text-slate-400 font-mono">{confirmedBooking.toStationCode}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Journey Date</span>
                    <p className="font-extrabold text-sm">{confirmedBooking.journeyDate}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Coach / Seat</span>
                    <p className="font-extrabold text-sm text-emerald-400">{confirmedBooking.coachNumber} / {confirmedBooking.seatNumber}</p>
                  </div>
                </div>

                {/* SVG QR Visual Representation */}
                <div className="bg-white text-slate-900 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center p-2 font-mono text-[8px] leading-tight overflow-hidden">
                      <QrCode className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Digital Verification Barcode</p>
                      <p className="text-[11px] text-slate-500">Scan at platform turnstile or ticket inspection terminal</p>
                      <p className="font-mono text-[10px] text-slate-700 mt-1">Platform #{confirmedBooking.platformNumber || 1}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Total Paid</span>
                    <p className="text-xl font-mono font-extrabold text-emerald-600">₹{confirmedBooking.totalFare?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          {step > 1 && step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-2"
            >
              <span>Next: Passenger Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={() => {
                const invalid = passengers.some(p => !p.name.trim());
                if (invalid) {
                  showToast('error', 'Name Required', 'Please fill in all passenger names.');
                  return;
                }
                setStep(3);
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-2"
            >
              <span>Next: Seat Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-2"
            >
              <span>Next: Review & Payment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleProcessReservation}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-indigo-900 hover:from-emerald-600 hover:to-indigo-800 text-white font-bold text-xs shadow-lg flex items-center gap-2"
            >
              {isProcessingPayment ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Pay ₹{finalFare.toFixed(2)} & Confirm Ticket</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {step === 5 && (
            <div className="flex gap-2 w-full justify-between" data-html2canvas-ignore>
              <button
                type="button"
                onClick={handlePrintTicket}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ticket</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-indigo-900 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
