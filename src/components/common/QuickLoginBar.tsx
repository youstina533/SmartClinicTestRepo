import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, UserCheck, Stethoscope, HeartPulse, User, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface QuickLoginBarProps {
  onNavigate?: (tab: string) => void;
}

export const QuickLoginBar: React.FC<QuickLoginBarProps> = ({ onNavigate }) => {
  const { user, quickLogin, logout } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleQuickSwitch = async (email: string, roleName: string) => {
    setErrorMsg(null);
    try {
      await quickLogin(email);
      if (onNavigate) {
        if (roleName === 'admin') onNavigate('admin-dashboard');
        else if (roleName === 'doctor') onNavigate('doctor-today');
        else onNavigate('patient-profile');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-teal-400 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Demo Role Switcher:
          </span>
          <span className="text-slate-400 hidden sm:inline">1-Click instant test accounts:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Admin */}
          <button
            onClick={() => handleQuickSwitch('admin@smartclinic.com', 'admin')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              user?.role === 'admin'
                ? 'bg-amber-500 text-slate-950 font-semibold ring-2 ring-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
            }`}
            title="Login as Admin (admin@smartclinic.com / admin123)"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Admin
          </button>

          {/* Dr. Sarah Jenkins (Approved Diabetes) */}
          <button
            onClick={() => handleQuickSwitch('sarah.jenkins@smartclinic.com', 'doctor')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              user?.email === 'sarah.jenkins@smartclinic.com'
                ? 'bg-teal-500 text-slate-950 font-semibold ring-2 ring-teal-400'
                : 'bg-slate-800 hover:bg-slate-700 text-teal-300'
            }`}
            title="Dr. Sarah Jenkins (Diabetes Specialist - Approved)"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Dr. Jenkins (Diabetes)
          </button>

          {/* Dr. Elena Rostova (Approved Heart) */}
          <button
            onClick={() => handleQuickSwitch('elena.rostova@smartclinic.com', 'doctor')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              user?.email === 'elena.rostova@smartclinic.com'
                ? 'bg-rose-500 text-white font-semibold ring-2 ring-rose-400'
                : 'bg-slate-800 hover:bg-slate-700 text-rose-300'
            }`}
            title="Dr. Elena Rostova (Heart Specialist - Approved)"
          >
            <HeartPulse className="w-3.5 h-3.5" />
            Dr. Elena (Heart)
          </button>

          {/* Pending Doctor Aisha */}
          <button
            onClick={() => handleQuickSwitch('aisha.patel@smartclinic.com', 'doctor')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition flex items-center gap-1 border border-dashed border-slate-700"
            title="Pending Doctor Aisha (Tests 'Waiting for admin approval')"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Dr. Aisha (Pending)
          </button>

          {/* Patient John */}
          <button
            onClick={() => handleQuickSwitch('john.patient@smartclinic.com', 'patient')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              user?.email === 'john.patient@smartclinic.com'
                ? 'bg-blue-500 text-white font-semibold ring-2 ring-blue-400'
                : 'bg-slate-800 hover:bg-slate-700 text-blue-300'
            }`}
            title="Patient John Davis (Has Diabetes Report)"
          >
            <User className="w-3.5 h-3.5" />
            Patient John
          </button>

          {/* Patient Maria */}
          <button
            onClick={() => handleQuickSwitch('maria.patient@smartclinic.com', 'patient')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              user?.email === 'maria.patient@smartclinic.com'
                ? 'bg-indigo-500 text-white font-semibold ring-2 ring-indigo-400'
                : 'bg-slate-800 hover:bg-slate-700 text-indigo-300'
            }`}
            title="Patient Maria Rodriguez (Has Heart Report)"
          >
            <User className="w-3.5 h-3.5" />
            Patient Maria
          </button>

          {user && (
            <button
              onClick={logout}
              className="px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
              title="Log out current account"
            >
              Sign out
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-amber-950/80 border-t border-amber-800 text-amber-200 px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-amber-300 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
