import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Specialty } from '../../types';
import {
  Stethoscope,
  Mail,
  Phone,
  Lock,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  GraduationCap,
} from 'lucide-react';

interface DoctorRegisterPageProps {
  onNavigate: (tab: string) => void;
}

export const DoctorRegisterPage: React.FC<DoctorRegisterPageProps> = ({ onNavigate }) => {
  const { registerDoctor, quickLogin } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState<Specialty>('Diabetes Specialist');
  const [address, setAddress] = useState('');
  const [appointmentPrice, setAppointmentPrice] = useState(130);
  const [weeklySchedule, setWeeklySchedule] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [qualification, setQualification] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [testLoginError, setTestLoginError] = useState<string | null>(null);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (weeklySchedule.includes(day)) {
      if (weeklySchedule.length === 1) return; // keep at least one
      setWeeklySchedule(weeklySchedule.filter((d) => d !== day));
    } else {
      setWeeklySchedule([...weeklySchedule, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !specialty || !password) {
      setError('Please fill in all required fields (name, email, phone, specialty, password).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await registerDoctor({
        name,
        email,
        phone,
        specialty,
        address: address || 'SmartClinic Specialty Clinic, Boston MA',
        appointmentPrice: Number(appointmentPrice) || 120,
        weeklySchedule,
        qualification: qualification || 'Board Certified Specialist',
        password,
      });

      setRegisteredEmail(email);
      setRegistrationSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Doctor registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const tryLoginNow = async () => {
    setTestLoginError(null);
    try {
      await quickLogin(registeredEmail);
      // If by any chance approved, navigate
      onNavigate('doctor-today');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setTestLoginError(msg);
    }
  };

  if (registrationSubmitted) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mb-4 ring-8 ring-amber-50/60">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-3 border border-amber-200">
            Waiting for admin approval
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Registration Submitted!
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Dr. <span className="font-semibold text-slate-900">{name}</span> ({specialty}), your profile has been successfully registered in SmartClinic database.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Application Status: Pending Verification
            </div>
            <p className="text-slate-600 leading-relaxed">
              In accordance with clinic policy, your account is marked as{' '}
              <strong className="text-amber-700 font-semibold">approved = false</strong>. You cannot log into the doctor portal until an administrator verifies and approves your credentials.
            </p>
            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-slate-600">
              <div>
                <span className="text-slate-400 block">Email:</span>
                <span className="font-medium text-slate-800">{registeredEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Daily Patient Cap:</span>
                <span className="font-medium text-teal-700">10 patients / day</span>
              </div>
            </div>
          </div>

          {/* Test Login Check */}
          <div className="space-y-3">
            <button
              onClick={tryLoginNow}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center justify-center gap-2"
            >
              Test Login (Verify "Waiting for admin approval" error)
            </button>

            {testLoginError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">System Access Denied:</div>
                  <div className="text-[11px] text-amber-800 mt-0.5">{testLoginError}</div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                quickLogin('admin@smartclinic.com').then(() => {
                  onNavigate('admin-approvals');
                });
              }}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold bg-teal-600 hover:bg-teal-700 active:scale-[0.99] transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 text-sm"
            >
              Log In as Admin to Approve This Doctor
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium underline"
            >
              Return to Login Screen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 mb-4 ring-8 ring-teal-50/50">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Doctor Registration
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Join the SmartClinic specialist team. Profiles require administrator approval before portal access.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 text-rose-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-700">{error}</div>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Doctor Full Name *
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Dr. Jennifer Adams"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email *
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="doctor@smartclinic.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+1 (555) 432-1098"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Specialty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Medical Specialty *
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as Specialty)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
              >
                <option value="Diabetes Specialist">Diabetes Specialist</option>
                <option value="Heart Specialist">Heart Specialist</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Appointment Price ($)
              </label>
              <div className="relative">
                <DollarSign className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={appointmentPrice}
                  onChange={(e) => setAppointmentPrice(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinic Office Address
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 500 Medical Center Blvd, Suite 210, Boston MA"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Qualifications */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Board Certification / Qualifications
            </label>
            <div className="relative">
              <GraduationCap className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. MD, Board Certified in Clinical Endocrinology"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Weekly Schedule & 10 Patients/Day limit note */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Weekly Available Days
              </label>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Limit: 10 patients/day
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = weeklySchedule.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 chars"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold bg-teal-600 hover:bg-teal-700 active:scale-[0.99] transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Register as Doctor (Pending Approval)
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              Note: After registration, doctor status is set to "Waiting for admin approval" and login is disabled until an admin approves.
            </p>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 text-center text-xs text-slate-600">
          <div>
            Already registered?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-teal-600 hover:text-teal-700 font-bold hover:underline"
            >
              Sign In
            </button>
          </div>
          <div>
            Are you a patient?{' '}
            <button
              onClick={() => onNavigate('register-patient')}
              className="text-teal-700 hover:text-teal-800 font-bold hover:underline"
            >
              Register as Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
