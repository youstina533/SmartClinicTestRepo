import React, { useState, useEffect } from 'react';
import { Doctor, DoctorPatientRecord, RiskLevel } from '../../types';
import { DoctorPatientsApi } from '../../services/mockApi';
import { getRiskColorClass } from '../patient/AllReportsPage';
import {
  Users,
  Search,
  Calendar,
  Phone,
  Eye,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Activity,
  Flame,
  Scale,
  Sparkles,
} from 'lucide-react';

interface AllPatientsPageProps {
  doctor: Doctor;
  onNavigate: (tab: string, context?: any) => void;
}

export const AllPatientsPage: React.FC<AllPatientsPageProps> = ({
  doctor,
  onNavigate,
}) => {
  const [patients, setPatients] = useState<DoctorPatientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchName, setSearchName] = useState('');
  const [filterRisk, setFilterRisk] = useState<'All' | RiskLevel>('All');
  const [filterAge, setFilterAge] = useState<'All' | '<40' | '40-60' | '>60'>('All');
  const [filterSmoking, setFilterSmoking] = useState<'All' | 'Yes' | 'No'>('All');
  const [filterObesity, setFilterObesity] = useState<'All' | 'Obese' | 'Non-Obese'>('All');
  const [filterAppointmentDate, setFilterAppointmentDate] = useState<string>('');

  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, [doctor.id]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await DoctorPatientsApi.getDoctorPatients(doctor.id);
      setPatients(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from your registered patients list?`)) {
      return;
    }

    try {
      await DoctorPatientsApi.deletePatient(patientId);
      setDeleteNotice(`${name} has been removed from DoctorPatients.`);
      await loadPatients();
      setTimeout(() => setDeleteNotice(null), 3500);
    } catch {
      alert('Failed to delete patient');
    }
  };

  // Extract unique appointment dates for filter dropdown
  const allAppointmentDates = Array.from(
    new Set(patients.flatMap((p) => p.appointmentDates || []))
  ).sort().reverse();

  // Filter application
  const filteredPatients = patients.filter((p) => {
    // Search by name
    if (searchName && !p.patientName.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }

    // Filter by Risk level
    if (filterRisk !== 'All' && p.riskCategory !== filterRisk) {
      return false;
    }

    // Filter by Age
    if (filterAge === '<40' && p.age >= 40) return false;
    if (filterAge === '40-60' && (p.age < 40 || p.age > 60)) return false;
    if (filterAge === '>60' && p.age <= 60) return false;

    // Filter by Smoking
    if (filterSmoking === 'Yes' && !p.smoking) return false;
    if (filterSmoking === 'No' && p.smoking) return false;

    // Filter by Obesity (BMI > 30)
    if (filterObesity === 'Obese' && p.bmi <= 30) return false;
    if (filterObesity === 'Non-Obese' && p.bmi > 30) return false;

    // Filter by appointment date
    if (filterAppointmentDate && !(p.appointmentDates || []).includes(filterAppointmentDate)) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2 border border-teal-200/60">
            <Users className="w-3.5 h-3.5" />
            Patient Registry
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            All Registered Patients
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Active clinic patients enrolled under Dr. {doctor.name} (Flag: BecomePatient=true).
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-teal-700">{filteredPatients.length}</span>
          <span className="text-xs text-slate-400 block font-semibold">Matching Patients</span>
        </div>
      </div>

      {deleteNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{deleteNotice}</span>
          </div>
          <button
            onClick={() => setDeleteNotice(null)}
            className="text-amber-800 underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search by patient name */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search by patient name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          {/* Filter by appointment date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterAppointmentDate}
              onChange={(e) => setFilterAppointmentDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Filter by Appointment Date (All Dates)</option>
              {allAppointmentDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {filterAppointmentDate && (
              <button
                onClick={() => setFilterAppointmentDate('')}
                className="text-xs text-slate-400 hover:text-slate-700 underline shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter buttons per specification: High/Medium/Low risk, Age, Smoking, Obesity */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          {/* Risk Level Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-bold mr-1">Risk:</span>
            {(['All', 'High', 'Medium', 'Low'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFilterRisk(r)}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterRisk === r
                    ? r === 'High'
                      ? 'bg-red-600 text-white shadow-sm'
                      : r === 'Medium'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : r === 'Low'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <span className="text-slate-300">|</span>

          {/* Age Group Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-bold mr-1">Age:</span>
            {(['All', '<40', '40-60', '>60'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setFilterAge(a)}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterAge === a
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <span className="text-slate-300">|</span>

          {/* Smoking Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold mr-1 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              Smoking:
            </span>
            {(['All', 'Yes', 'No'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterSmoking(s)}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterSmoking === s
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <span className="text-slate-300">|</span>

          {/* Obesity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold mr-1 flex items-center gap-1">
              <Scale className="w-3 h-3 text-rose-500" />
              Obesity (BMI&gt;30):
            </span>
            {(['All', 'Obese', 'Non-Obese'] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setFilterObesity(o)}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterObesity === o
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          {(filterRisk !== 'All' ||
            filterAge !== 'All' ||
            filterSmoking !== 'All' ||
            filterObesity !== 'All' ||
            searchName ||
            filterAppointmentDate) && (
            <button
              onClick={() => {
                setFilterRisk('All');
                setFilterAge('All');
                setFilterSmoking('All');
                setFilterObesity('All');
                setSearchName('');
                setFilterAppointmentDate('');
              }}
              className="text-xs text-rose-600 font-bold hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Patient Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
          Loading patient directory...
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white rounded-3xl p-14 text-center border border-slate-200 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Patients Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No patients match the selected filters or search terms. Try loosening criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => {
            const colors = getRiskColorClass(patient.riskCategory);

            return (
              <div
                key={patient.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
              >
                <div>
                  {/* Top Bar with Risk Badge & Age */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">
                        {patient.patientName}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>Age: <strong>{patient.age}y</strong></span>
                        <span>•</span>
                        <span>Gender: <strong>{patient.gender}</strong></span>
                        {patient.smoking && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 font-bold">Smoker</span>
                          </>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${colors.badge}`}
                    >
                      {patient.riskCategory} Risk
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{patient.patientPhone}</span>
                  </div>

                  {/* Registration Date */}
                  <div className="text-xs text-slate-500 mb-2">
                    Registered On: <strong className="text-slate-800">{patient.firstVisitDate}</strong>
                  </div>

                  {/* Appointment dates list: "a new booking appears under the previous date" */}
                  <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Appointment Dates Timeline:
                    </span>
                    <div className="space-y-1">
                      {patient.appointmentDates && patient.appointmentDates.length > 0 ? (
                        patient.appointmentDates.map((dateStr, idx) => (
                          <div
                            key={idx}
                            className="text-xs flex items-center justify-between text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-100"
                          >
                            <span className="font-semibold">{dateStr}</span>
                            <span className="text-[10px] text-teal-700 font-bold">
                              {idx === 0 ? 'Latest Visit' : `Visit #${patient.appointmentDates.length - idx}`}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400">None logged</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Two Action Buttons: View Details & Delete */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeletePatient(patient.id, patient.patientName)}
                    className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Delete patient from DoctorPatients"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('single-patient', { patientId: patient.id })}
                    className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
