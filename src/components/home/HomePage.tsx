import React from 'react';
import {
  Activity,
  Sparkles,
  Heart,
  Droplet,
  ShieldCheck,
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Clock,
  Award,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

interface HomePageProps {
  onNavigate: (tab: string, context?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const handleStartAssessment = () => {
    if (user?.role === 'patient') {
      onNavigate('patient-profile');
    } else {
      onNavigate('login');
    }
  };
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Advanced Health Risk Prediction Engine
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              SmartClinic: Precision Medicine & AI Risk Diagnostics
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Experience modern clinic care combining predictive intelligence for Diabetes and Cardiovascular Disease with direct access to board-certified medical specialists.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleStartAssessment}
                className="px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition shadow-xl shadow-teal-500/25 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Run AI Health Risk Assessment
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('doctors-directory')}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition border border-white/20 flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                Meet Our Specialists
              </button>
            </div>

            {/* Micro proof points */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>10-Patient Daily Cap for Quality Care</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>60-Day Forward Booking System</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>ADA & AHA Validated Heuristics</span>
              </div>
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </section>

      {/* Specialty Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Specialized Clinical Departments
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Targeted metabolic and cardiovascular disease prevention led by dedicated physicians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Diabetes Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Droplet className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Endocrinology & Metabolism
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                Diabetes Risk & Metabolic Health
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Early detection of impaired glucose tolerance, insulin resistance, and pre-diabetic thresholds using fasting glucose, HbA1c, and BMI analytics.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Continuous glucose profile assessment
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Consultation with Dr. Sarah Jenkins & Dr. Michael Chen
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Personalized dietary and lifestyle reversal plans
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={handleStartAssessment}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5"
              >
                Assess Diabetes Risk Profile →
              </button>
            </div>
          </div>

          {/* Heart Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Cardiology & Vascular Medicine
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                Cardiovascular Disease & Coronary Risk
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                10-year coronary artery evaluation incorporating resting blood pressure, serum cholesterol, ECG findings, and exertional symptoms.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                Framingham-aligned clinical risk modeling
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                Consultation with Dr. Elena Rostova & Dr. Marcus Vance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                Hypertension and lipid panel management
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={handleStartAssessment}
                className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1.5"
              >
                Assess Cardiovascular Risk Profile →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Roles Feature Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl font-bold text-slate-900">
              Designed for Patients, Doctors, and Clinic Administrators
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Role-protected portals ensure secure operations and streamlined workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Patient Portal</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant AI risk assessments, 60-day interactive scheduling, appointment tracking, and diagnostic history.
              </p>
              <button
                onClick={() => onNavigate('register-patient')}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Register as Patient →
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Doctor Portal</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Today's Time Table, 1-click patient registration (becomePatient), 60-day capacity tracking, and clinical notes.
              </p>
              <button
                onClick={() => onNavigate('register-doctor')}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Join as Doctor (Requires Approval) →
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Administrator Portal</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review and approve pending doctors, manage hospital rosters, and monitor clinic appointment volumes.
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="text-xs font-semibold text-amber-700 hover:underline"
              >
                Admin Sign In (admin@smartclinic.com) →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
