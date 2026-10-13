import { Doctor, Appointment, DoctorPatientRecord, HealthRiskReport, User, DayAvailability } from '../types';

const STORAGE_KEYS = {
  USERS: 'smartclinic_users',
  DOCTORS: 'smartclinic_doctors',
  APPOINTMENTS: 'smartclinic_appointments',
  DOCTOR_PATIENTS: 'smartclinic_doctor_patients_v3',
  HEALTH_REPORTS: 'smartclinic_reports_v2',
  AVAILABILITIES: 'smartclinic_availabilities',
  CURRENT_USER: 'smartclinic_current_user',
  TOKEN: 'smartclinic_token',
};

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayDateString(): string {
  return formatDate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Generate next 60 days availability list for a doctor
export function generate60DaysAvailability(
  doctorId: string,
  existingCounts?: Record<string, number>
): DayAvailability[] {
  const days: DayAvailability[] = [];
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 60; i++) {
    const d = addDays(today, i);
    const dateStr = formatDate(d);
    const dayOfWeek = dayNames[d.getDay()];

    let count = existingCounts ? existingCounts[dateStr] ?? 0 : 0;
    
    if (!existingCounts) {
      if (i === 0) {
        count = 3;
      } else if (i === 1) {
        count = 6;
      } else if (i === 3) {
        count = 10;
      } else if (i % 7 === 0) {
        count = 10;
      } else {
        count = (i * 3 + doctorId.charCodeAt(0)) % 7;
      }
    }

    days.push({
      date: dateStr,
      dayOfWeek,
      RegisteredCount: count,
      registerDateAvailability: count < 10,
    });
  }

  return days;
}

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Clinic Administrator',
    email: 'admin@smartclinic.com',
    role: 'admin',
    phone: '+1 (800) 555-0199',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-doc-1',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@smartclinic.com',
    role: 'doctor',
    phone: '+1 (555) 234-5678',
    specialty: 'Diabetes Specialist',
    approved: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'user-doc-2',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@smartclinic.com',
    role: 'doctor',
    phone: '+1 (555) 345-6789',
    specialty: 'Diabetes Specialist',
    approved: true,
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'user-doc-3',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@smartclinic.com',
    role: 'doctor',
    phone: '+1 (555) 456-7890',
    specialty: 'Heart Specialist',
    approved: true,
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'user-doc-4',
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@smartclinic.com',
    role: 'doctor',
    phone: '+1 (555) 567-8901',
    specialty: 'Heart Specialist',
    approved: true,
    createdAt: '2026-01-18T11:00:00.000Z',
  },
  {
    id: 'user-doc-5',
    name: 'Dr. Aisha Patel',
    email: 'aisha.patel@smartclinic.com',
    role: 'doctor',
    phone: '+1 (555) 678-9012',
    specialty: 'Diabetes Specialist',
    approved: false,
    createdAt: '2026-10-10T14:20:00.000Z',
  },
  {
    id: 'user-pat-1',
    name: 'John Davis',
    email: 'john.patient@smartclinic.com',
    role: 'patient',
    phone: '+1 (555) 789-0123',
    createdAt: '2026-02-01T12:00:00.000Z',
  },
  {
    id: 'user-pat-2',
    name: 'Maria Rodriguez',
    email: 'maria.patient@smartclinic.com',
    role: 'patient',
    phone: '+1 (555) 890-1234',
    createdAt: '2026-02-15T14:00:00.000Z',
  },
];

