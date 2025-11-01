
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Student, Faculty, Feedback, ClassFacultyMapping, Question } from '@/lib/types';
import { mockStudents, mockFaculty, mockFeedback as initialFeedback, mockClassFacultyMapping as initialMappings } from '@/lib/mock-data';

export type UserRole = 'admin' | 'student' | 'faculty';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  details: Student | Faculty | { id: 'admin'; name: 'Admin' };
}

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  login: (role: UserRole, id: string, pass: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  addStudent: (student: Omit<Student, 'id' | 'password'>, password: string) => Promise<void>;
  updateStudent: (id: string, data: Partial<Omit<Student, 'id'>>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addFaculty: (faculty: Omit<Faculty, 'id' | 'password'>, password: string) => Promise<void>;
  updateFaculty: (id: string, data: Partial<Omit<Faculty, 'id'>>) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;
  addMapping: (mapping: Omit<ClassFacultyMapping, 'id'>) => Promise<void>;
  updateMapping: (id: string, data: Partial<Omit<ClassFacultyMapping, 'id'>>) => Promise<void>;
  deleteMapping: (id: string) => Promise<void>;
  addFeedback: (feedback: Omit<Feedback, 'id'>) => Promise<void>;
  updateStudentPassword: (id: string, newPass: string) => Promise<void>;
  updateFacultyPassword: (id: string, newPass: string) => Promise<void>;
  addBulkStudents: (students: Omit<Student, 'id'>[]) => Promise<void>;
  addBulkFaculty: (faculty: Omit<Faculty, 'id'>[]) => Promise<void>;
  addBulkMappings: (mappings: Omit<ClassFacultyMapping, 'id'>[]) => Promise<void>;
  students: Student[];
  faculty: Faculty[];
  mappings: ClassFacultyMapping[];
  feedback: Feedback[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get data from localStorage
const getFromStorage = <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error(`Failed to parse ${key} from localStorage`, e);
            return fallback;
        }
    }
    return fallback;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize state from localStorage or mock data
  const [students, setStudents] = useState<Student[]>(() => getFromStorage('app_students', mockStudents));
  const [faculty, setFaculty] = useState<Faculty[]>(() => getFromStorage('app_faculty', mockFaculty));
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => getFromStorage('app_feedbacks', initialFeedback));
  const [mappings, setMappings] = useState<ClassFacultyMapping[]>(() => getFromStorage('app_mappings', initialMappings));
  
  const router = useRouter();
  const pathname = usePathname();

  // Effect to persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('app_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('app_faculty', JSON.stringify(faculty));
  }, [faculty]);

  useEffect(() => {
    localStorage.setItem('app_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem('app_mappings', JSON.stringify(mappings));
  }, [mappings]);

  useEffect(() => {
    const storedUser = localStorage.getItem('feedloop-user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        if (parsedUser.id && parsedUser.role && parsedUser.name) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('feedloop-user');
      }
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const publicPaths = ['/'];
    const pathIsPublic = publicPaths.includes(pathname);

    if (!user && !pathIsPublic) {
      router.push('/');
    } else if (user && pathIsPublic) {
      router.push(`/${user.role}/dashboard`);
    }

  }, [user, authLoading, pathname, router]);

  const findUserInMemory = <T extends { password?: string }>(collection: T[], idField: keyof T, id: string, pass: string): T | null => {
    const user = collection.find(u => u[idField] === id);
    if (user && user.password === pass) {
      return user;
    }
    return null;
  }

  const login = async (role: UserRole, id: string, pass: string): Promise<boolean> => {
    setAuthLoading(true);
    let foundUser: User | null = null;

    if (role === 'admin') {
      if (id === 'admin' && pass === 'admin') {
        foundUser = { id: 'admin', name: 'Admin', role: 'admin', details: { id: 'admin', name: 'Admin' } };
      }
    } else if (role === 'student') {
      const student = findUserInMemory(students, 'register_number', id, pass);
      if (student) {
        foundUser = { id: student.id, name: student.name, role: 'student', details: student };
      }
    } else if (role === 'faculty') {
      const facultyMember = findUserInMemory(faculty, 'faculty_id', id, pass);
      if (facultyMember) {
        foundUser = { id: facultyMember.id, name: facultyMember.name, role: 'faculty', details: facultyMember };
      }
    }

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('feedloop-user', JSON.stringify(foundUser));
      router.push(`/${foundUser.role}/dashboard`);
      setAuthLoading(false);
      return true;
    }

    setAuthLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('feedloop-user');
    router.push('/');
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error("Not authenticated.");
    
    let success = false;
    if (user.role === 'student') {
        setStudents(prev => prev.map(s => {
          if (s.id === user.id && s.password === currentPassword) {
            success = true;
            return { ...s, password: newPassword };
          }
          return s;
        }));
    } else if (user.role === 'faculty') {
        setFaculty(prev => prev.map(f => {
          if (f.id === user.id && f.password === currentPassword) {
            success = true;
            return { ...f, password: newPassword };
          }
          return f;
        }));
    }
    
    if (!success) {
      throw new Error("Incorrect current password.");
    }
  };

  // Data management functions now use setState to trigger re-renders
  const addStudent = async (studentData: Omit<Student, 'id' | 'password'>, password: string) => {
    const newStudent: Student = { ...studentData, id: `student-${Date.now()}`, password };
    setStudents(prev => [...prev, newStudent]);
  };
  const updateStudent = async (id: string, data: Partial<Omit<Student, 'id'>>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };
  const deleteStudent = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };
  const updateStudentPassword = async (id: string, newPass: string) => {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, password: newPass } : s));
  };

  const addFaculty = async (facultyData: Omit<Faculty, 'id' | 'password'>, password: string) => {
    const newFaculty: Faculty = { ...facultyData, id: `faculty-${Date.now()}`, password };
    setFaculty(prev => [...prev, newFaculty]);
  };
  const updateFaculty = async (id: string, data: Partial<Omit<Faculty, 'id'>>) => {
    setFaculty(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
  };
  const deleteFaculty = async (id: string) => {
    setFaculty(prev => prev.filter(f => f.id !== id));
  };
  const updateFacultyPassword = async (id: string, newPass: string) => {
      setFaculty(prev => prev.map(f => f.id === id ? { ...f, password: newPass } : f));
  };

  const addMapping = async (mappingData: Omit<ClassFacultyMapping, 'id'>) => {
    const newMapping: ClassFacultyMapping = { ...mappingData, id: `map-${Date.now()}` };
    setMappings(prev => [...prev, newMapping]);
  };
  const updateMapping = async (id: string, data: Partial<Omit<ClassFacultyMapping, 'id'>>) => {
    setMappings(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };
  const deleteMapping = async (id: string) => {
    setMappings(prev => prev.filter(m => m.id !== id));
  };

  const addFeedback = async (feedbackData: Omit<Feedback, 'id'>) => {
    const newFeedback: Feedback = { ...feedbackData, id: `fb-${Date.now()}`, submitted_at: new Date() };
    setFeedbacks(prev => [...prev, newFeedback]);
  };

  const addBulkStudents = async (newStudents: Omit<Student, 'id'>[]) => {
    const studentsToAdd = newStudents.map(s => ({ ...s, id: `student-${Date.now()}-${Math.random()}`}));
    setStudents(prev => [...prev, ...studentsToAdd]);
  };
  const addBulkFaculty = async (newFaculty: Omit<Faculty, 'id'>[]) => {
    const facultyToAdd = newFaculty.map(f => ({ ...f, id: `faculty-${Date.now()}-${Math.random()}`}));
    setFaculty(prev => [...prev, ...facultyToAdd]);
  };
  const addBulkMappings = async (newMappings: Omit<ClassFacultyMapping, 'id'>[]) => {
    const mappingsToAdd = newMappings.map(m => ({ ...m, id: `map-${Date.now()}-${Math.random()}`}));
    setMappings(prev => [...prev, ...mappingsToAdd]);
  };
  
  const value: AuthContextType = {
    user,
    authLoading,
    login,
    logout,
    changePassword,
    addStudent,
    updateStudent,
    deleteStudent,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    addMapping,
    updateMapping,
    deleteMapping,
    addFeedback,
    updateStudentPassword,
    updateFacultyPassword,
    addBulkStudents,
    addBulkFaculty,
    addBulkMappings,
    students,
    faculty,
    mappings,
    feedback: feedbacks,
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

    