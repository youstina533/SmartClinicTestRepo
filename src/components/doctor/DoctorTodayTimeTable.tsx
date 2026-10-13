import React, { useState, useEffect } from 'react';
import { Appointment, Doctor } from '../../types';
import { TodayTimeTableApi, getTodayDateString } from '../../services/mockApi';
import {
  Clock,
  User,
  Phone,
  Calendar,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sunset,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface DoctorTodayTimeTableProps {
  doctor: Doctor;
  onNavigate?: (tab: string, context?: any) => void;
  onPatientAdded?: () => void;
}

export const DoctorTodayTimeTable: React.FC<DoctorTodayTimeTableProps> = ({
  doctor,
  onNavigate,
  onPatientAdded,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info'; message: string } | null>(
    null
  );
  const [processingId, setProcessingId] = useState<string | null>(null);

  const realCurrentDate = getTodayDateString();

  useEffect(() => {
    loadTodayTimeTable();
  }, [doctor.id]);

  const loadTodayTimeTable = async () => {
    setLoading(true);
    try {
      // Compares with real current date
      const data = await TodayTimeTableApi.getTodayTimeTable(doctor.id);
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  };

  // "View Details" runs ViewPatientDetails():
  // sets BecomePatient=true, moves the patient from TodayTimeTableApi to DoctorPatients,
  // removes the card here, adds it to All Patients, and opens the patient's report.
  const handleViewPatientDetails = async (appointmentId: string) => {
    setProcessingId(appointmentId);
    try {
      const { appointment, patientRecord } = await TodayTimeTableApi.viewPatientDetails(
        appointmentId
      );

      setActionNotice({
        type: 'success',
        message: `${appointment.patientName} has been enrolled into All Patients (BecomePatient: true). Opening patient profile...`,
      });

      if (onPatientAdded) onPatientAdded();
      await loadTodayTimeTable();

      // Open the patient's report / single patient page
      if (onNavigate) {
        setTimeout(() => {
          onNavigate('single-patient', { patientId: patientRecord.id });
        }, 500);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to view patient details');
    } finally {
      setProcessingId(null);
    }
  };

  // "Delete" runs DeletePatient():
  // removes the card and the data. The patient is NOT moved to All Patients (BecomePatient stays false).
  const handleDeletePatient = async (appointmentId: string, patientName: string) => {
    if (!confirm(`Are you sure you want to delete ${patientName}'s appointment? The patient will NOT be moved to All Patients.`)) {
      return;
    }

    setProcessingId(appointmentId);
    try {
      await TodayTimeTableApi.deletePatient(appointmentId);
      setActionNotice({
        type: 'info',
        message: `${patientName}'s appointment was deleted. BecomePatient remains false.`,
      });
      await loadTodayTimeTable();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete appointment');
    } finally {
      setProcessingId(null);
    }
  };

  // "Simulate end of day" button for testing:
  // any card still here whose patient was not seen is removed automatically.
  const handleSimulateEndOfDay = async () => {
    if (!confirm('Simulate End of Day? All remaining unseen bookings for today will be automatically removed per the clinic cancellation policy.')) {
      return;
    }

    setLoading(true);
    try {
      const removed = await TodayTimeTableApi.simulateEndOfDay(doctor.id);
      setActionNotice({
        type: 'info',
        message: `End of day simulated: ${removed} unseen appointment(s) were automatically cancelled and removed.`,
      });
      await loadTodayTimeTable();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 text-white p-7 sm:p-9 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2 border border-teal-500/30">
            <Clock className="w-3.5 h-3.5" />
            Live Daily Intake • Today: {realCurrentDate}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Today's Time Table
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Bookings for today's date ({realCurrentDate}) who have not yet become registered clinic patients.
          </p>
        </div>

        {/* Action: Simulate End of Day Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateEndOfDay}
            className="px-5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
            title="Remove any unvisited patient cards for today"
          >
            <Sunset className="w-4 h-4 text-amber-400" />
            Simulate End of Day
          </button>
        </div>
      </div>

      {actionNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs underline font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Patient Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
          Comparing bookings against real current date ({realCurrentDate})...
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-14 text-center border border-slate-200 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No Pending Unregistered Patients for Today
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All appointments for today ({realCurrentDate}) have either been enrolled into All Patients or cleared.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
            >
              <div>
                {/* Badge & Date */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Pending Intake (BecomePatient: false)
                  </span>
                  <span className="text-[11px] font-bold text-teal-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {apt.appointmentDate}
                  </span>
                </div>

                {/* Patient Name */}
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600 shrink-0" />
                  {apt.patientName}
                </h3>

                {/* Phone */}
                <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">{apt.patientPhone}</span>
                </div>

                {apt.reason && (
                  <p className="text-[11px] text-slate-500 mt-2 italic line-clamp-2">
                    "{apt.reason}"
                  </p>
                )}
              </div>

              {/* Two Mandatory Buttons: View Details & Delete */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                {/* Delete button: runs DeletePatient() */}
                <button
                  type="button"
                  disabled={processingId === apt.id}
                  onClick={() => handleDeletePatient(apt.id, apt.patientName)}
                  className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Remove card without enrolling to All Patients"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>

                {/* View Details button: runs ViewPatientDetails() */}
                <button
                  type="button"
                  disabled={processingId === apt.id}
                  onClick={() => handleViewPatientDetails(apt.id)}
                  className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Enroll to All Patients and view clinical report"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
