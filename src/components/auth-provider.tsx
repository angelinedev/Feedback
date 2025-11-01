
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Student, Faculty, Feedback, ClassFacultyMapping, Question } from '@/lib/types';
import { mockStudents, mockFaculty, mockFeedback } from '@/lib/mock-data';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data stores
let students: Student[] = [...mockStudents];
let faculty: Faculty[] = [...mockFaculty];
let feedbacks: Feedback[] = [...mockFeedback];
let mappings: ClassFacultyMapping[] = [];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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
        const student = students.find(s => s.id === user.id);
        if (student && student.password === currentPassword) {
            student.password = newPassword;
            success = true;
        }
    } else if (user.role === 'faculty') {
        const fac = faculty.find(f => f.id === user.id);
        if (fac && fac.password === currentPassword) {
            fac.password = newPassword;
            success = true;
        }
    }
    
    if (!success) {
      throw new Error("Incorrect current password.");
    }
  };

  // Mock implementations for data management
  const addStudent = async (studentData: Omit<Student, 'id' | 'password'>, password: string) => {
    const newStudent: Student = { ...studentData, id: `student-${Date.now()}`, password };
    students.push(newStudent);
  };
  const updateStudent = async (id: string, data: Partial<Omit<Student, 'id'>>) => {
    students = students.map(s => s.id === id ? { ...s, ...data } : s);
  };
  const deleteStudent = async (id: string) => {
    students = students.filter(s => s.id !== id);
  };
  const updateStudentPassword = async (id: string, newPass: string) => {
      const student = students.find(s => s.id === id);
      if (student) student.password = newPass;
  };

  const addFaculty = async (facultyData: Omit<Faculty, 'id' | 'password'>, password: string) => {
    const newFaculty: Faculty = { ...facultyData, id: `faculty-${Date.now()}`, password };
    faculty.push(newFaculty);
  };
  const updateFaculty = async (id: string, data: Partial<Omit<Faculty, 'id'>>) => {
    faculty = faculty.map(f => f.id === id ? { ...f, ...data } : f);
  };
  const deleteFaculty = async (id: string) => {
    faculty = faculty.filter(f => f.id !== id);
  };
  const updateFacultyPassword = async (id: string, newPass: string) => {
      const fac = faculty.find(f => f.id === id);
      if (fac) fac.password = newPass;
  };

  const addMapping = async (mappingData: Omit<ClassFacultyMapping, 'id'>) => {
    const newMapping: ClassFacultyMapping = { ...mappingData, id: `map-${Date.now()}` };
    mappings.push(newMapping);
  };
  const updateMapping = async (id: string, data: Partial<Omit<ClassFacultyMapping, 'id'>>) => {
    mappings = mappings.map(m => m.id === id ? { ...m, ...data } : m);
  };
  const deleteMapping = async (id: string) => {
    mappings = mappings.filter(m => m.id !== id);
  };

  const addFeedback = async (feedbackData: Omit<Feedback, 'id'>) => {
    const newFeedback: Feedback = { ...feedbackData, id: `fb-${Date.now()}`, submitted_at: new Date() };
    feedbacks.push(newFeedback);
  };

  const addBulkStudents = async (newStudents: Omit<Student, 'id'>[]) => {
    newStudents.forEach(s => students.push({ ...s, id: `student-${Date.now()}-${Math.random()}`}));
  };
  const addBulkFaculty = async (newFaculty: Omit<Faculty, 'id'>[]) => {
    newFaculty.forEach(f => faculty.push({ ...f, id: `faculty-${Date.now()}-${Math.random()}`}));
  };
  const addBulkMappings = async (newMappings: Omit<ClassFacultyMapping, 'id'>[]) => {
    newMappings.forEach(m => mappings.push({ ...m, id: `map-${Date.now()}-${Math.random()}`}));
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
