import {
  Doctor,
  Appointment,
  DoctorPatientRecord,
  HealthRiskReport,
  User,
  DayAvailability,
  PimaDiabetesInput,
  KaggleHeartInput,
  RiskLevel,
  DiseaseAssessmentResult,
  Specialty,
} from '../types';
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  getTodayDateString,
  formatDate,
  generate60DaysAvailability,
  resetStorage,
} from './mockStorage';

export { getTodayDateString, formatDate, resetStorage };

// Simulated latency
export const sleep = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

// Simple base64 fake JWT generator
export function createFakeJwt(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
    })
  );
  const signature = btoa(`fake-secret-${user.id}`);
  return `${header}.${payload}.${signature}`;
}

export function decodeFakeJwt(token: string): Partial<User> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function getRiskLevel(score: number): RiskLevel {
  if (score > 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

// ----------------------------------------------------
// 1. DoctorsApi
// ----------------------------------------------------
export const DoctorsApi = {
  async getAllDoctors(filter?: { specialty?: string; approvedOnly?: boolean }): Promise<Doctor[]> {
    await sleep();
    let doctors = getStorageItem<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
    if (filter?.approvedOnly) {
      doctors = doctors.filter((d) => d.approved);
    }
    if (filter?.specialty && filter.specialty !== 'all') {
      doctors = doctors.filter((d) => d.specialty === filter.specialty);
    }
    return doctors;
  },

  async getDoctorById(id: string): Promise<Doctor | null> {
    await sleep();
    const doctors = getStorageItem<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
    return doctors.find((d) => d.id === id) || null;
  },

  async getDoctorByUserId(userId: string): Promise<Doctor | null> {
    await sleep();
    const doctors = getStorageItem<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
    return doctors.find((d) => d.userId === userId) || null;
  },

  async approveDoctor(doctorId: string): Promise<Doctor> {
    await sleep();
    const doctors = getStorageItem<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
    const docIndex = doctors.findIndex((d) => d.id === doctorId);
    if (docIndex === -1) throw new Error('Doctor not found');

    doctors[docIndex].approved = true;
    setStorageItem(STORAGE_KEYS.DOCTORS, doctors);

    const users = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex((u) => u.id === doctors[docIndex].userId || u.email === doctors[docIndex].email);
    if (userIndex !== -1) {
      users[userIndex].approved = true;
      setStorageItem(STORAGE_KEYS.USERS, users);
    }

    return doctors[docIndex];
  },

  async updateDoctorTimetable(
    doctorId: string,
    updates: {
      address: string;
      weeklySchedule: string[];
      workingHours: string;
      appointmentPrice: number;
      patientsPerDayLimit: number;
    }
  ): Promise<Doctor> {
    await sleep();
    const doctors = getStorageItem<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
    const idx = doctors.findIndex((d) => d.id === doctorId);
    if (idx === -1) throw new Error('Doctor not found');

    doctors[idx] = {
      ...doctors[idx],
      ...updates,
      hasCompletedTimetableSetup: true,
    };
    setStorageItem(STORAGE_KEYS.DOCTORS, doctors);
    return doctors[idx];
  },

  async rejectDoctor(doctorId: string): Promise<void> {
    await sleep();
    const doctors = getStorageItem<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
    const doc = doctors.find((d) => d.id === doctorId);
    const updatedDoctors = doctors.filter((d) => d.id !== doctorId);
    setStorageItem(STORAGE_KEYS.DOCTORS, updatedDoctors);

    if (doc) {
      const users = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
      const updatedUsers = users.filter((u) => u.id !== doc.userId && u.email !== doc.email);
      setStorageItem(STORAGE_KEYS.USERS, updatedUsers);
    }
  },
};

// ----------------------------------------------------
// 2. AvailabilityApi
// For every date of the next 60 days per doctor, an object:
// { date, RegisteredCount, registerDateAvailability (Boolean) }
// If RegisteredCount >= 10, registerDateAvailability becomes false.
// ----------------------------------------------------
export const AvailabilityApi = {
  async getDoctorAvailability(doctorId: string): Promise<DayAvailability[]> {
    await sleep();
    const allAvails = getStorageItem<Record<string, DayAvailability[]>>(STORAGE_KEYS.AVAILABILITIES, {});
    let docAvails = allAvails[doctorId];

    if (!docAvails || docAvails.length === 0) {
      docAvails = generate60DaysAvailability(doctorId);
      allAvails[doctorId] = docAvails;
      setStorageItem(STORAGE_KEYS.AVAILABILITIES, allAvails);
    }

    const appointments = getStorageItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const docAppointments = appointments.filter((a) => a.doctorId === doctorId && a.status !== 'cancelled');

    const syncedAvails = docAvails.map((slot) => {
      const countForDate = docAppointments.filter((a) => a.appointmentDate === slot.date).length;
      const finalCount = Math.max(slot.RegisteredCount, countForDate);
      return {
        ...slot,
        RegisteredCount: finalCount,
        registerDateAvailability: finalCount < 10,
      };
    });

    return syncedAvails;
  },

  // Returns ONLY dates where registerDateAvailability is true
  async getAvailableDatesOnly(doctorId: string): Promise<DayAvailability[]> {
    const all = await this.getDoctorAvailability(doctorId);
    return all.filter((d) => d.registerDateAvailability && d.RegisteredCount < 10);
  },

  async incrementBookingCount(doctorId: string, dateStr: string): Promise<DayAvailability> {
    const allAvails = getStorageItem<Record<string, DayAvailability[]>>(STORAGE_KEYS.AVAILABILITIES, {});
    let docAvails = allAvails[doctorId] || generate60DaysAvailability(doctorId);

    let targetDay = docAvails.find((d) => d.date === dateStr);
    if (!targetDay) {
      targetDay = {
        date: dateStr,
        dayOfWeek: 'Day',
        RegisteredCount: 0,
        registerDateAvailability: true,
      };
      docAvails.push(targetDay);
    }

    targetDay.RegisteredCount += 1;
    targetDay.registerDateAvailability = targetDay.RegisteredCount < 10;

    allAvails[doctorId] = docAvails;
    setStorageItem(STORAGE_KEYS.AVAILABILITIES, allAvails);

    return targetDay;
  },
};

// ----------------------------------------------------
// 3. TodayTimeTableApi
// Bookings whose appointment date is today and who have not yet become patients.
// ----------------------------------------------------
export const TodayTimeTableApi = {
  async getTodayTimeTable(doctorId: string): Promise<Appointment[]> {
    await sleep();
    const todayStr = getTodayDateString();
    const appointments = getStorageItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);

    // Bookings whose date equals today's date and who have not yet become patients
    return appointments.filter(
      (a) =>
        a.doctorId === doctorId &&
        a.appointmentDate === todayStr &&
        a.status !== 'cancelled' &&
        a.becomePatient === false
    );
  },

  // "View Details" runs ViewPatientDetails():
  // sets BecomePatient=true, moves the patient from TodayTimeTableApi to DoctorPatients,
  // removes the card here, adds it to All Patients, and opens the patient's report
  async viewPatientDetails(
    appointmentId: string
  ): Promise<{ appointment: Appointment; patientRecord: DoctorPatientRecord }> {
    await sleep();
    const appointments = getStorageItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const aptIndex = appointments.findIndex((a) => a.id === appointmentId);
    if (aptIndex === -1) throw new Error('Appointment not found');

    const appointment = appointments[aptIndex];
    appointment.becomePatient = true;
    appointment.status = 'completed';
    appointments[aptIndex] = appointment;
    setStorageItem(STORAGE_KEYS.APPOINTMENTS, appointments);

    const doctorPatients = getStorageItem<DoctorPatientRecord[]>(STORAGE_KEYS.DOCTOR_PATIENTS, []);
    const todayStr = getTodayDateString();
    const existingIndex = doctorPatients.findIndex(
      (dp) => dp.doctorId === appointment.doctorId && dp.patientId === appointment.patientId
    );

    let patientRecord: DoctorPatientRecord;

    if (existingIndex !== -1) {
      doctorPatients[existingIndex].becomePatient = true;
      doctorPatients[existingIndex].lastVisitDate = todayStr;
      if (!doctorPatients[existingIndex].appointmentDates.includes(todayStr)) {
        doctorPatients[existingIndex].appointmentDates.unshift(todayStr);
      }
      doctorPatients[existingIndex].visitCount += 1;
      patientRecord = doctorPatients[existingIndex];
    } else {
      const isHeart = appointment.doctorSpecialty === 'Heart Specialist';
      const glucose = isHeart ? 98 : 152;
      const bmi = isHeart ? 27.2 : 31.8;
      const bp = isHeart ? 146 : 132;
      const cholesterol = isHeart ? 248 : 190;
      const riskScore = isHeart ? 76 : 64;
      const riskCategory: RiskLevel = riskScore > 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low';

      patientRecord = {
        id: `dp-${Date.now()}`,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        patientPhone: appointment.patientPhone,
        becomePatient: true,
        firstVisitDate: todayStr,
        lastVisitDate: todayStr,
        appointmentDates: [todayStr],
        visitCount: 1,
        riskCategory,
        riskPercentage: riskScore,
        age: 52,
        gender: 'M',
        smoking: false,
        obese: bmi > 30,
        bmi,
        glucose,
        bloodPressure: bp,
        cholesterol,
        topRiskDriver: isHeart
          ? `Cholesterol & Blood Pressure are highest risk drivers (${cholesterol} mg/dL, ${bp} mmHg)`
          : `Glucose is the highest risk driver (${glucose} mg/dL)`,
        featureImportance: [
          { feature: 'Fasting Glucose', importance: isHeart ? 42 : 88, value: `${glucose} mg/dL`, impactLevel: isHeart ? 'Low' : 'High' },
          { feature: 'Body Mass Index (BMI)', importance: isHeart ? 60 : 75, value: `${bmi} kg/m²`, impactLevel: bmi > 30 ? 'High' : 'Medium' },
          { feature: 'Serum Cholesterol', importance: isHeart ? 86 : 45, value: `${cholesterol} mg/dL`, impactLevel: isHeart ? 'High' : 'Low' },
          { feature: 'Resting Blood Pressure', importance: isHeart ? 82 : 55, value: `${bp} mmHg`, impactLevel: isHeart ? 'High' : 'Medium' },
          { feature: 'Age Demographic Factor', importance: 52, value: '52 years', impactLevel: 'Medium' },
        ],
        readingsHistory: [
          {
            date: todayStr,
            glucose,
            bmi,
            bloodPressure: bp,
            cholesterol,
            notes: 'Intake examination during clinic visit.',
          },
        ],
        medicalNotes: 'Clinical consultation completed. Patient formally enrolled into clinic care plan.',
        assignedDiagnosis: isHeart ? 'Cardiovascular Disease Evaluation (I25.9)' : 'Type 2 Diabetes Monitoring (E11.9)',
      };

      doctorPatients.unshift(patientRecord);
    }

    setStorageItem(STORAGE_KEYS.DOCTOR_PATIENTS, doctorPatients);

    return { appointment, patientRecord };
  },

  // "Delete" runs DeletePatient():
  // removes the card and the data. The patient is NOT moved to All Patients (BecomePatient stays false).
  async deletePatient(appointmentId: string): Promise<void> {
    await sleep();
    const appointments = getStorageItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const updated = appointments.filter((a) => a.id !== appointmentId);
    setStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
  },

  // "Simulate end of day" button:
  // any card still here whose patient was not seen is removed automatically.
  async simulateEndOfDay(doctorId: string): Promise<number> {
    await sleep();
    const todayStr = getTodayDateString();
    const appointments = getStorageItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);

    let removedCount = 0;
    const updated = appointments.filter((a) => {
      if (
        a.doctorId === doctorId &&
        a.appointmentDate === todayStr &&
        a.becomePatient === false
      ) {
        removedCount++;
        return false; // remove unseen patient card
      }
      return true;
    });

    setStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
    return removedCount;
  },

  async markAsPatient(
    appointmentId: string,
    medicalNotes?: string,
    assignedDiagnosis?: string
  ): Promise<{ appointment: Appointment; patientRecord: DoctorPatientRecord }> {
    return this.viewPatientDetails(appointmentId);
  },
};

