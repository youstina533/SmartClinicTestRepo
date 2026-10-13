import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PimaDiabetesInput, KaggleHeartInput } from '../../types';
import { MlServiceApi } from '../../services/mockApi';
import {
  Sparkles,
  Droplet,
  Heart,
  ArrowRight,
  Sliders,
  CheckSquare,
  Square,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Undo2,
} from 'lucide-react';

interface EnterHealthDataPageProps {
  onNavigate: (tab: string, context?: any) => void;
}

export const EnterHealthDataPage: React.FC<EnterHealthDataPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  // Selection to fill one or both sections
  const [includeDiabetes, setIncludeDiabetes] = useState(true);
  const [includeHeart, setIncludeHeart] = useState(true);

  // Diabetes (Pima) Form State - Exact Kaggle ranges
  const [diabetesData, setDiabetesData] = useState<PimaDiabetesInput>({
    Pregnancies: 1, // 0 - 17
    Glucose: 120, // 0 - 200
    BloodPressure: 78, // 0 - 122
    SkinThickness: 24, // 0 - 99
    Insulin: 85, // 0 - 846
    BMI: 28.5, // 0 - 67
    DiabetesPedigreeFunction: 0.45, // 0.08 - 2.42
    Age: 42, // 21 - 81
  });

  // Heart Form State - Exact Kaggle columns & ranges
  const [heartData, setHeartData] = useState<KaggleHeartInput>({
    Age: 52, // 20 - 85
    Sex: 'M', // M / F
    ChestPainType: 'NAP', // ATA / NAP / ASY / TA
    RestingBP: 130, // 0 - 200
    Cholesterol: 215, // 0 - 603
    FastingBS: 0, // 0 / 1
    RestingECG: 'Normal', // Normal / ST / LVH
    MaxHR: 148, // 60 - 202
    ExerciseAngina: 'N', // Y / N
    Oldpeak: 0.8, // 0 - 6.2
    ST_Slope: 'Up', // Up / Flat / Down
  });

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Quick preset buttons to let users quickly explore High / Normal ranges
  const applyHighRiskPresets = () => {
    setDiabetesData({
      Pregnancies: 3,
      Glucose: 165, // > 140 rule
      BloodPressure: 98, // > 90 rule
      SkinThickness: 35,
      Insulin: 180,
      BMI: 34.2, // > 30 rule
      DiabetesPedigreeFunction: 0.95,
      Age: 56,
    });
    setHeartData({
      Age: 62,
      Sex: 'M',
      ChestPainType: 'TA',
      RestingBP: 155, // > 140
      Cholesterol: 275, // > 200 rule
      FastingBS: 1, // High fasting BS
      RestingECG: 'ST',
      MaxHR: 110,
      ExerciseAngina: 'Y', // Angina rule
      Oldpeak: 2.8,
      ST_Slope: 'Flat', // Flat slope rule
    });
  };

  const applyLowRiskPresets = () => {
    setDiabetesData({
      Pregnancies: 0,
      Glucose: 88,
      BloodPressure: 72,
      SkinThickness: 18,
      Insulin: 45,
      BMI: 22.4,
      DiabetesPedigreeFunction: 0.22,
      Age: 29,
    });
    setHeartData({
      Age: 32,
      Sex: 'F',
      ChestPainType: 'ATA',
      RestingBP: 115,
      Cholesterol: 175,
      FastingBS: 0,
      RestingECG: 'Normal',
      MaxHR: 172,
      ExerciseAngina: 'N',
      Oldpeak: 0.0,
      ST_Slope: 'Up',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!includeDiabetes && !includeHeart) {
      setValidationError('Please select at least one assessment section (Diabetes or Heart).');
      return;
    }

    setValidationError(null);
    setLoading(true);

    try {
      const patientId = user?.id || 'patient-demo';
      const patientName = user?.name || 'Patient';

      const report = await MlServiceApi.submitHealthAssessment({
        patientId,
        patientName,
        diabetesInput: includeDiabetes ? diabetesData : undefined,
        heartInput: includeHeart ? heartData : undefined,
      });

      // Navigate to the Report page with the newly generated report
      onNavigate('report-detail', { reportId: report.id });
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : 'Assessment failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div>
        <button
          onClick={() => onNavigate('patient-profile')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-2"
        >
          <Undo2 className="w-3.5 h-3.5" />
          Back to Patient Profile
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Enter Clinical Health Data
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Exact Kaggle Machine Learning dataset features with constrained medical ranges.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Fill:</span>
            <button
              type="button"
              onClick={applyLowRiskPresets}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200 transition"
            >
              Normal Ranges
            </button>
            <button
              type="button"
              onClick={applyHighRiskPresets}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold border border-rose-200 transition"
            >
              Elevated / High Risk
            </button>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Section selection toggles: "The patient may fill one section or both" */}
      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Choose Sections to Evaluate:
        </span>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDiabetes}
              onChange={(e) => setIncludeDiabetes(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded accent-teal-600"
            />
            <span className="flex items-center gap-1 text-slate-800">
              <Droplet className="w-3.5 h-3.5 text-teal-600" />
              Diabetes (Pima Dataset)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeHeart}
              onChange={(e) => setIncludeHeart(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded accent-rose-600"
            />
            <span className="flex items-center gap-1 text-slate-800">
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              Heart Disease Dataset
            </span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: DIABETES (PIMA DATASET) */}
        {includeDiabetes && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Section 1: Diabetes (Pima Indian Dataset)
                </h2>
                <p className="text-xs text-slate-400">
                  Exact columns: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Pregnancies (0 - 17) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>Pregnancies</label>
                  <span className="text-teal-700 font-bold">{diabetesData.Pregnancies}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={17}
                  value={diabetesData.Pregnancies}
                  onChange={(e) =>
                    setDiabetesData({ ...diabetesData, Pregnancies: Number(e.target.value) })
                  }
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 0 - 17</span>
              </div>

              {/* Glucose (0 - 200) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>Glucose (mg/dL)</label>
                  <span className={`font-bold ${diabetesData.Glucose > 140 ? 'text-rose-600' : 'text-teal-700'}`}>
                    {diabetesData.Glucose}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={diabetesData.Glucose}
                  onChange={(e) =>
                    setDiabetesData({ ...diabetesData, Glucose: Number(e.target.value) })
                  }
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 0 - 200 (Alert if &gt;140)</span>
              </div>

              {/* BloodPressure (0 - 122) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>BloodPressure (mmHg)</label>
                  <span className={`font-bold ${diabetesData.BloodPressure > 90 ? 'text-rose-600' : 'text-teal-700'}`}>
                    {diabetesData.BloodPressure}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={122}
                  value={diabetesData.BloodPressure}
                  onChange={(e) =>
                    setDiabetesData({ ...diabetesData, BloodPressure: Number(e.target.value) })
                  }
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 0 - 122 (Alert if &gt;90)</span>
              </div>

              {/* SkinThickness (0 - 99) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>SkinThickness (mm)</label>
                  <span className="text-teal-700 font-bold">{diabetesData.SkinThickness}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={99}
                  value={diabetesData.SkinThickness}
                  onChange={(e) =>
                    setDiabetesData({ ...diabetesData, SkinThickness: Number(e.target.value) })
                  }
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 0 - 99 mm</span>
              </div>

              {/* Insulin (0 - 846) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>Insulin (µU/mL)</label>
                  <span className="text-teal-700 font-bold">{diabetesData.Insulin}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={846}
                  value={diabetesData.Insulin}
                  onChange={(e) =>
                    setDiabetesData({ ...diabetesData, Insulin: Number(e.target.value) })
                  }
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 0 - 846 µU/mL</span>
              </div>

              {/* BMI (0 - 67) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>BMI (kg/m²)</label>
                  <span className={`font-bold ${diabetesData.BMI > 30 ? 'text-rose-600' : 'text-teal-700'}`}>
                    {diabetesData.BMI.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={67}
                  step={0.1}
                  value={diabetesData.BMI}
                  onChange={(e) =>
                    setDiabetesData({ ...diabetesData, BMI: Number(e.target.value) })
                  }
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 0 - 67 (Alert if &gt;30)</span>
              </div>

              {/* DiabetesPedigreeFunction (0.08 - 2.42) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>DiabetesPedigreeFunction</label>
                  <span className="text-teal-700 font-bold">
                    {diabetesData.DiabetesPedigreeFunction.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.08}
                  max={2.42}
                  step={0.01}
                  value={diabetesData.DiabetesPedigreeFunction}
                  onChange={(e) =>
                    setDiabetesData({
                      ...diabetesData,
                      DiabetesPedigreeFunction: Number(e.target.value),
                    })
                  }
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 0.08 - 2.42</span>
              </div>

              {/* Age (21 - 81) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>Age (years)</label>
                  <span className="text-teal-700 font-bold">{diabetesData.Age}</span>
                </div>
                <input
                  type="range"
                  min={21}
                  max={81}
                  value={diabetesData.Age}
                  onChange={(e) =>
                    setDiabetesData({ ...diabetesData, Age: Number(e.target.value) })
                  }
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 21 - 81 years</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: HEART DISEASE DATASET */}
        {includeHeart && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Section 2: Heart Disease (Cardiovascular Dataset)
                </h2>
                <p className="text-xs text-slate-400">
                  Exact columns: Age, Sex, ChestPainType, RestingBP, Cholesterol, FastingBS, RestingECG, MaxHR, ExerciseAngina, Oldpeak, ST_Slope.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Age */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>Age (years)</label>
                  <span className="text-rose-700 font-bold">{heartData.Age}</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={85}
                  value={heartData.Age}
                  onChange={(e) => setHeartData({ ...heartData, Age: Number(e.target.value) })}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 20 - 85 years</span>
              </div>

              {/* Sex (M / F) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Sex (M / F)</label>
                <select
                  value={heartData.Sex}
                  onChange={(e) => setHeartData({ ...heartData, Sex: e.target.value as 'M' | 'F' })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="M">M (Male)</option>
                  <option value="F">F (Female)</option>
                </select>
                <span className="text-[10px] text-slate-400 block">Biological Gender</span>
              </div>

              {/* ChestPainType (ATA / NAP / ASY / TA) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  ChestPainType
                </label>
                <select
                  value={heartData.ChestPainType}
                  onChange={(e) =>
                    setHeartData({
                      ...heartData,
                      ChestPainType: e.target.value as 'ATA' | 'NAP' | 'ASY' | 'TA',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="ATA">ATA (Atypical Angina)</option>
                  <option value="NAP">NAP (Non-Anginal Pain)</option>
                  <option value="ASY">ASY (Asymptomatic)</option>
                  <option value="TA">TA (Typical Angina)</option>
                </select>
                <span className="text-[10px] text-slate-400 block">ATA / NAP / ASY / TA</span>
              </div>

              {/* RestingBP */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>RestingBP (mmHg)</label>
                  <span className={`font-bold ${heartData.RestingBP > 140 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {heartData.RestingBP}
                  </span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={200}
                  value={heartData.RestingBP}
                  onChange={(e) =>
                    setHeartData({ ...heartData, RestingBP: Number(e.target.value) })
                  }
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 80 - 200 mmHg</span>
              </div>

              {/* Cholesterol (0 - 603) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>Cholesterol (mg/dL)</label>
                  <span className={`font-bold ${heartData.Cholesterol > 200 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {heartData.Cholesterol}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={603}
                  value={heartData.Cholesterol}
                  onChange={(e) =>
                    setHeartData({ ...heartData, Cholesterol: Number(e.target.value) })
                  }
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 0 - 603 (Alert if &gt;200)</span>
              </div>

              {/* FastingBS (0 / 1) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">FastingBS (0 / 1)</label>
                <select
                  value={heartData.FastingBS}
                  onChange={(e) =>
                    setHeartData({ ...heartData, FastingBS: Number(e.target.value) as 0 | 1 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value={0}>0 (Fasting BS &le; 120 mg/dl)</option>
                  <option value={1}>1 (Fasting BS &gt; 120 mg/dl)</option>
                </select>
                <span className="text-[10px] text-slate-400 block">Fasting Blood Sugar</span>
              </div>

              {/* RestingECG (Normal / ST / LVH) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">RestingECG</label>
                <select
                  value={heartData.RestingECG}
                  onChange={(e) =>
                    setHeartData({
                      ...heartData,
                      RestingECG: e.target.value as 'Normal' | 'ST' | 'LVH',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Normal">Normal</option>
                  <option value="ST">ST (ST-T wave abnormality)</option>
                  <option value="LVH">LVH (Left Ventricular Hypertrophy)</option>
                </select>
                <span className="text-[10px] text-slate-400 block">Normal / ST / LVH</span>
              </div>

              {/* MaxHR (60 - 202) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>MaxHR (bpm)</label>
                  <span className="text-rose-700 font-bold">{heartData.MaxHR}</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={202}
                  value={heartData.MaxHR}
                  onChange={(e) => setHeartData({ ...heartData, MaxHR: Number(e.target.value) })}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 60 - 202 bpm</span>
              </div>

              {/* ExerciseAngina (Y / N) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  ExerciseAngina (Y / N)
                </label>
                <select
                  value={heartData.ExerciseAngina}
                  onChange={(e) =>
                    setHeartData({ ...heartData, ExerciseAngina: e.target.value as 'Y' | 'N' })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="N">N (No Exertional Angina)</option>
                  <option value="Y">Y (Yes - Exercise Induced Angina)</option>
                </select>
                <span className="text-[10px] text-slate-400 block">Y / N</span>
              </div>

              {/* Oldpeak (0 - 6.2) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label>Oldpeak</label>
                  <span className="text-rose-700 font-bold">{heartData.Oldpeak.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6.2}
                  step={0.1}
                  value={heartData.Oldpeak}
                  onChange={(e) =>
                    setHeartData({ ...heartData, Oldpeak: Number(e.target.value) })
                  }
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Range: 0.0 - 6.2 (ST depression)</span>
              </div>

              {/* ST_Slope (Up / Flat / Down) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  ST_Slope (Up / Flat / Down)
                </label>
                <select
                  value={heartData.ST_Slope}
                  onChange={(e) =>
                    setHeartData({
                      ...heartData,
                      ST_Slope: e.target.value as 'Up' | 'Flat' | 'Down',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Up">Up (Upsloping normal)</option>
                  <option value="Flat">Flat (Flat slope warning)</option>
                  <option value="Down">Down (Downsloping high risk)</option>
                </select>
                <span className="text-[10px] text-slate-400 block">Up / Flat / Down</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Submitting simulates the machine learning model inference and saves a new report into your history.
          </div>

          <button
            type="submit"
            disabled={loading || (!includeDiabetes && !includeHeart)}
            className="px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-teal-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Simulating ML Prediction...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Submit Health Data & Generate Report
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
