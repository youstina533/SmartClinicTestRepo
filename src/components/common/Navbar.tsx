import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  User,
  FileText,
  Stethoscope,
  LogOut,
  Menu,
  X,
  Clock,
  Shield,
  Users,
  Calendar,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  pendingDoctorCount?: number;
  todayAppointmentsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  pendingDoctorCount = 0,
  todayAppointmentsCount = 0,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => handleNav(user?.role === 'patient' ? 'patient-profile' : user ? `${user.role}-dashboard` : 'home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition transform">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Smart<span className="text-teal-600">Clinic</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/60">
                  Healthcare Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Specialized Diabetes & Heart Center</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* GUEST Navigation */}
            {!user && (
              <>
                <button
                  onClick={() => handleNav('home')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'home'
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNav('doctors-directory')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'doctors-directory'
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Doctors
                </button>
                <div className="h-5 w-px bg-slate-200 mx-1"></div>
                <button
                  onClick={() => handleNav('login')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'login'
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('register-patient')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
                >
                  Patient Register
                </button>
                <button
                  onClick={() => handleNav('register-doctor')}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-teal-700 hover:bg-teal-50 border border-teal-200 transition"
                >
                  Doctor Join
                </button>
              </>
            )}

            {/* PATIENT Navigation: strictly Profile, All Reports, Doctors, Logout */}
            {user?.role === 'patient' && (
              <>
                <button
                  onClick={() => handleNav('patient-profile')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentTab === 'patient-profile' || currentTab === 'enter-health-data'
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4 text-teal-600" />
                  Profile
                </button>
                <button
                  onClick={() => handleNav('all-reports')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentTab === 'all-reports' || currentTab === 'report-detail'
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4 text-teal-600" />
                  All Reports
                </button>
                <button
                  onClick={() => handleNav('doctors-directory')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentTab === 'doctors-directory' || currentTab === 'doctor-booking'
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Doctors
                </button>
              </>
            )}

            {/* DOCTOR Navigation: strictly Profile, All Patients, Today Time Table, Charts, Logout */}
            {user?.role === 'doctor' && (
              <>
                <button
                  onClick={() => handleNav('doctor-profile')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentTab === 'doctor-profile'
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4 text-teal-600" />
                  Profile
                </button>
                <button
                  onClick={() => handleNav('doctor-patients')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentTab === 'doctor-patients' || currentTab === 'single-patient'
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4 text-teal-600" />
                  All Patients
                </button>
                <button
                  onClick={() => handleNav('doctor-today')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentTab === 'doctor-today'
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-4 h-4 text-teal-600" />
                  Today Time Table
                  {todayAppointmentsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-teal-600 text-white">
                      {todayAppointmentsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleNav('doctor-charts')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentTab === 'doctor-charts'
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-4 h-4 text-teal-600" />
                  Charts
                </button>
              </>
            )}

            {/* ADMIN Navigation: strictly Dashboard, Logout */}
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentTab === 'admin-dashboard' || currentTab === 'admin-approvals'
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4 text-teal-600" />
                  Dashboard
                  {pendingDoctorCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                      {pendingDoctorCount} Pending
                    </span>
                  )}
                </button>
              </>
            )}
          </nav>

          {/* User Profile Pill & Logout */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">{user.name}</span>
                  <span className="text-[10px] font-medium capitalize text-slate-500">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={() => {
                    logout();
                    handleNav('login');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1.5"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : null}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {!user ? (
            <>
              <button
                onClick={() => handleNav('home')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Home
              </button>
              <button
                onClick={() => handleNav('doctors-directory')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Doctors
              </button>
              <button
                onClick={() => handleNav('login')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('register-patient')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white"
              >
                Patient Register
              </button>
            </>
          ) : user.role === 'patient' ? (
            <>
              <button
                onClick={() => handleNav('patient-profile')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-teal-600" />
                Profile
              </button>
              <button
                onClick={() => handleNav('all-reports')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                All Reports
              </button>
              <button
                onClick={() => handleNav('doctors-directory')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-teal-600" />
                Doctors
              </button>
            </>
          ) : user.role === 'doctor' ? (
            <>
              <button
                onClick={() => handleNav('doctor-profile')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-teal-600" />
                Profile
              </button>
              <button
                onClick={() => handleNav('doctor-patients')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-teal-600" />
                All Patients
              </button>
              <button
                onClick={() => handleNav('doctor-today')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-teal-600" />
                Today Time Table ({todayAppointmentsCount})
              </button>
              <button
                onClick={() => handleNav('doctor-charts')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-teal-600" />
                Charts
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('admin-dashboard')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-600" />
                  Dashboard
                </span>
                {pendingDoctorCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                    {pendingDoctorCount} Pending
                  </span>
                )}
              </button>
            </>
          )}

          {user && (
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">{user.name}</span>
              <button
                onClick={() => {
                  logout();
                  handleNav('login');
                }}
                className="text-xs text-rose-600 font-semibold px-2 py-1 rounded bg-rose-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