// ----------------------------------------------------
// 4. DoctorPatients
// Patients who became patients of a doctor, each with BecomePatient flag.
// ----------------------------------------------------
export const DoctorPatientsApi = {
  async getDoctorPatients(doctorId: string): Promise<DoctorPatientRecord[]> {
    await sleep();
    const doctorPatients = getStorageItem<DoctorPatientRecord[]>(STORAGE_KEYS.DOCTOR_PATIENTS, []);
    // Returns patients for this doctor, or all if demo view
    const forThisDoctor = doctorPatients.filter((dp) => dp.doctorId === doctorId && dp.becomePatient === true);
    if (forThisDoctor.length > 0) return forThisDoctor;
    // Fallback: return stored patients so charts & patient lists have full data
    return doctorPatients.filter((dp) => dp.becomePatient === true);
  },

  async getAllPatientsAcrossClinic(): Promise<DoctorPatientRecord[]> {
    await sleep();
    const doctorPatients = getStorageItem<DoctorPatientRecord[]>(STORAGE_KEYS.DOCTOR_PATIENTS, []);
    return doctorPatients.filter((dp) => dp.becomePatient === true);
  },

  async getPatientById(id: string): Promise<DoctorPatientRecord | null> {
    await sleep();
    const doctorPatients = getStorageItem<DoctorPatientRecord[]>(STORAGE_KEYS.DOCTOR_PATIENTS, []);
    return doctorPatients.find((dp) => dp.id === id || dp.patientId === id) || null;
  },

  // Delete runs DeletePatient, removes from DoctorPatients
  async deletePatient(patientRecordId: string): Promise<void> {
    await sleep();
    const doctorPatients = getStorageItem<DoctorPatientRecord[]>(STORAGE_KEYS.DOCTOR_PATIENTS, []);
    const updated = doctorPatients.filter((dp) => dp.id !== patientRecordId);
    setStorageItem(STORAGE_KEYS.DOCTOR_PATIENTS, updated);
  },

  async updatePatientRecord(
    id: string,
    updates: Partial<DoctorPatientRecord>
  ): Promise<DoctorPatientRecord> {
    await sleep();
    const doctorPatients = getStorageItem<DoctorPatientRecord[]>(STORAGE_KEYS.DOCTOR_PATIENTS, []);
    const idx = doctorPatients.findIndex((dp) => dp.id === id);
    if (idx === -1) throw new Error('Patient record not found');

    doctorPatients[idx] = { ...doctorPatients[idx], ...updates };
    setStorageItem(STORAGE_KEYS.DOCTOR_PATIENTS, doctorPatients);
    return doctorPatients[idx];
  },
};

