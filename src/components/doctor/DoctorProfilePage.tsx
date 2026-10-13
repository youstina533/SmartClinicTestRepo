import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Doctor } from '../../types';
import { ClinicTimeTableForm } from './ClinicTimeTableForm';
import {
  User,
  Clock,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Award,
  Users,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';

interface DoctorProfilePageProps {
  onNavigate: (tab: string, context?: any) => void;
}

export const DoctorProfilePage: React.FC<DoctorProfilePageProps> = ({ onNavigate }) => {
  const { user, doctorProfile, refreshDoctorProfile } = useAuth();
  const [showTimeTableModal, setShowTimeTableModal] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // First-time doctor prompt: "First-time doctors see it right after the first login"
  useEffect(() => {
    if (doctorProfile && doctorProfile.hasCompletedTimetableSetup === false) {
      setShowTimeTableModal(true);
    }
  }, [doctorProfile]);

  if (!doctorProfile) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Doctor Profile Loading...</h3>
      </div>
    );
  }

  const handleSaved = async (updatedDoc: Doctor) => {
    setShowTimeTableModal(false);
    await refreshDoctorProfile();
    setSaveSuccessNotice('Clinic Time Table settings successfully saved to DoctorsApi!');
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2 border border-teal-200/60">
            <User className="w-3.5 h-3.5" />
            Physician Practice
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Doctor Profile & Clinic Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your credentials, weekly availability timetable, and daily intake caps.
          </p>
        </div>

        {/* Button to edit timetable */}
        <button
          onClick={() => setShowTimeTableModal(true)}
          className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Clock className="w-4 h-4" />
          Edit Clinic Time Table
        </button>
      </div>

      {saveSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveSuccessNotice}</span>
        </div>
      )}

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-sm space-y-8">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md ${
              doctorProfile.specialty === 'Diabetes Specialist'
                ? 'bg-gradient-to-tr from-teal-600 to-cyan-500'
                : 'bg-gradient-to-tr from-rose-600 to-pink-500'
            }`}
          >
            {doctorProfile.name.split(' ').slice(1).map((n) => n[0]).join('') || 'DR'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900">{doctorProfile.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-teal-50 text-teal-700 border border-teal-200">
                {doctorProfile.specialty}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-teal-600" />
              {doctorProfile.qualification}
            </p>
          </div>
        </div>

        {/* Contact details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-teal-600" />
              Email Address
            </span>
            <span className="text-sm font-bold text-slate-900 block truncate">
              {doctorProfile.email}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              Phone Number
            </span>
            <span className="text-sm font-bold text-slate-900 block truncate">
              {doctorProfile.phone}
            </span>
          </div>
        </div>

        {/* Current Clinic Time Table Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              Active Clinic Time Table
            </h3>
            <button
              onClick={() => setShowTimeTableModal(true)}
              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Settings
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Address */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
              <span className="text-slate-400 font-medium block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Clinic Practice Address
              </span>
              <span className="font-extrabold text-slate-900 text-sm block">
                {doctorProfile.address}
              </span>
            </div>

            {/* Weekly Schedule Days */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-slate-400 font-medium block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Weekly Schedule Days
              </span>
              <div className="flex flex-wrap gap-1.5">
                {doctorProfile.weeklySchedule.map((day) => (
                  <span
                    key={day}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-100 text-teal-800"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Working Hours
              </span>
              <span className="font-extrabold text-slate-900 text-sm block">
                {doctorProfile.workingHours || '09:00 AM - 05:00 PM'}
              </span>
            </div>

            {/* Price */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium block flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                Appointment Price
              </span>
              <span className="font-extrabold text-slate-900 text-sm block">
                ${doctorProfile.appointmentPrice} per consultation
              </span>
            </div>

            {/* Daily limit */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium block flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                Daily Intake Cap
              </span>
              <span className="font-extrabold text-teal-700 text-sm block">
                {doctorProfile.patientsPerDayLimit || 10} patients max per day
              </span>
            </div>
          </div>
        </div>

        {/* Doctor Bio */}
        {doctorProfile.bio && (
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Physician Biography & Focus
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
              "{doctorProfile.bio}"
            </p>
          </div>
        )}
      </div>

      {/* Modal for Time Table Form */}
      {showTimeTableModal && (
        <ClinicTimeTableForm
          doctor={doctorProfile}
          onClose={() => setShowTimeTableModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};
