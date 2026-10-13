import React, { useState, useEffect } from 'react';
import { Doctor } from '../../types';
import { DoctorsApi } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import { DoctorBookingView } from './DoctorBookingView';
import {
  Stethoscope,
  Heart,
  Droplet,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Star,
  Users,
  Award,
} from 'lucide-react';

interface DoctorDirectoryPageProps {
  onNavigate: (tab: string, context?: any) => void;
  initialSpecialty?: string;
  selectedDoctorId?: string;
}

export const DoctorDirectoryPage: React.FC<DoctorDirectoryPageProps> = ({
  onNavigate,
  initialSpecialty,
  selectedDoctorId,
}) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSpecialty, setFilterSpecialty] = useState<string>(initialSpecialty || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    loadDoctors();
  }, [user]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      // Cards of approved doctors
      const docs = await DoctorsApi.getAllDoctors({
        approvedOnly: user?.role !== 'admin',
      });
      setDoctors(docs);

      if (selectedDoctorId) {
        const doc = docs.find((d) => d.id === selectedDoctorId);
        if (doc) setBookingDoctor(doc);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter by Diabetes or Heart only
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpecialty =
      filterSpecialty === 'all' || doc.specialty === filterSpecialty;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  // If a doctor is selected for booking, show the Doctor page / booking view
  if (bookingDoctor) {
    return (
      <DoctorBookingView
        doctor={bookingDoctor}
        onBack={() => setBookingDoctor(null)}
        onSuccess={() => {
          loadDoctors();
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2 border border-teal-200/60">
            <Stethoscope className="w-3.5 h-3.5" />
            Specialist Directory
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Approved Clinic Doctors
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Book appointments directly with our endocrinology (Diabetes) and cardiology (Heart) specialists.
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or clinic..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Specialty Filter Buttons: Filter by Diabetes or Heart only */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterSpecialty('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            filterSpecialty === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          All Approved Doctors ({doctors.length})
        </button>
        <button
          onClick={() => setFilterSpecialty('Diabetes Specialist')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
            filterSpecialty === 'Diabetes Specialist'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white hover:bg-teal-50 text-teal-800 border border-teal-200'
          }`}
        >
          <Droplet className="w-3.5 h-3.5" />
          Diabetes Only
        </button>
        <button
          onClick={() => setFilterSpecialty('Heart Specialist')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
            filterSpecialty === 'Heart Specialist'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white hover:bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          Heart Only
        </button>
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
          Loading doctors...
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No doctors match your filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try selecting another specialty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map((doc) => {
            const isDiabetes = doc.specialty === 'Diabetes Specialist';
            return (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                          isDiabetes
                            ? 'bg-gradient-to-tr from-teal-600 to-cyan-500'
                            : 'bg-gradient-to-tr from-rose-600 to-pink-500'
                        }`}
                      >
                        {doc.name.split(' ').slice(1).map((n) => n[0]).join('') || 'DR'}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">{doc.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                              isDiabetes
                                ? 'bg-teal-50 text-teal-700 border-teal-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {doc.specialty}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-slate-900">
                        ${doc.appointmentPrice}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">No fee at booking</div>
                    </div>
                  </div>

                  {doc.qualification && (
                    <div className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                      <Award className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{doc.qualification}</span>
                    </div>
                  )}

                  {doc.bio && (
                    <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                      {doc.bio}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{doc.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 pt-1 border-t border-slate-200/60 mt-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>
                        Schedule: <strong>{doc.weeklySchedule.join(', ')}</strong> (Cap: 10/day)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setBookingDoctor(doc)}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    View Doctor & Register Booking
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
