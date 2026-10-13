import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Activity, ArrowRight, ShieldCheck, Stethoscope, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        onNavigate('admin-dashboard');
      } else if (user.role === 'doctor') {
        onNavigate('doctor-today');
      } else {
        onNavigate('patient-profile');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 mb-4 ring-8 ring-teal-50/50">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to SmartClinic
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Secure clinical portal for Patients, Doctors, and Administrators
          </p>
        </div>

        {/* Demo Quick Fills */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 text-xs">
          <div className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Quick Pre-seeded Test Accounts:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleFillDemo('admin@smartclinic.com', 'admin123')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium text-left transition"
            >
              <div className="font-bold">Admin</div>
              <div className="text-[10px] text-amber-700">admin@smartclinic.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('sarah.jenkins@smartclinic.com', 'doctor123')}
              className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-medium text-left transition"
            >
              <div className="font-bold">Dr. Jenkins</div>
              <div className="text-[10px] text-teal-700">Diabetes Specialist</div>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('elena.rostova@smartclinic.com', 'doctor123')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-medium text-left transition"
            >
              <div className="font-bold">Dr. Rostova</div>
              <div className="text-[10px] text-rose-700">Heart Specialist</div>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('john.patient@smartclinic.com', 'patient123')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-medium text-left transition"
            >
              <div className="font-bold">John Davis</div>
              <div className="text-[10px] text-blue-700">Patient Demo</div>
            </button>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
            <span>Want to test Pending Doctor restriction?</span>
            <button
              type="button"
              onClick={() => handleFillDemo('aisha.patel@smartclinic.com', 'doctor123')}
              className="text-amber-700 hover:underline font-semibold"
            >
              Fill Dr. Aisha
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Authentication Notice</div>
              <div className="text-rose-700 text-xs mt-0.5">{error}</div>
            </div>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="e.g. admin@smartclinic.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <span className="text-[11px] text-slate-400">Stored locally in session</span>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-white font-semibold bg-teal-600 hover:bg-teal-700 active:scale-[0.99] transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Sign In to SmartClinic
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 text-center text-xs text-slate-600">
          <div>
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register-patient')}
              className="text-teal-600 hover:text-teal-700 font-bold hover:underline"
            >
              Register as Patient
            </button>
          </div>
          <div>
            Are you a doctor or specialist?{' '}
            <button
              onClick={() => onNavigate('register-doctor')}
              className="text-teal-700 hover:text-teal-800 font-bold hover:underline"
            >
              Apply to Join Clinic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