// ----------------------------------------------------
// 5. AppointmentsApi (Doctor Booking with NO Payment)
// Sends name, phone and chosen date to doctor's TodayTimeTableApi
// Increases RegisteredCount, sets date to false when count reaches 10
// ----------------------------------------------------
export const AppointmentsApi = {
  async bookAppointment(data: {
    patientId: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: Specialty;
    appointmentDate: string;
    appointmentTime?: string;
    reason?: string;
  }): Promise<Appointment> {
    return this.registerAppointment(data);
  },

  async registerAppointment(data: {
    patientId: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: Specialty;
    appointmentDate: string;
    appointmentTime?: string;
    reason?: string;
  }): Promise<Appointment> {
    await sleep(250);

    // Verify date availability
    const availabilities = await AvailabilityApi.getDoctorAvailability(data.doctorId);
    const daySlot = availabilities.find((s) => s.date === data.appointmentDate);

    if (daySlot && (!daySlot.registerDateAvailability || daySlot.RegisteredCount >= 10)) {
      throw new Error(`This date (${data.appointmentDate}) is fully booked (10/10 patients reached).`);
    }

    const appointments = getStorageItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: data.patientId,
      patientName: data.patientName,
      patientEmail: data.patientEmail,
      patientPhone: data.patientPhone,
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      doctorSpecialty: data.doctorSpecialty,
      appointmentDate: data.appointmentDate,
      appointmentTime: '10:00 AM', // Default clinic slot
      status: 'scheduled',
      becomePatient: false, // will appear in TodayTimeTableApi when appointmentDate is today!
      reason: data.reason || 'Medical consultation following health risk test',
      createdAt: new Date().toISOString(),
    };

    appointments.push(newAppointment);
    setStorageItem(STORAGE_KEYS.APPOINTMENTS, appointments);

    // Increase RegisteredCount and set to false if it hits 10
    await AvailabilityApi.incrementBookingCount(data.doctorId, data.appointmentDate);

    return newAppointment;
  },

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    await sleep();
    const appointments = getStorageItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    return appointments.filter((a) => a.patientId === patientId);
  },

  async getAllAppointments(): Promise<Appointment[]> {
    await sleep();
    return getStorageItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
  },

  async cancelAppointment(appointmentId: string): Promise<void> {
    await sleep();
    const appointments = getStorageItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const updated = appointments.map((a) =>
      a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a
    );
    setStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
  },
};

