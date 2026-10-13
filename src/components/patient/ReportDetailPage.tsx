import React, { useState, useEffect } from 'react';
import { HealthRiskReport, RiskLevel } from '../../types';
import { MlServiceApi } from '../../services/mockApi';
import { getRiskColorClass } from './AllReportsPage';
import {
  FileText,
  Calendar,
  Printer,
  Stethoscope,
  Undo2,
  AlertCircle,
  CheckCircle2,
  Droplet,
  Heart,
  Sliders,
  ShieldAlert,
  ArrowRight,
  User,
} from 'lucide-react';

interface ReportDetailPageProps {
  reportId: string;
  onNavigate: (tab: string, context?: any) => void;
}

export const ReportDetailPage: React.FC<ReportDetailPageProps> = ({
  reportId,
  onNavigate,
}) => {
  const [report, setReport] = useState<HealthRiskReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await MlServiceApi.getReportById(reportId);
      setReport(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <span className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
        Loading report details...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Report Not Found</h3>
        <p className="text-xs text-slate-500">The requested report could not be loaded.</p>
        <button
          onClick={() => onNavigate('all-reports')}
          className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
        >
          Back to All Reports
        </button>
      </div>
    );
  }

  const isHighRisk = report.overallRiskLevel === 'High';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:p-0">
      {/* Top Bar / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <button
          onClick={() => onNavigate('all-reports')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
        >
          <Undo2 className="w-3.5 h-3.5" />
          Back to All Reports
        </button>

        <div className="flex items-center gap-2">
          {/* Print report button per specification */}
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print Report
          </button>

          {/* Book a doctor button if the risk is High per specification */}
          {isHighRisk && (
            <button
              onClick={() => {
                const spec =
                  report.hasHeart && report.heartResult?.riskLevel === 'High'
                    ? 'Heart Specialist'
                    : 'Diabetes Specialist';
                onNavigate('doctors-directory', { specialty: spec });
              }}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <Stethoscope className="w-4 h-4" />
              Book a Doctor (High Risk)
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Document Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
              SmartClinic Diagnostic Analysis
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinical Health Risk Report
            </h1>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1">
            <div>
              Patient Name: <strong className="text-slate-900">{report.patientName}</strong>
            </div>
            <div>
              Assessment Date: <strong className="text-slate-900">{report.date}</strong>
            </div>
            <div>
              Report Reference ID: <span className="font-mono text-slate-400">{report.id}</span>
            </div>
          </div>
        </div>

        {/* High Risk Banner if applicable */}
        {isHighRisk && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold text-sm">Critical High Risk Threshold Exceeded (&gt; 70%)</div>
                <div className="text-xs text-red-700 mt-0.5">
                  Your assessment indicates elevated clinical risk markers. Immediate consultation with a licensed specialist is strongly advised.
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('doctors-directory')}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 print:hidden"
            >
              Book Doctor Now
            </button>
          </div>
        )}

        {/* SECTION 1: DIABETES ASSESSMENT (IF EVALUATED) */}
        {report.diabetesResult && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-teal-600" />
                Diabetes Mellitus Risk Analysis (Pima Model)
              </h2>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${
                  getRiskColorClass(report.diabetesResult.riskLevel).badge
                }`}
              >
                {report.diabetesResult.riskLevel} Risk
              </span>
            </div>

            {/* Gauge / Progress Bar */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Diabetes Probability Index
                </span>
                <span className="text-3xl font-black text-slate-900">
                  {report.diabetesResult.riskPercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    getRiskColorClass(report.diabetesResult.riskLevel).bar
                  }`}
                  style={{ width: `${report.diabetesResult.riskPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Low Risk (&lt;40%)</span>
                <span>Medium Risk (40-70%)</span>
                <span>High Risk (&gt;70%)</span>
              </div>
            </div>

            {/* Full Inputs for Diabetes */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Full Input Parameters (Pima Indian Dataset)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {Object.entries(report.diabetesResult.inputs).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 block">{key}</span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-0.5">
                      {typeof val === 'number' && key === 'DiabetesPedigreeFunction'
                        ? val.toFixed(2)
                        : typeof val === 'number' && key === 'BMI'
                        ? val.toFixed(1)
                        : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advice / Recommendations */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Clinical Recommendations & Advice
              </h3>
              <ul className="space-y-2">
                {report.diabetesResult.recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-teal-50/60 border border-teal-100/80 text-xs text-teal-950 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* SECTION 2: HEART ASSESSMENT (IF EVALUATED) */}
        {report.heartResult && (
          <div className="space-y-6 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                Cardiovascular Disease Risk Analysis (Heart Model)
              </h2>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${
                  getRiskColorClass(report.heartResult.riskLevel).badge
                }`}
              >
                {report.heartResult.riskLevel} Risk
              </span>
            </div>

            {/* Gauge / Progress Bar */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cardiovascular Risk Index
                </span>
                <span className="text-3xl font-black text-slate-900">
                  {report.heartResult.riskPercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    getRiskColorClass(report.heartResult.riskLevel).bar
                  }`}
                  style={{ width: `${report.heartResult.riskPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Low Risk (&lt;40%)</span>
                <span>Medium Risk (40-70%)</span>
                <span>High Risk (&gt;70%)</span>
              </div>
            </div>

            {/* Full Inputs for Heart */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Full Input Parameters (Cardiovascular Dataset)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {Object.entries(report.heartResult.inputs).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 block">{key}</span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-0.5">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advice / Recommendations */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Cardiovascular Recommendations & Advice
              </h3>
              <ul className="space-y-2">
                {report.heartResult.recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-rose-50/60 border border-rose-100/80 text-xs text-rose-950 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Doctor Booking Callout if High Risk */}
        {isHighRisk && (
          <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div>
              <h4 className="font-extrabold text-base text-teal-300">
                Direct Clinic Specialist Referral
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                Your report qualifies for priority consultation with SmartClinic's specialized physicians. No payment required at booking.
              </p>
            </div>

            <button
              onClick={() => {
                const spec =
                  report.hasHeart && report.heartResult?.riskLevel === 'High'
                    ? 'Heart Specialist'
                    : 'Diabetes Specialist';
                onNavigate('doctors-directory', { specialty: spec });
              }}
              className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-md shadow-teal-500/20 shrink-0 cursor-pointer"
            >
              Select Approved Doctor
            </button>
          </div>
        )}

        {/* Medical disclaimer */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
          <strong>Notice:</strong> This simulated diagnostic report is generated using weighted algorithmic scoring based on Kaggle dataset distributions. It is intended for healthcare educational simulation and triaging.
        </div>
      </div>
    </div>
  );
};
