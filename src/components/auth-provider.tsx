"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Student, Faculty } from '@/lib/types';

// NOTE: In a real app, you would fetch this data from your backend.
// We are leaving the mock data here for login purposes, but the tables will be empty.
const mockStudents: Student[] = [
  { id: '1', register_number: '1111222233334441', name: 'Alice Johnson', password: 'password123', class_name: 'CS-A' },
  { id: '2', register_number: '1111222233334442', name: 'Bob Williams', password: 'password123', class_name: 'CS-A' },
  { id: '3', register_number: '1111222233334443', name: 'Charlie Brown', password: 'password123', class_name: 'CS-B' },
  { id: '4', register_number: '1111222233334444', name: 'Diana Miller', password: 'password123', class_name: 'EC-A' },
  { id: '5', register_number: '1111222233334445', name: 'Ethan Davis', password: 'password123', class_name: 'EC-A' },
];
const mockFaculty: Faculty[] = [
  { id: '101', faculty_id: '101', name: 'Dr. Evelyn Reed', password: 'password123', department: 'Computer Science' },
  { id: '102', faculty_id: '102', name: 'Prof. Samuel Green', password: 'password123', department: 'Computer Science' },
  { id: '201', faculty_id: '201', name: 'Dr. Olivia White', password: 'password123', department: 'Electronics' },
  { id: '202', faculty_id: '202', name: 'Prof. David Black', password: 'password123', department: 'Electronics' },
];


export type UserRole = 'admin' | 'student' | 'faculty';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  details: Student | Faculty | { id: 'admin'; name: 'Admin' };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: UserRole, id: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('feedloop-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('feedloop-user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/'];
    const pathIsPublic = publicPaths.includes(pathname);

    if (!user && !pathIsPublic) {
      router.push('/');
    } else if (user && pathIsPublic) {
      router.push(`/${user.role}/dashboard`);
    }

  }, [user, loading, pathname, router]);


  const login = async (role: UserRole, id: string, pass: string): Promise<boolean> => {
    let loggedInUser: User | null = null;
    
    if (role === 'admin') {
      if (id === 'admin' && pass === 'admin') {
        const adminDetails = { id: 'admin', name: 'Admin' };
        loggedInUser = { id: 'admin', name: 'Admin', role: 'admin', details: adminDetails };
      }
    } else if (role === 'student') {
      const student = mockStudents.find(s => s.register_number === id && s.password === pass);
      if (student) {
        loggedInUser = { id: student.id, name: student.name, role: 'student', details: student };
      }
    } else if (role === 'faculty') {
      const faculty = mockFaculty.find(f => f.faculty_id === id && f.password === pass);
      if (faculty) {
        loggedInUser = { id: faculty.id, name: faculty.name, role: 'faculty', details: faculty };
      }
    }

    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('feedloop-user', JSON.stringify(loggedInUser));
      router.push(`/${loggedInUser.role}/dashboard`);
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('feedloop-user');
    router.push('/');
  };

  const value = { user, loading, login, logout };

  if(loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