export const USER_PASSWORDS: Record<string, string> = {
  'admin@smartclinic.com': 'admin123',
  'sarah.jenkins@smartclinic.com': 'doctor123',
  'michael.chen@smartclinic.com': 'doctor123',
  'elena.rostova@smartclinic.com': 'doctor123',
  'marcus.vance@smartclinic.com': 'doctor123',
  'aisha.patel@smartclinic.com': 'doctor123',
  'john.patient@smartclinic.com': 'patient123',
  'maria.patient@smartclinic.com': 'patient123',
};

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    userId: 'user-doc-1',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@smartclinic.com',
    phone: '+1 (555) 234-5678',
    specialty: 'Diabetes Specialist',
    address: '450 Medical Plaza, Suite 302, Boston MA',
    appointmentPrice: 120,
    patientsPerDayLimit: 10,
    weeklySchedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    workingHours: '09:00 AM - 05:00 PM',
    approved: true,
    experienceYears: 14,
    rating: 4.9,
    qualification: 'MD, FACP, Board Certified in Endocrinology & Diabetes Management',
    bio: 'Pioneering personalized diabetes control regimens, glucose variability monitoring, and advanced metabolic health restoration.',
    hasCompletedTimetableSetup: true,
  },
  {
    id: 'doc-2',
    userId: 'user-doc-2',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@smartclinic.com',
    phone: '+1 (555) 345-6789',
    specialty: 'Diabetes Specialist',
    address: '782 Endocrinology Center, Cambridge MA',
    appointmentPrice: 140,
    patientsPerDayLimit: 10,
    weeklySchedule: ['Mon', 'Wed', 'Fri'],
    workingHours: '08:30 AM - 04:30 PM',
    approved: true,
    experienceYears: 11,
    rating: 4.8,
    qualification: 'MD, PhD - Harvard Medical School Affiliate',
    bio: 'Specializing in Type 1 & Type 2 diabetes intervention, continuous glucose monitoring (CGM), and insulin resistance reversal.',
    hasCompletedTimetableSetup: true,
  },
  {
    id: 'doc-3',
    userId: 'user-doc-3',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@smartclinic.com',
    phone: '+1 (555) 456-7890',
    specialty: 'Heart Specialist',
    address: '12 Cardiovascular Pavilion, Boston MA',
    appointmentPrice: 160,
    patientsPerDayLimit: 10,
    weeklySchedule: ['Tue', 'Wed', 'Thu', 'Sat'],
    workingHours: '09:00 AM - 05:30 PM',
    approved: true,
    experienceYears: 16,
    rating: 4.95,
    qualification: 'MD, FACC - Fellow of the American College of Cardiology',
    bio: 'Expert in preventive cardiology, coronary artery risk reduction, and echocardiographic assessment for early ischemic detection.',
    hasCompletedTimetableSetup: true,
  },
  {
    id: 'doc-4',
    userId: 'user-doc-4',
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@smartclinic.com',
    phone: '+1 (555) 567-8901',
    specialty: 'Heart Specialist',
    address: '990 Heart & Vascular Institute, Brookline MA',
    appointmentPrice: 175,
    patientsPerDayLimit: 10,
    weeklySchedule: ['Mon', 'Tue', 'Thu', 'Fri'],
    workingHours: '09:00 AM - 04:00 PM',
    approved: true,
    experienceYears: 18,
    rating: 4.9,
    qualification: 'MD, FSCAI, Cardiology & Vascular Medicine Specialist',
    bio: 'Focused on comprehensive cardiovascular health, hypertension management, cholesterol profiling, and post-infarction care.',
    hasCompletedTimetableSetup: true,
  },
  {
    id: 'doc-5',
    userId: 'user-doc-5',
    name: 'Dr. Aisha Patel',
    email: 'aisha.patel@smartclinic.com',
    phone: '+1 (555) 678-9012',
    specialty: 'Diabetes Specialist',
    address: '210 Hope Blvd, Somerville MA',
    appointmentPrice: 110,
    patientsPerDayLimit: 10,
    weeklySchedule: ['Mon', 'Tue', 'Wed'],
    workingHours: '10:00 AM - 04:00 PM',
    approved: false,
    experienceYears: 8,
    rating: 4.7,
    qualification: 'MBBS, MD - Metabolic Health & Diabetes Specialist',
    bio: 'Passionate about community diabetes prevention, pre-diabetes reversal, and nutritional biochemistry.',
    hasCompletedTimetableSetup: false, // first-time doctor!
  },
];

