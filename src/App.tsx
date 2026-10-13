import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuickLoginBar } from './components/common/QuickLoginBar';
import { Navbar } from './components/common/Navbar';
import { HomePage } from './components/home/HomePage';
import { LoginPage } from './components/auth/LoginPage';
import { PatientRegisterPage } from './components/auth/PatientRegisterPage';
import { DoctorRegisterPage } from './components/auth/DoctorRegisterPage';
import { PatientProfilePage } from './components/patient/PatientProfilePage';
import { EnterHealthDataPage } from './components/patient/EnterHealthDataPage';
import { AllReportsPage } from './components/patient/AllReportsPage';
import { ReportDetailPage } from './components/patient/ReportDetailPage';
import { DoctorDirectoryPage } from './components/doctors/DoctorDirectoryPage';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DoctorsApi, TodayTimeTableApi, resetStorage } from './services/mockApi';
import { PatientHealthChatbot } from './components/common/PatientHealthChatbot';
import { Activity, Lock, ShieldAlert, RotateCcw, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { user, doctorProfile, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [navigationContext, setNavigationContext] = useState<any>(null);
  const [pendingDoctorCount, setPendingDoctorCount] = useState<number>(0);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState<number>(0);

  // If user changes and is a patient, default to patient-profile if on login or home
  useEffect(() => {
    if (user && user.role === 'patient') {
      if (currentTab === 'login' || currentTab === 'register-patient') {
        setCurrentTab('patient-profile');
      }
    } else if (user && user.role === 'doctor') {
      if (currentTab === 'login' || currentTab === 'register-doctor') {
        if (doctorProfile && doctorProfile.hasCompletedTimetableSetup === false) {
          setCurrentTab('doctor-profile');
        } else {
          setCurrentTab('doctor-today');
        }
      }
    } else if (user && user.role === 'admin') {
      if (currentTab === 'login') {
        setCurrentTab('admin-dashboard');
      }
    }
  }, [user, doctorProfile]);

  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const handleResetDemoData = () => {
    if (
      confirm(
        'Reset all demo data back to initial factory state? This will restore original demo accounts, 4 approved doctors, 1 pending doctor, sample appointments, and 32 population health demo patients.'
      )
    ) {
      resetStorage();
      setToastNotice('Demo data has been reset to default state! Refreshing...');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    }
  };

  // Load badge counts
  useEffect(() => {
    loadBadgeCounts();
  }, [user, currentTab]);

  const loadBadgeCounts = async () => {
    try {
      const allDocs = await DoctorsApi.getAllDoctors();
      setPendingDoctorCount(allDocs.filter((d) => !d.approved).length);

      if (user?.role === 'doctor' && doctorProfile) {
        const todayApts = await TodayTimeTableApi.getTodayTimeTable(doctorProfile.id);
        setTodayAppointmentsCount(todayApts.length);
      }
    } catch {
      // ignore
    }
  };

  const navigateTo = (tab: string, context?: any) => {
    setCurrentTab(tab);
    setNavigationContext(context || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route rendering with protection
  const renderCurrentView = () => {
    if (isLoading) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <span className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
            Loading SmartClinic...
          </div>
        </div>
      );
    }

    switch (currentTab) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;

      case 'login':
        return <LoginPage onNavigate={navigateTo} />;

      case 'register-patient':
        return <PatientRegisterPage onNavigate={navigateTo} />;

      case 'register-doctor':
        return <DoctorRegisterPage onNavigate={navigateTo} />;

      // 1. Patient Profile: name, phone, email, and a button "Enter Health Data"
      case 'patient-profile':
        if (!user) return <LoginPage onNavigate={navigateTo} />;
        if (user.role !== 'patient') {
          return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <Lock className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-bold text-slate-800">Patient Access Required</h3>
              <p className="text-xs text-slate-500">
                You are currently signed in as a {user.role}.
              </p>
              <button
                onClick={() => navigateTo('home')}
                className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
              >
                Go to Home
              </button>
            </div>
          );
        }
        return <PatientProfilePage onNavigate={navigateTo} />;

      // 2. Enter Data Form: two sections, Diabetes and Heart with Kaggle dataset columns
      // "The form is NOT shown after registration; it is reachable only from this button"
      case 'enter-health-data':
        if (!user) return <LoginPage onNavigate={navigateTo} />;
        if (user.role !== 'patient') {
          return <PatientProfilePage onNavigate={navigateTo} />;
        }
        return <EnterHealthDataPage onNavigate={navigateTo} />;

      // 5. All Reports page: horizontal cards, each showing report date and risk result
      case 'all-reports':
        if (!user) return <LoginPage onNavigate={navigateTo} />;
        if (user.role !== 'patient') {
          return <PatientProfilePage onNavigate={navigateTo} />;
        }
        return <AllReportsPage onNavigate={navigateTo} />;

      // 6. Report page: patient name, date, full inputs, risk % and level, advice, Book a doctor button if High
      case 'report-detail':
        if (!user) return <LoginPage onNavigate={navigateTo} />;
        return (
          <ReportDetailPage
            reportId={navigationContext?.reportId}
            onNavigate={navigateTo}
          />
        );

      // 7 & 8. Doctors page & Doctor booking view
      case 'doctors-directory':
      case 'doctor-booking':
        return (
          <DoctorDirectoryPage
            onNavigate={navigateTo}
            initialSpecialty={navigationContext?.specialty}
            selectedDoctorId={navigationContext?.doctorId}
          />
        );

      // DOCTOR PORTAL ROUTES
      case 'doctor-profile':
      case 'doctor-dashboard':
      case 'doctor-today':
      case 'doctor-patients':
      case 'doctor-charts':
      case 'single-patient':
        if (!user) return <LoginPage onNavigate={navigateTo} />;
        if (user.role !== 'doctor') {
          return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <Lock className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-bold text-slate-800">Doctor Access Required</h3>
              <p className="text-xs text-slate-500">
                This portal is reserved for verified clinic doctors.
              </p>
              <button
                onClick={() => navigateTo('home')}
                className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
              >
                Go to Home
              </button>
            </div>
          );
        }
        const doctorSubTab =
          currentTab === 'doctor-profile'
            ? 'profile'
            : currentTab === 'doctor-patients'
            ? 'patients'
            : currentTab === 'doctor-charts'
            ? 'charts'
            : currentTab === 'single-patient'
            ? 'single-patient'
            : 'today';
        return (
          <DoctorDashboard
            initialSubTab={doctorSubTab}
            patientId={navigationContext?.patientId}
            onNavigateTab={navigateTo}
          />
        );

      // ADMIN PORTAL ROUTES
      case 'admin-dashboard':
      case 'admin-approvals':
      case 'admin-appointments':
        if (!user) return <LoginPage onNavigate={navigateTo} />;
        if (user.role !== 'admin') {
          return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="font-bold text-slate-800">Administrator Access Required</h3>
              <p className="text-xs text-slate-500">
                You must sign in as admin@smartclinic.com to access clinic administration.
              </p>
              <button
                onClick={() => navigateTo('home')}
                className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
              >
                Go to Home
              </button>
            </div>
          );
        }
        const adminSubTab =
          currentTab === 'admin-approvals'
            ? 'approvals'
            : currentTab === 'admin-appointments'
            ? 'appointments'
            : 'approvals';
        return <AdminDashboard initialSubTab={adminSubTab} onNavigate={navigateTo} />;

      default:
        return user?.role === 'patient' ? (
          <PatientProfilePage onNavigate={navigateTo} />
        ) : (
          <HomePage onNavigate={navigateTo} />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white relative">
      {/* 1-Click Role Switcher banner for seamless evaluation */}
      <QuickLoginBar onNavigate={navigateTo} />

      {/* Main Responsive Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={navigateTo}
        pendingDoctorCount={pendingDoctorCount}
        todayAppointmentsCount={todayAppointmentsCount}
      />

      {/* Global Toast Notification */}
      {toastNotice && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastNotice}</span>
          <button
            onClick={() => setToastNotice(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">{renderCurrentView()}</main>

      {/* Bonus: Floating Chatbot Widget on Patient side */}
      {(!user || user.role === 'patient') && (
        <PatientHealthChatbot onNavigate={navigateTo} />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-16 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-900">
                Smart<span className="text-teal-600">Clinic</span>
              </span>
              <span className="text-slate-400">|</span>
              <span>Healthcare AI Risk Simulation</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap">
              {user?.role === 'patient' ? (
                <>
                  <button onClick={() => navigateTo('patient-profile')} className="hover:text-teal-600 cursor-pointer">
                    Profile
                  </button>
                  <button onClick={() => navigateTo('all-reports')} className="hover:text-teal-600 cursor-pointer">
                    All Reports
                  </button>
                  <button onClick={() => navigateTo('doctors-directory')} className="hover:text-teal-600 cursor-pointer">
                    Doctors
                  </button>
                </>
              ) : user?.role === 'admin' ? (
                <>
                  <button onClick={() => navigateTo('admin-dashboard')} className="hover:text-teal-600 cursor-pointer">
                    Dashboard
                  </button>
                  <button onClick={() => navigateTo('doctors-directory')} className="hover:text-teal-600 cursor-pointer">
                    Doctors Directory
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigateTo('home')} className="hover:text-teal-600 cursor-pointer">
                    Home
                  </button>
                  <button onClick={() => navigateTo('doctors-directory')} className="hover:text-teal-600 cursor-pointer">
                    Specialists
                  </button>
                  <button onClick={() => navigateTo('login')} className="hover:text-teal-600 cursor-pointer">
                    Sign In
                  </button>
                </>
              )}

              {/* Polish: Reset Demo Data button in footer */}
              <button
                type="button"
                onClick={handleResetDemoData}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 font-bold text-[11px] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Restore pristine seed state: admin, doctors, patients, appointments"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
                Reset Demo Data
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-700">Notice:</span> If you do not attend on your chosen date, your booking will be cancelled automatically. All assessments are front-end simulated ML calculations.
            </div>
            <div className="shrink-0 text-slate-400 font-medium">
              Admin: admin@smartclinic.com (admin123)
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>© {new Date().getFullYear()} SmartClinic Medical Center. Front-end simulation.</span>
            <span>Diabetes & Heart Disease Risk Analytics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
