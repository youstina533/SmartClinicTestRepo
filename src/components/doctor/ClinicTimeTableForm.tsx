import React, { useState } from 'react';
import { Doctor } from '../../types';
import { DoctorsApi } from '../../services/mockApi';
import {
  Clock,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
} from 'lucide-react';

interface ClinicTimeTableFormProps {
  doctor: Doctor;
  onClose: () => void;
  onSaved: (updatedDoctor: Doctor) => void;
}

export const ClinicTimeTableForm: React.FC<ClinicTimeTableFormProps> = ({
  doctor,
  onClose,
  onSaved,
}) => {
  const [address, setAddress] = useState(doctor.address || '');
  const [weeklySchedule, setWeeklySchedule] = useState<string[]>(
    doctor.weeklySchedule.length > 0 ? doctor.weeklySchedule : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  );
  const [workingHours, setWorkingHours] = useState(doctor.workingHours || '09:00 AM - 05:00 PM');
  const [appointmentPrice, setAppointmentPrice] = useState(doctor.appointmentPrice || 120);
  const [patientsPerDayLimit, setPatientsPerDayLimit] = useState(
    doctor.patientsPerDayLimit || 10
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (weeklySchedule.includes(day)) {
      if (weeklySchedule.length === 1) return; // Keep at least one day
      setWeeklySchedule(weeklySchedule.filter((d) => d !== day));
    } else {
      setWeeklySchedule([...weeklySchedule, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please provide the clinic practice address.');
      return;
    }
    if (weeklySchedule.length === 0) {
      setError('Please select at least one working day.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updated = await DoctorsApi.updateDoctorTimetable(doctor.id, {
        address: address.trim(),
        weeklySchedule,
        workingHours: workingHours.trim(),
        appointmentPrice: Number(appointmentPrice),
        patientsPerDayLimit: Number(patientsPerDayLimit),
      });

      onSaved(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update clinic time table.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Clinic Time Table Settings</h3>
              <p className="text-xs text-slate-400">
                Dr. {doctor.name} • {doctor.specialty}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinic Practice Address *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="e.g. 450 Medical Plaza, Suite 302, Boston MA"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Weekly Schedule Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Weekly Schedule (Working Days) *
            </label>
            <div className="flex flex-wrap gap-2">
              {allDays.map((day) => {
                const isSelected = weeklySchedule.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Daily Working Hours *
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                required
                placeholder="e.g. 09:00 AM - 05:00 PM"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Appointment Price & Max Patients per Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Appointment Price ($) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min={20}
                  max={600}
                  value={appointmentPrice}
                  onChange={(e) => setAppointmentPrice(Number(e.target.value))}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Patients Per Day *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={patientsPerDayLimit}
                  onChange={(e) => setPatientsPerDayLimit(Number(e.target.value))}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Default limit: 10 patients</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? 'Saving to DoctorsApi...' : 'Save Time Table Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
