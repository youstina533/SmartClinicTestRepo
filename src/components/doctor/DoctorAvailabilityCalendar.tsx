import React, { useState, useEffect } from 'react';
import { Doctor, DayAvailability } from '../../types';
import { AvailabilityApi } from '../../services/mockApi';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface DoctorAvailabilityCalendarProps {
  doctor: Doctor;
}

export const DoctorAvailabilityCalendar: React.FC<DoctorAvailabilityCalendarProps> = ({
  doctor,
}) => {
  const [availabilities, setAvailabilities] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailabilities();
  }, [doctor.id]);

  const loadAvailabilities = async () => {
    setLoading(true);
    try {
      const data = await AvailabilityApi.getDoctorAvailability(doctor.id);
      setAvailabilities(data);
    } finally {
      setLoading(false);
    }
  };

  const fullyBookedCount = availabilities.filter((a) => !a.registerDateAvailability).length;
  const totalBookings = availabilities.reduce((acc, a) => acc + a.RegisteredCount, 0);
  const availableDays = availabilities.filter((a) => a.registerDateAvailability).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            AvailabilityApi • 60-Day Forward Forecast
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Schedule & Capacity Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of your daily 10-patient intake cap across the next 60 calendar days.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-2xl bg-teal-50 border border-teal-200/60 text-center">
            <div className="text-xl font-extrabold text-teal-700">{totalBookings}</div>
            <div className="text-[10px] font-semibold text-teal-800 uppercase">Total Bookings</div>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-center">
            <div className="text-xl font-extrabold text-emerald-700">{availableDays}</div>
            <div className="text-[10px] font-semibold text-emerald-800 uppercase">Open Days</div>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-rose-50 border border-rose-200/60 text-center">
            <div className="text-xl font-extrabold text-rose-700">{fullyBookedCount}</div>
            <div className="text-[10px] font-semibold text-rose-800 uppercase">10/10 Full</div>
          </div>
        </div>
      </div>

      {/* Info notice about 10-patient cap */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong>AvailabilityApi Business Logic:</strong> When{' '}
          <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-900 font-bold">
            RegisteredCount &gt;= 10
          </code>
          , the system automatically sets{' '}
          <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-rose-700 font-bold">
            registerDateAvailability = false
          </code>
          . Any day at capacity locks out further patient scheduling to prevent physician burnout.
        </div>
      </div>

      {/* 60-Day Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
          Computing 60-day availability records...
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>60-Day Day-by-Day Slot Allocation</span>
            <span className="text-xs text-slate-400 font-normal">
              (Green: Available, Red: Fully Booked)
            </span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2.5">
            {availabilities.map((slot) => {
              const isFull = !slot.registerDateAvailability;
              return (
                <div
                  key={slot.date}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col justify-between ${
                    isFull
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950 ring-1 ring-rose-200/80'
                      : 'bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {slot.dayOfWeek}
                    </div>
                    <div className="text-sm font-extrabold my-0.5 text-slate-900">
                      {slot.date.slice(5)}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60">
                    <div
                      className={`text-xs font-bold ${
                        isFull ? 'text-rose-600' : 'text-teal-700'
                      }`}
                    >
                      {slot.RegisteredCount} / 10
                    </div>
                    <div
                      className={`text-[9px] font-bold uppercase mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${
                        isFull
                          ? 'bg-rose-200/60 text-rose-800'
                          : 'bg-emerald-100/70 text-emerald-800'
                      }`}
                    >
                      {isFull ? 'Locked' : 'Open'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