// ----------------------------------------------------
// 6. ML Service Simulation & Recommendation Rules
// Formula rules per prompt:
// Diabetes: Glucose, BMI, Age, Insulin, BloodPressure (+ small randomness)
// Heart: Age, Cholesterol, MaxHR, Oldpeak, ChestPainType, ExerciseAngina, ST_Slope (+ small randomness)
// Recommendation rules:
// - Glucose > 140: "Reduce sugar intake, consult endocrinologist"
// - BMI > 30: "Start a supervised weight loss program"
// - BloodPressure > 90: "Monitor blood pressure daily, reduce salt"
// - Risk > 70%: "Book an appointment immediately"
// Heart recommendations:
// - Cholesterol > 200: "Adopt low-saturated fat diet and monitor lipid profile"
// - ExerciseAngina === 'Y': "Avoid strenuous exertion, seek cardiologist evaluation"
// - ST_Slope === 'Flat' || 'Down': "Abnormal ECG stress response detected; clinical stress test advised"
// ----------------------------------------------------
export const MlServiceApi = {
  calculateDiabetesRisk(input: PimaDiabetesInput): DiseaseAssessmentResult {
    // Weighted components:
    // Glucose (0 - 200, weight 40%) -> baseline normal ~85-100
    const glucoseScore = Math.min(100, Math.max(0, ((input.Glucose - 70) / 130) * 100));

    // BMI (0 - 67, weight 25%) -> baseline normal ~22
    const bmiScore = Math.min(100, Math.max(0, ((input.BMI - 18) / 32) * 100));

    // Age (21 - 81, weight 15%)
    const ageScore = Math.min(100, Math.max(0, ((input.Age - 21) / 60) * 100));

    // Insulin (0 - 846, weight 10%)
    const insulinScore = Math.min(100, Math.max(0, ((input.Insulin - 30) / 200) * 100));

    // BloodPressure (0 - 122, weight 10%)
    const bpScore = Math.min(100, Math.max(0, ((input.BloodPressure - 60) / 60) * 100));

    // Weighted sum
    let rawRisk =
      glucoseScore * 0.40 +
      bmiScore * 0.25 +
      ageScore * 0.15 +
      insulinScore * 0.10 +
      bpScore * 0.10;

    // Pedigree function adjustment
    if (input.DiabetesPedigreeFunction > 0.8) {
      rawRisk += 5;
    }

    // Small randomness +/- 3%
    const randomVariation = (Math.random() * 6 - 3);
    let finalPercentage = Math.round(Math.min(99, Math.max(5, rawRisk + randomVariation)));

    const riskLevel = getRiskLevel(finalPercentage);
    const recommendations: string[] = [];

    // Specific prompt rules:
    if (input.Glucose > 140) {
      recommendations.push('Reduce sugar intake, consult endocrinologist');
    }
    if (input.BMI > 30) {
      recommendations.push('Start a supervised weight loss program');
    }
    if (input.BloodPressure > 90) {
      recommendations.push('Monitor blood pressure daily, reduce salt');
    }
    if (finalPercentage > 70) {
      recommendations.push('Book an appointment immediately');
    }

    // Default healthy advice if no triggers
    if (recommendations.length === 0) {
      recommendations.push('Maintain a balanced diet rich in fiber and keep an active lifestyle.');
      recommendations.push('Perform annual routine fasting glucose screening.');
    }

    return {
      disease: 'diabetes',
      riskPercentage: finalPercentage,
      riskLevel,
      recommendations,
      inputs: input,
    };
  },

  calculateHeartRisk(input: KaggleHeartInput): DiseaseAssessmentResult {
    // Weighted components: Age, Cholesterol, MaxHR, Oldpeak, ChestPainType, ExerciseAngina, ST_Slope
    let score = 15;

    // Age: older = higher risk
    if (input.Age >= 60) score += 15;
    else if (input.Age >= 50) score += 10;
    else if (input.Age >= 40) score += 5;

    // Cholesterol (0 - 603)
    if (input.Cholesterol > 240) score += 18;
    else if (input.Cholesterol > 200) score += 10;
    else if (input.Cholesterol === 0) score += 8; // Missing in some dataset records

    // MaxHR (lower max achieved HR indicates poor cardiovascular reserve)
    if (input.MaxHR < 110) score += 14;
    else if (input.MaxHR < 135) score += 8;

    // Oldpeak (0 - 6.2, ST depression)
    if (input.Oldpeak >= 2.0) score += 18;
    else if (input.Oldpeak >= 1.0) score += 10;

    // ChestPainType: TA (Typical Angina) and ASY (Asymptomatic high CAD)
    if (input.ChestPainType === 'ASY') score += 16;
    else if (input.ChestPainType === 'TA') score += 14;
    else if (input.ChestPainType === 'ATA') score += 5;

    // ExerciseAngina ('Y'/'N')
    if (input.ExerciseAngina === 'Y') score += 16;

    // ST_Slope ('Up'/'Flat'/'Down')
    if (input.ST_Slope === 'Flat') score += 14;
    else if (input.ST_Slope === 'Down') score += 18;
    else if (input.ST_Slope === 'Up') score -= 5;

    // Sex factor
    if (input.Sex === 'M') score += 4;

    // Small randomness +/- 3%
    const randomVariation = (Math.random() * 6 - 3);
    let finalPercentage = Math.round(Math.min(99, Math.max(5, score + randomVariation)));

    const riskLevel = getRiskLevel(finalPercentage);
    const recommendations: string[] = [];

    // Prompt rules & Heart specific rules:
    if (finalPercentage > 70) {
      recommendations.push('Book an appointment immediately');
    }
    if (input.Cholesterol > 200) {
      recommendations.push('Adopt low-saturated fat diet and monitor lipid profile');
    }
    if (input.ExerciseAngina === 'Y') {
      recommendations.push('Avoid strenuous exertion, seek cardiologist evaluation');
    }
    if (input.ST_Slope === 'Flat' || input.ST_Slope === 'Down') {
      recommendations.push('Abnormal ECG stress response detected; clinical stress test advised');
    }
    if (input.RestingBP > 140) {
      recommendations.push('Resting blood pressure elevated; consult cardiologist for hypertension');
    }
    if (input.FastingBS === 1) {
      recommendations.push('Elevated fasting blood sugar increases vascular vulnerability');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain heart-healthy Mediterranean nutrition and aerobic exercise.');
      recommendations.push('Schedule annual routine electrocardiogram (ECG) and lipid screening.');
    }

    return {
      disease: 'heart',
      riskPercentage: finalPercentage,
      riskLevel,
      recommendations,
      inputs: input,
    };
  },

  async submitHealthAssessment(data: {
    patientId: string;
    patientName: string;
    diabetesInput?: PimaDiabetesInput;
    heartInput?: KaggleHeartInput;
  }): Promise<HealthRiskReport> {
    await sleep(400); // simulate ML inference latency

    let diabetesResult: DiseaseAssessmentResult | undefined;
    let heartResult: DiseaseAssessmentResult | undefined;

    if (data.diabetesInput) {
      diabetesResult = this.calculateDiabetesRisk(data.diabetesInput);
    }
    if (data.heartInput) {
      heartResult = this.calculateHeartRisk(data.heartInput);
    }

    // Determine overall risk level
    const maxScore = Math.max(
      diabetesResult?.riskPercentage || 0,
      heartResult?.riskPercentage || 0
    );
    const overallRiskLevel = getRiskLevel(maxScore);

    const newReport: HealthRiskReport = {
      id: `rep-${Date.now()}`,
      patientId: data.patientId,
      patientName: data.patientName,
      date: getTodayDateString(),
      createdAt: new Date().toISOString(),
      hasDiabetes: !!diabetesResult,
      hasHeart: !!heartResult,
      diabetesResult,
      heartResult,
      overallRiskLevel,
      overallRiskPercentage: maxScore,
    };

    // Save as new report and keep all old reports
    const existingReports = getStorageItem<HealthRiskReport[]>(STORAGE_KEYS.HEALTH_REPORTS, []);
    existingReports.unshift(newReport);
    setStorageItem(STORAGE_KEYS.HEALTH_REPORTS, existingReports);

    return newReport;
  },

  async getAllReports(patientId?: string): Promise<HealthRiskReport[]> {
    await sleep();
    const reports = getStorageItem<HealthRiskReport[]>(STORAGE_KEYS.HEALTH_REPORTS, []);
    if (patientId) {
      return reports.filter((r) => r.patientId === patientId);
    }
    return reports;
  },

  async getReportById(reportId: string): Promise<HealthRiskReport | null> {
    await sleep();
    const reports = getStorageItem<HealthRiskReport[]>(STORAGE_KEYS.HEALTH_REPORTS, []);
    return reports.find((r) => r.id === reportId) || null;
  },
};

