export type UserRole = 'patient' | 'doctor' | 'admin';

export type Specialty = 'Diabetes Specialist' | 'Heart Specialist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  createdAt: string;
  specialty?: Specialty;
  approved?: boolean;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  specialty: Specialty;
  address: string;
  appointmentPrice: number;
  patientsPerDayLimit: number; // Max patients per day (default 10)
  weeklySchedule: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri"]
  workingHours?: string; // e.g. "09:00 AM - 05:00 PM"
  approved: boolean;
  avatar?: string;
  bio?: string;
  experienceYears?: number;
  rating?: number;
  qualification?: string;
  hasCompletedTimetableSetup?: boolean;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  RegisteredCount: number;
  registerDateAvailability: boolean; // false if RegisteredCount >= 10
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: Specialty;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  becomePatient: boolean;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export type RiskLevel = 'High' | 'Medium' | 'Low';

export interface PatientReadingRecord {
  date: string;
  glucose: number;
  bmi: number;
  bloodPressure: number;
  cholesterol: number;
  notes?: string;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number; // 0 to 100
  value: string | number;
  impactLevel: 'High' | 'Medium' | 'Low';
}

export interface DoctorPatientRecord {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  becomePatient: boolean;
  firstVisitDate: string; // registration date
  lastVisitDate: string;
  appointmentDates: string[]; // a new booking appears under the previous date
  visitCount: number;
  medicalNotes?: string;
  riskCategory: RiskLevel;
  riskPercentage: number;
  age: number;
  gender: 'M' | 'F';
  smoking: boolean;
  obese: boolean; // BMI > 30
  bmi: number;
  glucose: number;
  bloodPressure: number;
  cholesterol: number;
  maxHR?: number;
  topRiskDriver: string;
  featureImportance: FeatureImportanceItem[];
  readingsHistory: PatientReadingRecord[];
  assignedDiagnosis?: string;
}

// Kaggle Pima Indians Diabetes Dataset columns
export interface PimaDiabetesInput {
  Pregnancies: number; // 0 - 17
  Glucose: number; // 0 - 200
  BloodPressure: number; // 0 - 122
  SkinThickness: number; // 0 - 99
  Insulin: number; // 0 - 846
  BMI: number; // 0 - 67
  DiabetesPedigreeFunction: number; // 0.08 - 2.42
  Age: number; // 21 - 81
}

// Kaggle Heart Disease Dataset columns
export interface KaggleHeartInput {
  Age: number; // 20 - 85
  Sex: 'M' | 'F';
  ChestPainType: 'ATA' | 'NAP' | 'ASY' | 'TA';
  RestingBP: number; // 0 - 200
  Cholesterol: number; // 0 - 603
  FastingBS: 0 | 1;
  RestingECG: 'Normal' | 'ST' | 'LVH';
  MaxHR: number; // 60 - 202
  ExerciseAngina: 'Y' | 'N';
  Oldpeak: number; // 0 - 6.2
  ST_Slope: 'Up' | 'Flat' | 'Down';
}

export interface DiseaseAssessmentResult {
  disease: 'diabetes' | 'heart';
  riskPercentage: number; // 0 - 100
  riskLevel: RiskLevel; // High > 70%, Medium 40-70%, Low < 40%
  recommendations: string[];
  inputs: PimaDiabetesInput | KaggleHeartInput;
}

export interface HealthRiskReport {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  hasDiabetes: boolean;
  hasHeart: boolean;
  diabetesResult?: DiseaseAssessmentResult;
  heartResult?: DiseaseAssessmentResult;
  overallRiskLevel: RiskLevel;
  overallRiskPercentage: number;
}