export const INITIAL_REPORTS_V2: HealthRiskReport[] = [
  {
    id: 'rep-demo-1',
    patientId: 'user-pat-1',
    patientName: 'John Davis',
    date: '2026-09-28',
    createdAt: '2026-09-28T10:30:00.000Z',
    hasDiabetes: true,
    hasHeart: true,
    overallRiskLevel: 'Medium',
    overallRiskPercentage: 58,
    diabetesResult: {
      disease: 'diabetes',
      riskPercentage: 58,
      riskLevel: 'Medium',
      inputs: {
        Pregnancies: 0,
        Glucose: 148,
        BloodPressure: 92,
        SkinThickness: 28,
        Insulin: 110,
        BMI: 31.5,
        DiabetesPedigreeFunction: 0.62,
        Age: 46,
      },
      recommendations: [
        'Reduce sugar intake, consult endocrinologist (Glucose: 148 mg/dL)',
        'Start a supervised weight loss program (BMI: 31.5)',
        'Monitor blood pressure daily, reduce salt (BloodPressure: 92 mmHg)',
      ],
    },
    heartResult: {
      disease: 'heart',
      riskPercentage: 28,
      riskLevel: 'Low',
      inputs: {
        Age: 46,
        Sex: 'M',
        ChestPainType: 'NAP',
        RestingBP: 130,
        Cholesterol: 195,
        FastingBS: 0,
        RestingECG: 'Normal',
        MaxHR: 154,
        ExerciseAngina: 'N',
        Oldpeak: 0.6,
        ST_Slope: 'Up',
      },
      recommendations: [
        'Continue regular cardiovascular aerobic activity.',
        'Maintain low sodium intake and annual checkups.',
      ],
    },
  },
  {
    id: 'rep-demo-2',
    patientId: 'user-pat-2',
    patientName: 'Maria Rodriguez',
    date: '2026-10-04',
    createdAt: '2026-10-04T14:15:00.000Z',
    hasDiabetes: true,
    hasHeart: true,
    overallRiskLevel: 'High',
    overallRiskPercentage: 78,
    diabetesResult: {
      disease: 'diabetes',
      riskPercentage: 22,
      riskLevel: 'Low',
      inputs: {
        Pregnancies: 2,
        Glucose: 94,
        BloodPressure: 78,
        SkinThickness: 20,
        Insulin: 45,
        BMI: 24.2,
        DiabetesPedigreeFunction: 0.28,
        Age: 57,
      },
      recommendations: [
        'Normal fasting glycemic metrics. Continue balanced whole-food nutrition.',
      ],
    },
    heartResult: {
      disease: 'heart',
      riskPercentage: 78,
      riskLevel: 'High',
      inputs: {
        Age: 57,
        Sex: 'F',
        ChestPainType: 'TA',
        RestingBP: 148,
        Cholesterol: 265,
        FastingBS: 0,
        RestingECG: 'ST',
        MaxHR: 122,
        ExerciseAngina: 'Y',
        Oldpeak: 2.4,
        ST_Slope: 'Flat',
      },
      recommendations: [
        'Book an appointment immediately (Cardiovascular Risk > 70%)',
        'Adopt low-saturated fat diet and monitor lipid profile (Cholesterol: 265 mg/dL)',
        'Avoid strenuous exertion, seek cardiologist evaluation (Exercise-induced angina detected)',
        'Abnormal ECG stress response detected (Flat ST Slope); clinical stress test advised',
      ],
    },
  },
];

// Helper to seed today's appointments for testing Today's Time Table
export function createSeedAppointments(): Appointment[] {
  const todayStr = getTodayDateString();
  const tomorrowStr = formatDate(addDays(new Date(), 1));

  return [
    // Today's appointments for Dr. Sarah Jenkins (doc-1):
    {
      id: 'apt-today-1',
      patientId: 'user-pat-1',
      patientName: 'John Davis',
      patientEmail: 'john.patient@smartclinic.com',
      patientPhone: '+1 (555) 789-0123',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Jenkins',
      doctorSpecialty: 'Diabetes Specialist',
      appointmentDate: todayStr,
      appointmentTime: '09:30 AM',
      status: 'scheduled',
      becomePatient: false, // in Today Time Table!
      reason: 'Fasting glucose evaluation (148 mg/dL)',
      createdAt: '2026-10-10T10:00:00.000Z',
    },
    {
      id: 'apt-today-2',
      patientId: 'user-pat-demo-3',
      patientName: 'Emily Watson',
      patientEmail: 'emily.watson@example.com',
      patientPhone: '+1 (555) 432-8765',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Jenkins',
      doctorSpecialty: 'Diabetes Specialist',
      appointmentDate: todayStr,
      appointmentTime: '11:15 AM',
      status: 'scheduled',
      becomePatient: false, // in Today Time Table!
      reason: 'Type 2 Pre-Diabetes consultation and BMI counseling',
      createdAt: '2026-10-11T11:00:00.000Z',
    },
    {
      id: 'apt-today-3',
      patientId: 'user-pat-demo-4',
      patientName: 'David Kim',
      patientEmail: 'david.kim@example.com',
      patientPhone: '+1 (555) 901-2345',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Jenkins',
      doctorSpecialty: 'Diabetes Specialist',
      appointmentDate: todayStr,
      appointmentTime: '02:00 PM',
      status: 'scheduled',
      becomePatient: false, // in Today Time Table!
      reason: 'HbA1c monitoring and nutrition plan adjustment',
      createdAt: '2026-10-12T08:00:00.000Z',
    },
    // Today's appointments for Dr. Elena Rostova (doc-3):
    {
      id: 'apt-today-4',
      patientId: 'user-pat-2',
      patientName: 'Maria Rodriguez',
      patientEmail: 'maria.patient@smartclinic.com',
      patientPhone: '+1 (555) 890-1234',
      doctorId: 'doc-3',
      doctorName: 'Dr. Elena Rostova',
      doctorSpecialty: 'Heart Specialist',
      appointmentDate: todayStr,
      appointmentTime: '10:00 AM',
      status: 'scheduled',
      becomePatient: false, // in Today Time Table!
      reason: 'High Cardiovascular Risk score review (78%)',
      createdAt: '2026-10-12T09:30:00.000Z',
    },
    {
      id: 'apt-today-5',
      patientId: 'user-pat-demo-5',
      patientName: 'Arthur Pendelton',
      patientEmail: 'arthur.p@example.com',
      patientPhone: '+1 (555) 678-1122',
      doctorId: 'doc-3',
      doctorName: 'Dr. Elena Rostova',
      doctorSpecialty: 'Heart Specialist',
      appointmentDate: todayStr,
      appointmentTime: '01:45 PM',
      status: 'scheduled',
      becomePatient: false, // in Today Time Table!
      reason: 'Exertional chest tightness and cholesterol screening',
      createdAt: '2026-10-12T14:30:00.000Z',
    },
    // Future bookings
    {
      id: 'apt-future-1',
      patientId: 'user-pat-1',
      patientName: 'John Davis',
      patientEmail: 'john.patient@smartclinic.com',
      patientPhone: '+1 (555) 789-0123',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Jenkins',
      doctorSpecialty: 'Diabetes Specialist',
      appointmentDate: tomorrowStr,
      appointmentTime: '03:00 PM',
      status: 'scheduled',
      becomePatient: false,
      reason: 'Routine follow-up',
      createdAt: '2026-10-12T15:00:00.000Z',
    },
  ];
}

