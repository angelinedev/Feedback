
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Student, Faculty } from '@/lib/types';
import { useData } from './data-provider';

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
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { loginStudent, loginFaculty, updateStudentPassword, updateFacultyPassword } = useData();

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
    setLoading(false);
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
    setLoading(true);
    let foundUser: User | null = null;
    
    if (role === 'admin') {
      if (id === 'admin' && pass === 'admin') {
        foundUser = { id: 'admin', name: 'Admin', role: 'admin', details: { id: 'admin', name: 'Admin' } };
      }
    } else if (role === 'student') {
      const student = await loginStudent(id, pass);
      if (student) {
        foundUser = { id: student.id, name: student.name, role: 'student', details: student };
      }
    } else if (role === 'faculty') {
      const facultyMember = await loginFaculty(id, pass);
      if (facultyMember) {
        foundUser = { id: facultyMember.id, name: facultyMember.name, role: 'faculty', details: facultyMember };
      }
    }

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('feedloop-user', JSON.stringify(foundUser));
      router.push(`/${foundUser.role}/dashboard`);
      setLoading(false);
      return true;
    }

    setLoading(false);
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
    let details: Student | Faculty;

    if(user.role === 'student') {
        details = user.details as Student;
        if(details.password === currentPassword) {
            await updateStudentPassword(details.id, newPassword);
            success = true;
        }
    } else if (user.role === 'faculty') {
        details = user.details as Faculty;
        if(details.password === currentPassword) {
            await updateFacultyPassword(details.id, newPassword);
            success = true;
        }
    } else if (user.role === 'admin') {
        // For simplicity, admin password change is not implemented
        throw new Error("Admin password cannot be changed in this version.");
    }
    
    if(!success) {
        throw new Error("Incorrect current password.");
    } else {
        // Also update user in state and local storage
        const updatedUser = {
            ...user,
            details: { ...user.details, password: newPassword }
        };
        setUser(updatedUser as User);
        localStorage.setItem('feedloop-user', JSON.stringify(updatedUser));
    }
  };

  const value = { user, loading, login, logout, changePassword };
  
  if(loading && !user) { // Only show loader on initial load
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
