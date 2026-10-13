import React, { useState, useEffect } from 'react';
import { Doctor, Appointment, User, DoctorPatientRecord } from '../../types';
import { DoctorsApi, AppointmentsApi } from '../../services/mockApi';
import { STORAGE_KEYS, getStorageItem } from '../../services/mockStorage';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Stethoscope,
  Calendar,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface AdminDashboardProps {
  initialSubTab?: 'dashboard' | 'approvals' | 'appointments';
  onNavigate?: (tab: string, context?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialSubTab = 'dashboard',
  onNavigate,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientRecords, setPatientRecords] = useState<DoctorPatientRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<'All' | 'Diabetes Specialist' | 'Heart Specialist'>('All');
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const allDocs = await DoctorsApi.getAllDoctors();
      const allApts = await AppointmentsApi.getAllAppointments();
      const allUsers = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
      const allDoctorPatients = getStorageItem<DoctorPatientRecord[]>(STORAGE_KEYS.DOCTOR_PATIENTS, []);
      setDoctors(allDocs);
      setAppointments(allApts);
      setUsers(allUsers);
      setPatientRecords(allDoctorPatients);
    } finally {
      setLoading(false);
    }
  };

  // 2. Pending approvals: Approve button sets approved=true, letting that doctor log in
  const handleApprove = async (docId: string, docName: string) => {
    setProcessingId(docId);
    setActionError(null);
    try {
      await DoctorsApi.approveDoctor(docId);
      setActionSuccess(`Dr. ${docName} has been approved! approved=true set. The doctor can now log in to SmartClinic.`);
      await loadAdminData();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: unknown) {
      setActionError('Approval failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  // 2. Pending approvals: Reject button
  const handleReject = async (docId: string, docName: string) => {
    if (!confirm(`Are you sure you want to reject Dr. ${docName}'s registration? This will remove the pending account.`)) {
      return;
    }
    setProcessingId(docId);
    setActionError(null);
    try {
      await DoctorsApi.rejectDoctor(docId);
      setActionSuccess(`Dr. ${docName}'s registration application has been rejected and removed.`);
      await loadAdminData();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: unknown) {
      setActionError('Rejection failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const pendingDoctors = doctors.filter((d) => !d.approved);
  const approvedDoctors = doctors.filter((d) => d.approved);
  const patientCount = users.filter((u) => u.role === 'patient').length;

  // Filtered doctors list for Table
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      specialtyFilter === 'All' || doc.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  // Calculate number of patients per doctor
  const getPatientCountForDoctor = (docId: string): number => {
    return patientRecords.filter((p) => p.doctorId === docId).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-7 sm:p-9 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            Clinic Administration Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Overview of clinical specialists, doctor credentials verification, and patient capacity distribution.
          </p>
        </div>

        {/* Quick Stats Pill Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-right">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
              Total Doctors
            </span>
            <span className="text-xl font-black text-white">{doctors.length}</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-right">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
              Pending Approvals
            </span>
            <span className="text-xl font-black text-amber-300">{pendingDoctors.length}</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-teal-500/20 backdrop-blur-sm border border-teal-500/30 text-right">
            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
              Registered Patients
            </span>
            <span className="text-xl font-black text-teal-300">{patientRecords.length}</span>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 underline cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Toast */}
      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-700 hover:text-rose-900 font-bold ml-2 underline cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 2: PENDING APPROVALS (list of doctors with approved=false, each with Approve and Reject buttons) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pending Doctor Approvals ({pendingDoctors.length})
              </h2>
              <p className="text-xs text-slate-500">
                Doctors with approved=false. Approving updates their account and allows them to log in.
              </p>
            </div>
          </div>

          {pendingDoctors.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
              Action Required
            </span>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 flex items-center justify-center gap-3 text-xs text-slate-400">
            <span className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
            Checking pending doctor credentials...
          </div>
        ) : pendingDoctors.length === 0 ? (
          /* Empty state for Pending Approvals */
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No Pending Doctor Approvals
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All registered physicians have been approved. Newly registered doctors will appear here for administrative credential validation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-sm space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  Waiting for Admin Approval
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white font-black text-xl flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                    {doc.name.split(' ').slice(1).map((n) => n[0]).join('') || 'DR'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">{doc.name}</h3>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mt-0.5">
                      {doc.specialty}
                    </span>
                    <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">
                      "{doc.qualification}"
                    </p>
                  </div>
                </div>

                {/* Details box */}
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{doc.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.address}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-slate-700">
                    <span>
                      Fee: <strong>${doc.appointmentPrice}</strong>
                    </span>
                    <span>
                      Daily Limit: <strong>10 patients / day</strong>
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                      approved = false
                    </span>
                  </div>
                </div>

                {/* Mandatory Approve and Reject Buttons */}
                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={processingId === doc.id}
                    onClick={() => handleReject(doc.id, doc.name)}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={processingId === doc.id}
                    onClick={() => handleApprove(doc.id, doc.name)}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Approve (Permit Login)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 1: DASHBOARD TABLE OF ALL DOCTORS */}
      {/* "a table of all doctors with name, specialty, phone, address, and the number of patients per doctor." */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2 border border-teal-200/60">
              <Stethoscope className="w-3.5 h-3.5" />
              Physician Roster
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              All Doctors Directory & Patient Capacity
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Complete clinical staff table with contact information, specialty division, and patient enrollment count.
            </p>
          </div>

          {/* Specialty filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Diabetes Specialist', 'Heart Specialist'] as const).map((spec) => (
              <button
                key={spec}
                onClick={() => setSpecialtyFilter(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  specialtyFilter === spec
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors by name, specialty, phone, or address..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Doctors Table */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
            Loading doctor records...
          </div>
        ) : filteredDoctors.length === 0 ? (
          /* Empty state for doctors table */
          <div className="py-14 text-center border border-slate-100 rounded-2xl space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Doctors Found</h4>
            <p className="text-xs text-slate-400">
              No doctor records match the search or filter query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Doctor Name</th>
                  <th className="px-5 py-4">Specialty</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Address</th>
                  <th className="px-5 py-4 text-center">Number of Patients</th>
                  <th className="px-5 py-4 text-center">Login Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDoctors.map((doc) => {
                  const pCount = getPatientCountForDoctor(doc.id);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm ${
                              doc.specialty === 'Diabetes Specialist'
                                ? 'bg-gradient-to-tr from-teal-600 to-cyan-500'
                                : 'bg-gradient-to-tr from-rose-600 to-pink-500'
                            }`}
                          >
                            {doc.name.split(' ').slice(1).map((n) => n[0]).join('') || 'DR'}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-900 block">
                              {doc.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                              {doc.qualification}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Specialty */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border ${
                            doc.specialty === 'Diabetes Specialist'
                              ? 'bg-teal-50 text-teal-800 border-teal-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              doc.specialty === 'Diabetes Specialist' ? 'bg-teal-600' : 'bg-rose-600'
                            }`}
                          />
                          {doc.specialty}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.phone}</span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-5 py-4 text-slate-600 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{doc.address}</span>
                        </div>
                      </td>

                      {/* Number of Patients per Doctor */}
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 font-extrabold text-slate-900 border border-slate-200">
                          <Users className="w-3.5 h-3.5 text-teal-600" />
                          <span>{pCount}</span>
                          <span className="text-[10px] text-slate-500 font-normal">patients</span>
                        </div>
                      </td>

                      {/* Login Status */}
                      <td className="px-5 py-4 text-center">
                        {doc.approved ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Approved (Active)
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Pending Approval
                            </span>
                            <button
                              onClick={() => handleApprove(doc.id, doc.name)}
                              className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold cursor-pointer transition shadow-xs"
                              title="Approve now"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Optional Bookings Log Section */}
      <section className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-800">
              Clinic Scheduled Appointments ({appointments.length} Total Bookings)
            </h3>
          </div>
          <button
            onClick={() => setShowAppointmentsModal(!showAppointmentsModal)}
            className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
          >
            {showAppointmentsModal ? 'Hide Bookings List' : 'View Bookings List'}
          </button>
        </div>

        {showAppointmentsModal && (
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Doctor</th>
                  <th className="px-5 py-3">Specialty</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {appointments.slice(0, 15).map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {apt.appointmentDate}
                    </td>
                    <td className="px-5 py-3 font-bold">{apt.patientName}</td>
                    <td className="px-5 py-3">{apt.patientPhone}</td>
                    <td className="px-5 py-3 font-semibold text-teal-700">{apt.doctorName}</td>
                    <td className="px-5 py-3">{apt.doctorSpecialty}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          apt.becomePatient
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {apt.becomePatient ? 'Enrolled Patient' : 'Awaiting Intake'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