// 32 Generated Demo Patients for population health analytics and doctor patient management
export function generate30DemoPatients(): DoctorPatientRecord[] {
  const firstNames = [
    'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley'
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young'
  ];

  const doctorsList = ['doc-1', 'doc-1', 'doc-1', 'doc-2', 'doc-3', 'doc-3', 'doc-4'];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

  return firstNames.map((firstName, idx) => {
    const lastName = lastNames[idx];
    const patientName = `${firstName} ${lastName}`;
    const gender: 'M' | 'F' = idx % 2 === 0 ? 'M' : 'F';
    const age = 26 + ((idx * 7) % 52); // ages between 26 and 78
    const doctorId = doctorsList[idx % doctorsList.length];
    
    // Controlled BMI and metrics
    const bmi = Number((21.5 + ((idx * 3.7) % 18.5)).toFixed(1)); // 21.5 - 40.0
    const obese = bmi > 30;
    const smoking = (idx % 3 === 0);
    const glucose = 85 + ((idx * 11) % 115); // 85 - 200
    const bloodPressure = 105 + ((idx * 7) % 65); // 105 - 170
    const cholesterol = 160 + ((idx * 13) % 135); // 160 - 295

    // Deterministic risk score
    let riskPercentage = Math.round(
      (glucose > 140 ? 35 : glucose > 100 ? 15 : 5) +
      (bmi > 30 ? 25 : bmi > 25 ? 12 : 5) +
      (age > 55 ? 20 : age > 40 ? 10 : 5) +
      (cholesterol > 240 ? 18 : 6) +
      (smoking ? 12 : 0)
    );
    riskPercentage = Math.min(96, Math.max(8, riskPercentage));
    const riskCategory = riskPercentage > 70 ? 'High' : riskPercentage >= 40 ? 'Medium' : 'Low';

    const month = months[idx % months.length];
    const day = String(1 + (idx % 27)).padStart(2, '0');
    const firstVisitDate = `2026-${month}-${day}`;
    const lastVisitDate = `2026-10-${String(1 + (idx % 12)).padStart(2, '0')}`;
    
    // Multiple appointment dates (newest first, then earlier date)
    const appointmentDates = [
      lastVisitDate,
      `2026-${month}-${String(Math.min(28, Number(day) + 7)).padStart(2, '0')}`,
      firstVisitDate,
    ];

    const topDriver =
      glucose >= 140
        ? `Glucose is the highest risk driver (${glucose} mg/dL)`
        : cholesterol >= 220
        ? `Cholesterol is the highest risk driver (${cholesterol} mg/dL)`
        : bmi >= 30
        ? `BMI (Obesity) is the primary risk driver (${bmi} kg/m²)`
        : `Age demographic baseline factor (${age} yrs)`;

    const featureImportance = [
      {
        feature: 'Fasting Glucose',
        importance: Math.min(95, Math.round(((glucose - 70) / 130) * 100)),
        value: `${glucose} mg/dL`,
        impactLevel: (glucose > 140 ? 'High' : glucose > 100 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
      },
      {
        feature: 'Body Mass Index (BMI)',
        importance: Math.min(90, Math.round(((bmi - 18) / 30) * 100)),
        value: `${bmi} kg/m²`,
        impactLevel: (bmi > 30 ? 'High' : bmi > 25 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
      },
      {
        feature: 'Serum Cholesterol',
        importance: Math.min(88, Math.round(((cholesterol - 150) / 150) * 100)),
        value: `${cholesterol} mg/dL`,
        impactLevel: (cholesterol > 240 ? 'High' : cholesterol > 200 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
      },
      {
        feature: 'Resting Blood Pressure',
        importance: Math.min(80, Math.round(((bloodPressure - 90) / 90) * 100)),
        value: `${bloodPressure} mmHg`,
        impactLevel: (bloodPressure > 140 ? 'High' : bloodPressure > 120 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
      },
      {
        feature: 'Age Factor',
        importance: Math.min(75, Math.round(((age - 20) / 60) * 100)),
        value: `${age} years`,
        impactLevel: (age > 60 ? 'High' : age > 45 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
      },
    ];

    const readingsHistory = [
      {
        date: firstVisitDate,
        glucose: Math.round(glucose + (idx % 2 === 0 ? 8 : -8)),
        bmi: bmi,
        bloodPressure: bloodPressure,
        cholesterol: cholesterol,
        notes: 'Initial clinical baseline intake.',
      },
      {
        date: appointmentDates[1],
        glucose: glucose,
        bmi: Number((bmi - (idx % 3 === 0 ? 0.4 : 0.2)).toFixed(1)),
        bloodPressure: Math.round(bloodPressure - 3),
        cholesterol: cholesterol,
        notes: 'Follow-up consultation and lifestyle adherence check.',
      },
      {
        date: lastVisitDate,
        glucose: glucose,
        bmi: bmi,
        bloodPressure: bloodPressure,
        cholesterol: cholesterol,
        notes: 'Recent monitoring report reviewed.',
      },
    ];

    return {
      id: `dp-demo-${idx + 1}`,
      doctorId,
      patientId: `user-pat-demo-${idx + 1}`,
      patientName,
      patientEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@patient.smartclinic.com`,
      patientPhone: `+1 (555) ${String(200 + idx).padStart(3, '0')}-${String(1000 + idx * 23).slice(0, 4)}`,
      becomePatient: true,
      firstVisitDate,
      lastVisitDate,
      appointmentDates,
      visitCount: 2 + (idx % 4),
      riskCategory,
      riskPercentage,
      age,
      gender,
      smoking,
      obese,
      bmi,
      glucose,
      bloodPressure,
      cholesterol,
      maxHR: 130 + (idx % 40),
      topRiskDriver: topDriver,
      featureImportance,
      readingsHistory,
      assignedDiagnosis:
        glucose > 130
          ? 'Type 2 Diabetes Mellitus (E11.9)'
          : cholesterol > 230
          ? 'Primary Hypercholesterolemia (E78.0)'
          : bmi > 30
          ? 'Metabolic Syndrome with Obesity (E66.9)'
          : 'Essential Hypertension (I10)',
      medicalNotes: `Patient followed up on ${lastVisitDate}. Adherent with medications and nutrition instructions.`,
    };
  });
}

export function initStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem('smartclinic_passwords')) {
    localStorage.setItem('smartclinic_passwords', JSON.stringify(USER_PASSWORDS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HEALTH_REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.HEALTH_REPORTS, JSON.stringify(INITIAL_REPORTS_V2));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(createSeedAppointments()));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOCTOR_PATIENTS)) {
    localStorage.setItem(STORAGE_KEYS.DOCTOR_PATIENTS, JSON.stringify(generate30DemoPatients()));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AVAILABILITIES)) {
    const availMap: Record<string, DayAvailability[]> = {};
    INITIAL_DOCTORS.forEach((doc) => {
      availMap[doc.id] = generate60DaysAvailability(doc.id);
    });
    localStorage.setItem(STORAGE_KEYS.AVAILABILITIES, JSON.stringify(availMap));
  }
}

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write error:', err);
  }
}

export function resetStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem('smartclinic_passwords');
  localStorage.removeItem(STORAGE_KEYS.DOCTORS);
  localStorage.removeItem(STORAGE_KEYS.HEALTH_REPORTS);
  localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
  localStorage.removeItem(STORAGE_KEYS.DOCTOR_PATIENTS);
  localStorage.removeItem(STORAGE_KEYS.AVAILABILITIES);
  localStorage.removeItem('smartclinic_token');
  localStorage.removeItem('smartclinic_current_user');
  initStorage();
}

export { STORAGE_KEYS };