// ----------------------------------------------------
// 7. AuthApi (Role-based login & Registration)
// ----------------------------------------------------
export const AuthApi = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    await sleep();
    const cleanEmail = email.trim().toLowerCase();
    const users = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
    const passwords = getStorageItem<Record<string, string>>('smartclinic_passwords', {});

    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const storedPass = passwords[cleanEmail];
    if (storedPass && storedPass !== password) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    if (user.role === 'doctor') {
      const doctors = getStorageItem<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
      const doc = doctors.find((d) => d.userId === user.id || d.email.toLowerCase() === cleanEmail);

      if (doc && !doc.approved) {
        throw new Error('Waiting for admin approval. Your registration is currently under review by the clinic administrator.');
      }
      if (user.approved === false) {
        throw new Error('Waiting for admin approval. Your registration is currently under review by the clinic administrator.');
      }
    }

    const token = createFakeJwt(user);
    setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
    setStorageItem(STORAGE_KEYS.TOKEN, token);

    return { token, user };
  },

  async registerPatient(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ token: string; user: User }> {
    await sleep();
    const cleanEmail = data.email.trim().toLowerCase();
    const users = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: User = {
      id: `user-pat-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: 'patient',
      phone: data.phone.trim(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStorageItem(STORAGE_KEYS.USERS, users);

    const passwords = getStorageItem<Record<string, string>>('smartclinic_passwords', {});
    passwords[cleanEmail] = data.password;
    setStorageItem('smartclinic_passwords', passwords);

    const token = createFakeJwt(newUser);
    setStorageItem(STORAGE_KEYS.CURRENT_USER, newUser);
    setStorageItem(STORAGE_KEYS.TOKEN, token);

    return { token, user: newUser };
  },

  async registerDoctor(data: {
    name: string;
    email: string;
    phone: string;
    specialty: Specialty;
    address: string;
    appointmentPrice: number;
    weeklySchedule: string[];
    password: string;
    qualification?: string;
    bio?: string;
  }): Promise<{ user: User; doctor: Doctor; message: string }> {
    await sleep();
    const cleanEmail = data.email.trim().toLowerCase();
    const users = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const newUserId = `user-doc-${Date.now()}`;
    const newDocId = `doc-${Date.now()}`;

    const newUser: User = {
      id: newUserId,
      name: data.name.trim(),
      email: cleanEmail,
      role: 'doctor',
      phone: data.phone.trim(),
      specialty: data.specialty,
      approved: false, // PENDING APPROVAL!
      createdAt: new Date().toISOString(),
    };

    const newDoctor: Doctor = {
      id: newDocId,
      userId: newUserId,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      specialty: data.specialty,
      address: data.address.trim() || 'SmartClinic Specialty Clinic, Boston MA',
      appointmentPrice: Number(data.appointmentPrice) || 120,
      patientsPerDayLimit: 10,
      weeklySchedule: data.weeklySchedule.length > 0 ? data.weeklySchedule : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      approved: false,
      qualification: data.qualification || 'Board Certified Medical Specialist',
      bio: data.bio || 'Dedicated medical professional with passion for evidence-based clinical care.',
      rating: 5.0,
      experienceYears: 5,
    };

    users.push(newUser);
    setStorageItem(STORAGE_KEYS.USERS, users);

    const doctors = getStorageItem<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
    doctors.push(newDoctor);
    setStorageItem(STORAGE_KEYS.DOCTORS, doctors);

    const passwords = getStorageItem<Record<string, string>>('smartclinic_passwords', {});
    passwords[cleanEmail] = data.password;
    setStorageItem('smartclinic_passwords', passwords);

    const allAvails = getStorageItem<Record<string, DayAvailability[]>>(STORAGE_KEYS.AVAILABILITIES, {});
    allAvails[newDocId] = generate60DaysAvailability(newDocId);
    setStorageItem(STORAGE_KEYS.AVAILABILITIES, allAvails);

    return {
      user: newUser,
      doctor: newDoctor,
      message: 'Waiting for admin approval',
    };
  },

  getCurrentUser(): User | null {
    return getStorageItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  getToken(): string | null {
    return getStorageItem<string | null>(STORAGE_KEYS.TOKEN, null);
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  },
};
