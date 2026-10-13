import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Doctor, Specialty } from '../types';
import { AuthApi, DoctorsApi } from '../services/mockApi';
import { initStorage, USER_PASSWORDS } from '../services/mockStorage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  doctorProfile: Doctor | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registerPatient: (data: { name: string; email: string; phone: string; password: string }) => Promise<User>;
  registerDoctor: (data: {
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
  }) => Promise<{ message: string; doctor: Doctor }>;
  logout: () => void;
  quickLogin: (email: string) => Promise<User>;
  refreshDoctorProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize storage and check session on mount
  useEffect(() => {
    initStorage();
    const storedUser = AuthApi.getCurrentUser();
    const storedToken = AuthApi.getToken();

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
      if (storedUser.role === 'doctor') {
        DoctorsApi.getDoctorByUserId(storedUser.id).then((doc) => {
          setDoctorProfile(doc);
        });
      }
    }
    setIsLoading(false);
  }, []);

  const refreshDoctorProfile = async () => {
    if (user && user.role === 'doctor') {
      const doc = await DoctorsApi.getDoctorByUserId(user.id);
      setDoctorProfile(doc);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const { user: loggedInUser, token: authToken } = await AuthApi.login(email, password);
      setUser(loggedInUser);
      setToken(authToken);

      if (loggedInUser.role === 'doctor') {
        const doc = await DoctorsApi.getDoctorByUserId(loggedInUser.id);
        setDoctorProfile(doc);
      } else {
        setDoctorProfile(null);
      }

      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  };

  const registerPatient = async (data: { name: string; email: string; phone: string; password: string }): Promise<User> => {
    setIsLoading(true);
    try {
      const { user: registeredUser, token: authToken } = await AuthApi.registerPatient(data);
      setUser(registeredUser);
      setToken(authToken);
      setDoctorProfile(null);
      return registeredUser;
    } finally {
      setIsLoading(false);
    }
  };

  const registerDoctor = async (data: {
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
  }) => {
    setIsLoading(true);
    try {
      // Doctor registers in unapproved state ("Waiting for admin approval")
      const result = await AuthApi.registerDoctor(data);
      return {
        message: result.message,
        doctor: result.doctor,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthApi.logout();
    setUser(null);
    setToken(null);
    setDoctorProfile(null);
  };

  const quickLogin = async (email: string): Promise<User> => {
    const password = USER_PASSWORDS[email] || 'doctor123';
    return await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        doctorProfile,
        isLoading,
        login,
        registerPatient,
        registerDoctor,
        logout,
        quickLogin,
        refreshDoctorProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
