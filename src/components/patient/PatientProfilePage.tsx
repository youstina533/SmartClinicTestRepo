import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Activity,
  HeartPulse,
} from 'lucide-react';

interface PatientProfilePageProps {
  onNavigate: (tab: string, context?: any) => void;
}

export const PatientProfilePage: React.FC<PatientProfilePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2 border border-teal-200/60">
          <User className="w-3.5 h-3.5" />
          Patient Account
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Patient Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          View your personal information and launch new clinical AI health assessments.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-teal-500/20">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900">{user.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-teal-50 text-teal-700 border border-teal-200">
                  Patient
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Account ID: <span className="font-mono text-slate-600">{user.id}</span>
              </p>
            </div>
          </div>

          {/* Core Requested CTA: "Enter Health Data" */}
          <div>
            <button
              onClick={() => onNavigate('enter-health-data')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-white font-bold text-sm bg-teal-600 hover:bg-teal-700 active:scale-[0.99] transition shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-teal-200 group-hover:rotate-12 transition transform" />
              Enter Health Data
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contact details */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Personal Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                Full Name
              </span>
              <span className="text-sm font-bold text-slate-900 block truncate">{user.name}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                Phone Number
              </span>
              <span className="text-sm font-bold text-slate-900 block truncate">{user.phone}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-600" />
                Email Address
              </span>
              <span className="text-sm font-bold text-slate-900 block truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Informational Guidance */}
        <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200/70 text-xs text-teal-950 space-y-2">
          <div className="font-bold flex items-center gap-2 text-teal-900">
            <Activity className="w-4 h-4 text-teal-600" />
            Health Risk Prediction Workflow
          </div>
          <p className="leading-relaxed text-slate-600">
            Clicking <strong>"Enter Health Data"</strong> above will open the Kaggle-standard assessment form for <em>Diabetes (Pima)</em> and <em>Cardiovascular Heart Disease</em>. You can submit new lab values any number of times. Each submission generates a timestamped report saved directly to your <strong>All Reports</strong> tab.
          </p>
        </div>

        {/* Quick Portal Shortcuts */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('all-reports')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 hover:bg-slate-50/80 transition text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">All Saved Reports</h4>
                <p className="text-xs text-slate-400">View your risk histories & advice</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigate('doctors-directory')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 hover:bg-slate-50/80 transition text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Specialist Doctors</h4>
                <p className="text-xs text-slate-400">Consult Diabetes & Heart physicians</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
