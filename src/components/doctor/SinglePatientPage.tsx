import React, { useState, useEffect } from 'react';
import { DoctorPatientRecord } from '../../types';
import { DoctorPatientsApi } from '../../services/mockApi';
import { getRiskColorClass } from '../patient/AllReportsPage';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  User,
  Undo2,
  Calendar,
  Phone,
  Mail,
  Activity,
  HeartPulse,
  AlertCircle,
  CheckCircle2,
  FileText,
  BarChart2,
  TrendingUp,
  Scale,
  Droplet,
  Heart,
} from 'lucide-react';

interface SinglePatientPageProps {
  patientId: string;
  onNavigate: (tab: string, context?: any) => void;
}

export const SinglePatientPage: React.FC<SinglePatientPageProps> = ({
  patientId,
  onNavigate,
}) => {
  const [patient, setPatient] = useState<DoctorPatientRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    setLoading(true);
    try {
      const data = await DoctorPatientsApi.getPatientById(patientId);
      setPatient(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <span className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
        Loading patient clinical history...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Patient Record Not Found</h3>
        <button
          onClick={() => onNavigate('doctor-patients')}
          className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
        >
          Back to All Patients
        </button>
      </div>
    );
  }

  const colors = getRiskColorClass(patient.riskCategory);

  // Prepare feature importance data for Recharts Bar Chart
  const featureChartData = (patient.featureImportance || []).map((item) => ({
    name: item.feature,
    importance: item.importance,
    value: item.value,
    impact: item.impactLevel,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <button
        onClick={() => onNavigate('doctor-patients')}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
      >
        <Undo2 className="w-3.5 h-3.5" />
        Back to All Patients
      </button>

      {/* Patient Header Card */}
      <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-teal-500/20">
            {patient.patientName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {patient.patientName}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${colors.badge}`}
              >
                {patient.riskCategory} Risk
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span>Age: <strong>{patient.age}y</strong></span>
              <span>•</span>
              <span>Gender: <strong>{patient.gender}</strong></span>
              <span>•</span>
              <span>Registered: <strong>{patient.firstVisitDate}</strong></span>
              {patient.assignedDiagnosis && (
                <>
                  <span>•</span>
                  <span className="text-teal-700 font-bold">{patient.assignedDiagnosis}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Contact info chip */}
        <div className="text-left md:text-right text-xs text-slate-600 space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center md:justify-end gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-800">{patient.patientPhone}</strong>
          </div>
          <div className="flex items-center md:justify-end gap-1.5 text-slate-500">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{patient.patientEmail}</span>
          </div>
        </div>
      </div>

      {/* Top Contributing Factors Callout Banner */}
      <div
        className={`p-5 rounded-3xl border flex items-start gap-4 ${
          patient.riskCategory === 'High'
            ? 'bg-red-50/80 border-red-200 text-red-950'
            : patient.riskCategory === 'Medium'
            ? 'bg-orange-50/80 border-orange-200 text-orange-950'
            : 'bg-green-50/80 border-green-200 text-green-950'
        }`}
      >
        <TrendingUp className="w-6 h-6 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm uppercase tracking-wider">
            Primary Predictive Driver Identified
          </h3>
          <p className="text-base font-black">{patient.topRiskDriver}</p>
          <p className="text-xs opacity-80">
            Calculated by the SmartClinic predictive heuristic inference engine across biometric markers.
          </p>
        </div>
      </div>

      {/* Feature Importance Bar Chart using Recharts */}
      <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-teal-600" />
              Feature Importance & Contributing Factors
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              Bar Chart of Metric Weights (0 - 100%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual breakdown of feature impact driving {patient.patientName}'s overall {patient.riskPercentage}% risk score.
          </p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={featureChartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis
                dataKey="name"
                type="category"
                width={160}
                tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl space-y-1">
                        <div className="font-bold text-teal-300">{data.name}</div>
                        <div>Weight: <strong>{data.importance}%</strong></div>
                        <div>Observed Value: <strong>{data.value}</strong></div>
                        <div>Impact Level: <strong>{data.impact}</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                {featureChartData.map((entry, index) => {
                  const fill =
                    entry.importance >= 70
                      ? '#EF4444' // red
                      : entry.importance >= 45
                      ? '#F97316' // orange
                      : '#10B981'; // green
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All Past Readings Table */}
      <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            All Past Clinical Readings & Vitals
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Historical laboratory and physiological telemetry logged across patient appointments.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Visit Date</th>
                <th className="px-5 py-3.5">Fasting Glucose</th>
                <th className="px-5 py-3.5">Body Mass Index</th>
                <th className="px-5 py-3.5">Blood Pressure</th>
                <th className="px-5 py-3.5">Serum Cholesterol</th>
                <th className="px-5 py-3.5">Physician Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {(patient.readingsHistory || []).map((reading, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    {reading.date}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-bold ${reading.glucose > 140 ? 'text-red-600 font-black' : ''}`}>
                      {reading.glucose} mg/dL
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-bold ${reading.bmi > 30 ? 'text-red-600 font-black' : ''}`}>
                      {reading.bmi.toFixed(1)} kg/m²
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-bold ${reading.bloodPressure > 140 ? 'text-red-600 font-black' : ''}`}>
                      {reading.bloodPressure} mmHg
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-bold ${reading.cholesterol > 220 ? 'text-red-600 font-black' : ''}`}>
                      {reading.cholesterol} mg/dL
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 italic max-w-xs truncate">
                    {reading.notes || 'Routine follow-up check.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medical History & Clinical Plan Notes */}
      <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          Full Clinical History & Treatment Plan
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {patient.medicalNotes ||
            'Patient is enrolled under chronic disease monitoring protocol. Lifestyle modifications and medication adjustments were discussed during the latest consultation.'}
        </p>
      </div>
    </div>
  );
};
