import React, { useState, useEffect } from 'react';
import { DoctorPatientRecord } from '../../types';
import { DoctorPatientsApi } from '../../services/mockApi';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  AreaChart,
  Area,
} from 'recharts';
import {
  Activity,
  Users,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const PopulationHealthChartsPage: React.FC = () => {
  const [patients, setPatients] = useState<DoctorPatientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all stored clinic patients (including the 30+ generated demo patients)
      const data = await DoctorPatientsApi.getAllPatientsAcrossClinic();
      setPatients(data);
    } finally {
      setLoading(false);
    }
  };

  // 1. Risk Distribution (High / Medium / Low)
  const highCount = patients.filter((p) => p.riskCategory === 'High').length;
  const mediumCount = patients.filter((p) => p.riskCategory === 'Medium').length;
  const lowCount = patients.filter((p) => p.riskCategory === 'Low').length;

  const riskDistributionData = [
    { name: 'High Risk (>70%)', value: highCount, color: '#EF4444' }, // Red
    { name: 'Medium Risk (40-70%)', value: mediumCount, color: '#F97316' }, // Orange
    { name: 'Low Risk (<40%)', value: lowCount, color: '#10B981' }, // Green
  ];

  // 2. Risk by Age Group (<35, 35-50, 50-65, 65+)
  const ageGroups = [
    { group: '< 35', min: 0, max: 34 },
    { group: '35 - 50', min: 35, max: 50 },
    { group: '50 - 65', min: 51, max: 65 },
    { group: '65+', min: 66, max: 120 },
  ];

  const riskByAgeData = ageGroups.map(({ group, min, max }) => {
    const groupPatients = patients.filter((p) => p.age >= min && p.age <= max);
    const high = groupPatients.filter((p) => p.riskCategory === 'High').length;
    const medium = groupPatients.filter((p) => p.riskCategory === 'Medium').length;
    const low = groupPatients.filter((p) => p.riskCategory === 'Low').length;
    const avgRisk =
      groupPatients.length > 0
        ? Math.round(groupPatients.reduce((acc, p) => acc + p.riskPercentage, 0) / groupPatients.length)
        : 0;

    return {
      ageGroup: group,
      'High Risk': high,
      'Medium Risk': medium,
      'Low Risk': low,
      'Average Risk %': avgRisk,
      total: groupPatients.length,
    };
  });

  // 3. Risk by Gender (Male vs Female)
  const malePatients = patients.filter((p) => p.gender === 'M');
  const femalePatients = patients.filter((p) => p.gender === 'F');

  const riskByGenderData = [
    {
      gender: 'Male Patients',
      'High Risk': malePatients.filter((p) => p.riskCategory === 'High').length,
      'Medium Risk': malePatients.filter((p) => p.riskCategory === 'Medium').length,
      'Low Risk': malePatients.filter((p) => p.riskCategory === 'Low').length,
      avgScore:
        malePatients.length > 0
          ? Math.round(malePatients.reduce((acc, p) => acc + p.riskPercentage, 0) / malePatients.length)
          : 0,
    },
    {
      gender: 'Female Patients',
      'High Risk': femalePatients.filter((p) => p.riskCategory === 'High').length,
      'Medium Risk': femalePatients.filter((p) => p.riskCategory === 'Medium').length,
      'Low Risk': femalePatients.filter((p) => p.riskCategory === 'Low').length,
      avgScore:
        femalePatients.length > 0
          ? Math.round(femalePatients.reduce((acc, p) => acc + p.riskPercentage, 0) / femalePatients.length)
          : 0,
    },
  ];

  // 4. BMI vs Risk Scatter Plot
  const bmiScatterData = patients.map((p) => ({
    name: p.patientName,
    bmi: p.bmi,
    risk: p.riskPercentage,
    riskCategory: p.riskCategory,
    age: p.age,
  }));

  // 5. Monthly New Patient Registrations (Jan to Oct)
  const monthLabels = [
    { key: '01', label: 'Jan' },
    { key: '02', label: 'Feb' },
    { key: '03', label: 'Mar' },
    { key: '04', label: 'Apr' },
    { key: '05', label: 'May' },
    { key: '06', label: 'Jun' },
    { key: '07', label: 'Jul' },
    { key: '08', label: 'Aug' },
    { key: '09', label: 'Sep' },
    { key: '10', label: 'Oct' },
  ];

  const monthlyRegistrationsData = monthLabels.map(({ key, label }) => {
    const count = patients.filter((p) => p.firstVisitDate && p.firstVisitDate.includes(`2026-${key}`)).length;
    return {
      month: label,
      newPatients: count,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2 border border-teal-200/60">
            <Activity className="w-3.5 h-3.5" />
            Epidemiological Analytics
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Population Health Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated demographic and biometric risk patterns across {patients.length} registered clinic patients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Cohort Size
            </span>
            <span className="text-2xl font-black text-teal-700">{patients.length}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
          Aggregating cohort statistics for Recharts visualizations...
        </div>
      ) : (
        <div className="space-y-8">
          {/* TOP ROW: Risk Distribution (Pie) + Monthly New Patient Registrations (Area) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* 1. Risk Distribution Chart */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-teal-600" />
                  Risk Distribution (High / Medium / Low)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proportion of patient population stratified into clinical severity bands.
                </p>
              </div>

              <div className="h-64 w-full my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} Patients (${Math.round((Number(val) / patients.length) * 100)}%)`, 'Volume']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend & Stats */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                {riskDistributionData.map((item) => (
                  <div key={item.name} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-bold text-slate-600 truncate">{item.name.split(' ')[0]}</span>
                    </div>
                    <span className="text-lg font-black text-slate-900 block">{item.value}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {Math.round((item.value / patients.length) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Monthly New Patient Registrations Chart */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  Monthly New Patient Registrations (2026)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monthly acquisition volume of patients enrolled with clinic doctors.
                </p>
              </div>

              <div className="h-64 w-full my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRegistrationsData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg">
                              <span className="font-bold text-teal-300">{payload[0].payload.month} 2026:</span>{' '}
                              <span>{payload[0].value} new patients enrolled</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="newPatients"
                      stroke="#0D9488"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#patientGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Active Period: Jan 2026 – Oct 2026</span>
                <span>Average: ~{Math.round(patients.length / 10)} patients / month</span>
              </div>
            </div>
          </div>

          {/* MIDDLE ROW: Risk by Age Group (Bar) + Risk by Gender (Bar) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 2. Risk by Age Group */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  Risk Stratification by Age Group
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparison of High, Medium, and Low risk cohorts across age decades.
                </p>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskByAgeData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="ageGroup" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="High Risk" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Medium Risk" fill="#F97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Low Risk" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Risk by Gender */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-600" />
                  Risk Severity Comparison by Gender
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gender-differentiated prevalence of high and moderate cardiovascular/metabolic risks.
                </p>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskByGenderData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="gender" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="High Risk" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Medium Risk" fill="#F97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Low Risk" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: 4. BMI vs Risk Scatter Plot */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  BMI vs. Risk Percentage Correlation (Scatter Plot)
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  Individual Patient Points (X: BMI, Y: Risk %)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays the positive epidemiological correlation between Body Mass Index (BMI) and composite disease risk score.
              </p>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    type="number"
                    dataKey="bmi"
                    name="BMI"
                    unit=" kg/m²"
                    domain={[18, 42]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="risk"
                    name="Risk"
                    unit="%"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <ZAxis range={[50, 120]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl space-y-1">
                            <div className="font-bold text-teal-300">{data.name}</div>
                            <div>BMI: <strong>{data.bmi} kg/m²</strong></div>
                            <div>Risk Score: <strong>{data.risk}%</strong> ({data.riskCategory})</div>
                            <div>Age: <strong>{data.age} yrs</strong></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Patients" data={bmiScatterData}>
                    {bmiScatterData.map((entry, index) => {
                      const fill =
                        entry.risk > 70
                          ? '#EF4444' // Red for high
                          : entry.risk >= 40
                          ? '#F97316' // Orange for medium
                          : '#10B981'; // Green for low
                      return <Cell key={`scatter-cell-${index}`} fill={fill} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  High Risk (&gt;70%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  Medium Risk (40-70%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Low Risk (&lt;40%)
                </span>
              </div>
              <span className="italic">Strong clinical regression observed above BMI 30 (Obesity threshold)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
