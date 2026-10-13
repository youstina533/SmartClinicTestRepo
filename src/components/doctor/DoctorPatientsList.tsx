import React, { useState, useEffect } from 'react';
import { Doctor, DoctorPatientRecord } from '../../types';
import { DoctorPatientsApi } from '../../services/mockApi';
import {
  Users,
  Search,
  FileText,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  Edit3,
  Stethoscope,
  Activity,
} from 'lucide-react';

interface DoctorPatientsListProps {
  doctor: Doctor;
}

export const DoctorPatientsList: React.FC<DoctorPatientsListProps> = ({ doctor }) => {
  const [patients, setPatients] = useState<DoctorPatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingPatient, setEditingPatient] = useState<DoctorPatientRecord | null>(null);
  const [editNotes, setEditNotes] = useState('');

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

  const handleSaveNotes = async () => {
    if (!editingPatient) return;
    try {
      await DoctorPatientsApi.updatePatientRecord(editingPatient.id, {
        medicalNotes: editNotes,
      });
      setEditingPatient(null);
      await loadPatients();
    } catch (err: unknown) {
      alert('Failed to update patient notes');
    }
  };

  const filtered = patients.filter(
    (p) =>
      p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      p.patientEmail.toLowerCase().includes(search.toLowerCase()) ||
      (p.assignedDiagnosis && p.assignedDiagnosis.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            DoctorPatients Directory
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Registered Patients
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Patients who became permanent clinic patients under Dr. {doctor.name} (Flag:{' '}
            <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded font-mono">
              BecomePatient: true
            </code>
            ).
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
          Loading doctor patients...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No Patients Registered Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When you complete an appointment from "Today's Time Table" and click "Accept & Mark as Patient", they will appear in this list.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center">
                    {record.patientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{record.patientName}</h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      BecomePatient: true
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  <span className="font-bold text-slate-700">{record.visitCount}</span> visits
                </div>
              </div>

              {/* Diagnosis Badge */}
              {record.assignedDiagnosis && (
                <div className="text-xs bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">
                    {record.assignedDiagnosis}
                  </span>
                </div>
              )}

              {/* Contact info & Dates */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="truncate flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{record.patientEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{record.patientPhone}</span>
                </div>
                <div className="text-slate-400">
                  First visit: <span className="text-slate-700">{record.firstVisitDate}</span>
                </div>
                <div className="text-slate-400">
                  Last visit: <span className="text-slate-700">{record.lastVisitDate}</span>
                </div>
              </div>

              {/* Clinical Notes */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Clinical Notes:
                  </span>
                  <button
                    onClick={() => {
                      setEditingPatient(record);
                      setEditNotes(record.medicalNotes || '');
                    }}
                    className="text-[10px] text-teal-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed italic">
                  "{record.medicalNotes || 'No notes added.'}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Notes Modal */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Update Clinical Notes: {editingPatient.patientName}
            </h3>
            <textarea
              rows={4}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingPatient(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
