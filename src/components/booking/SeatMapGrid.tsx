import React from 'react';
import { Coach, Seat } from '../../types';
import { CheckCircle2, User, Sparkles } from 'lucide-react';

interface SeatMapGridProps {
  coaches: Coach[];
  activeCoachIndex: number;
  setActiveCoachIndex: (idx: number) => void;
  selectedSeats: Seat[];
  onToggleSeat: (seat: Seat) => void;
  maxPassengers: number;
}

export const SeatMapGrid: React.FC<SeatMapGridProps> = ({
  coaches,
  activeCoachIndex,
  setActiveCoachIndex,
  selectedSeats,
  onToggleSeat,
  maxPassengers
}) => {
  if (!coaches || coaches.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        Loading coach layout and seat availability...
      </div>
    );
  }

  const currentCoach = coaches[activeCoachIndex] || coaches[0];

  return (
    <div className="space-y-4">
      {/* Coach Selector Tabs */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-400 pl-2">Select Coach:</span>
          {coaches.map((c, idx) => (
            <button
              key={c.coachNumber}
              type="button"
              onClick={() => setActiveCoachIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCoachIndex === idx
                  ? 'bg-indigo-900 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Coach {c.coachNumber} ({c.availableSeats} Left)
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[11px] pr-2">
          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> Available
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded bg-indigo-600 inline-block"></span> Selected
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded bg-slate-400 dark:bg-slate-600 inline-block"></span> Booked
          </span>
        </div>
      </div>

      {/* Seat Grid Layout */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Coach {currentCoach.coachNumber} ({currentCoach.classType}) • Total Seats: {currentCoach.totalSeats}
          </span>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            Selected {selectedSeats.length} of {maxPassengers} Seats
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-1">
          {currentCoach.seats.map(seat => {
            const isSelected = selectedSeats.some(s => s.id === seat.id);
            const isBooked = seat.status === 'booked';

            return (
              <button
                key={seat.id}
                type="button"
                disabled={isBooked}
                onClick={() => onToggleSeat(seat)}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-between h-16 ${
                  isBooked
                    ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                    : isSelected
                    ? 'bg-indigo-600 border-indigo-700 text-white shadow-md ring-2 ring-indigo-400 scale-105'
                    : 'bg-white dark:bg-slate-800 border-emerald-500/30 dark:border-emerald-500/20 text-slate-800 dark:text-slate-200 hover:border-emerald-500 hover:bg-emerald-500/10'
                }`}
              >
                <div className="flex items-center justify-between w-full text-[10px] font-mono font-bold">
                  <span>#{seat.seatNumber}</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>

                <span className={`text-[9px] font-semibold px-1 py-0.5 rounded ${
                  isSelected ? 'text-indigo-100' : isBooked ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {seat.berthType}
                </span>

                <span className="text-[9px] font-mono opacity-80">₹{seat.price}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
