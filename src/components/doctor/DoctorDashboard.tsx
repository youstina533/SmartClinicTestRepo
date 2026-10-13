import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Doctor } from '../../types';
import { TodayTimeTableApi, DoctorPatientsApi } from '../../services/mockApi';
import { DoctorProfilePage } from './DoctorProfilePage';
import { AllPatientsPage } from './AllPatientsPage';
import { DoctorTodayTimeTable } from './DoctorTodayTimeTable';
import { SinglePatientPage } from './SinglePatientPage';
import { PopulationHealthChartsPage } from './PopulationHealthChartsPage';
import {
  Clock,
  Users,
  Activity,
  User,
  Stethoscope,
} from 'lucide-react';

interface DoctorDashboardProps {
  initialSubTab?: 'profile' | 'patients' | 'today' | 'charts' | 'single-patient';
  patientId?: string;
  onNavigateTab?: (tab: string, context?: any) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  initialSubTab = 'today',
  patientId,
  onNavigateTab,
}) => {
  const { user, doctorProfile, refreshDoctorProfile } = useAuth();
  const [subTab, setSubTab] = useState<'profile' | 'patients' | 'today' | 'charts' | 'single-patient'>(
    initialSubTab
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(patientId);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    if (initialSubTab) setSubTab(initialSubTab);
    if (patientId) setSelectedPatientId(patientId);
  }, [initialSubTab, patientId]);

  useEffect(() => {
    if (doctorProfile) {
      loadTodayCount();
      if (doctorProfile.hasCompletedTimetableSetup === false) {
        setSubTab('profile');
      }
    }
  }, [doctorProfile]);

  const loadTodayCount = async () => {
    if (!doctorProfile) return;
    try {
      const todayBookings = await TodayTimeTableApi.getTodayTimeTable(doctorProfile.id);
      setTodayCount(todayBookings.length);
    } catch {
      // ignore
    }
  };

  const handleSubNavigate = (tab: string, context?: any) => {
    if (tab === 'single-patient') {
      setSelectedPatientId(context?.patientId);
      setSubTab('single-patient');
    } else if (tab === 'doctor-today') {
      setSubTab('today');
    } else if (tab === 'doctor-patients') {
      setSubTab('patients');
    } else if (tab === 'doctor-charts') {
      setSubTab('charts');
    } else if (tab === 'doctor-profile') {
      setSubTab('profile');
    }
    if (onNavigateTab) {
      onNavigateTab(tab, context);
    }
  };

  if (!doctorProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Doctor Profile Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          Please verify that your doctor account has been approved by the clinic administrator.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Sub Views */}
      {subTab === 'profile' && <DoctorProfilePage onNavigate={handleSubNavigate} />}

      {subTab === 'today' && (
        <DoctorTodayTimeTable
          doctor={doctorProfile}
          onNavigate={handleSubNavigate}
          onPatientAdded={loadTodayCount}
        />
      )}

      {subTab === 'patients' && (
        <AllPatientsPage doctor={doctorProfile} onNavigate={handleSubNavigate} />
      )}

      {subTab === 'charts' && <PopulationHealthChartsPage />}

      {subTab === 'single-patient' && selectedPatientId && (
        <SinglePatientPage patientId={selectedPatientId} onNavigate={handleSubNavigate} />
      )}
    </div>
  );
};
