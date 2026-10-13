import React, { useState, useEffect } from 'react';
import { Doctor, DayAvailability } from '../../types';
import { AvailabilityApi, AppointmentsApi, getTodayDateString } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Phone,
  User,
  MapPin,
  Award,
  Undo2,
  Info,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface DoctorBookingViewProps {
  doctor: Doctor;
  onBack: () => void;
  onSuccess?: () => void;
}

export const DoctorBookingView: React.FC<DoctorBookingViewProps> = ({
  doctor,
  onBack,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [availableDates, setAvailableDates] = useState<DayAvailability[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  useEffect(() => {
    loadAvailableDates();
  }, [doctor.id]);

  const loadAvailableDates = async () => {
    setLoadingDates(true);
    try {
      // Per specification: "calendar listing ONLY dates where registerDateAvailability is true"
      const dates = await AvailabilityApi.getAvailableDatesOnly(doctor.id);
      setAvailableDates(dates);
      if (dates.length > 0) {
        setSelectedDate(dates[0].date);
      }
    } finally {
      setLoadingDates(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setError('Please select an available appointment date.');
      return;
    }
    if (!patientName.trim() || !patientPhone.trim()) {
      setError('Please provide patient name and phone number.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // No payment! Send name, phone and chosen date
      await AppointmentsApi.registerAppointment({
        patientId: user?.id || `patient-guest-${Date.now()}`,
        patientName: patientName.trim(),
        patientEmail: user?.email || `${patientName.toLowerCase().replace(/\s+/g, '')}@patient.smartclinic.com`,
        patientPhone: patientPhone.trim(),
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        appointmentDate: selectedDate,
        reason: 'Consultation with specialist',
      });

      setRegisteredSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isToday = selectedDate === getTodayDateString();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
      >
        <Undo2 className="w-3.5 h-3.5" />
        Back to Specialist Directory
      </button>

      {/* Doctor Info Card */}
      <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md ${
              doctor.specialty === 'Diabetes Specialist'
                ? 'bg-gradient-to-tr from-teal-600 to-cyan-500'
                : 'bg-gradient-to-tr from-rose-600 to-pink-500'
            }`}
          >
            {doctor.name.split(' ').slice(1).map((n) => n[0]).join('') || 'DR'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{doctor.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {doctor.specialty}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{doctor.qualification}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {doctor.address}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {doctor.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="text-left md:text-right p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
            Clinic Consultation Fee
          </span>
          <div className="text-2xl font-black text-teal-900">${doctor.appointmentPrice}</div>
          <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
            ✓ No payment required at booking
          </span>
        </div>
      </div>

      {/* Booking Form or Success */}
      {registeredSuccess ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">
            Appointment Registered Successfully!
          </h2>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 text-left">
            <div>
              <strong>Doctor:</strong> {doctor.name} ({doctor.specialty})
            </div>
            <div>
              <strong>Patient:</strong> {patientName} ({patientPhone})
            </div>
            <div>
              <strong>Scheduled Date:</strong> <span className="font-bold text-teal-700">{selectedDate}</span>
            </div>
            {isToday && (
              <div className="p-2 rounded-xl bg-teal-50 text-teal-900 font-semibold border border-teal-200">
                ⚡ Scheduled for today! This booking is now live in Dr. {doctor.name}'s TodayTimeTableApi.
              </div>
            )}
          </div>

          {/* Mandatory policy notice */}
          <div className="max-w-lg mx-auto p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 text-left">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block">Attendance Policy:</span>
              <span>If you do not attend on your chosen date, your booking will be cancelled automatically.</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition"
            >
              Done / Return to Directory
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Available Booking Dates (Next 60 Days)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Only showing dates where appointments are currently open (registerDateAvailability = true).
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Available dates grid: ONLY dates where registerDateAvailability is true */}
          {loadingDates ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading open slots...</div>
          ) : availableDates.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-slate-200 rounded-2xl">
              No dates currently available. All days for this doctor have reached the 10-patient limit.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2 max-h-56 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50/50">
              {availableDates.map((slot) => {
                const isSelected = selectedDate === slot.date;
                return (
                  <button
                    key={slot.date}
                    type="button"
                    onClick={() => setSelectedDate(slot.date)}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-500/30'
                        : 'bg-white hover:bg-teal-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {slot.dayOfWeek}
                    </span>
                    <span className="text-sm font-extrabold my-0.5">{slot.date.slice(5)}</span>
                    <span
                      className={`text-[9px] font-bold ${
                        isSelected ? 'text-teal-100' : 'text-slate-400'
                      }`}
                    >
                      {slot.RegisteredCount}/10 Booked
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Patient Details: name and phone */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Patient Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Patient Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    placeholder="e.g. John Davis"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Patient Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    required
                    placeholder="e.g. +1 (555) 789-0123"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory notice per prompt requirement */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block">Notice:</span>
              <p className="mt-0.5 leading-relaxed">
                If you do not attend on your chosen date, your booking will be cancelled automatically.
              </p>
            </div>
          </div>

          {/* Register action: No payment */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Selected: <strong className="text-slate-900">{selectedDate || 'None'}</strong> • No payment required.
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedDate}
              className="px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Registering Booking...' : 'Register (No Payment)'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
