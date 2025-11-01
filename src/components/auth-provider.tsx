
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFirebase } from '@/firebase/provider';
import type { Student, Faculty, Feedback, ClassFacultyMapping, Question } from '@/lib/types';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, where, getDocs, query, DocumentData } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const { firestore } = useFirebase();
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

  const findUserInFirestore = async (collectionName: string, idField: string, id: string, pass: string) => {
    if (!firestore) return null;
    const q = query(collection(firestore, collectionName), where(idField, '==', id));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as DocumentData;

    if (userData.password === pass) {
      return { ...userData, id: userDoc.id } as Student | Faculty;
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
      const student = await findUserInFirestore('students', 'register_number', id, pass) as Student | null;
      if (student) {
        foundUser = { id: student.id, name: student.name, role: 'student', details: student };
      }
    } else if (role === 'faculty') {
      const facultyMember = await findUserInFirestore('faculty', 'faculty_id', id, pass) as Faculty | null;
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

  const updateStudentPassword = async (id: string, newPass: string) => {
    if(!firestore) return;
    await updateDoc(doc(firestore, 'students', id), { password: newPass });
  };

  const updateFacultyPassword = async (id: string, newPass: string) => {
    if(!firestore) return;
     await updateDoc(doc(firestore, 'faculty', id), { password: newPass });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !firestore) throw new Error("Not authenticated.");

    let success = false;
    let details: Student | Faculty;

    if (user.role === 'student') {
        details = user.details as Student;
        const q = query(collection(firestore, 'students'), where('register_number', '==', details.register_number));
        const querySnapshot = await getDocs(q);
        if(!querySnapshot.empty){
            const userDoc = querySnapshot.docs[0];
            if (userDoc.data().password === currentPassword) {
                await updateDoc(userDoc.ref, { password: newPassword });
                success = true;
            }
        }
    } else if (user.role === 'faculty') {
        details = user.details as Faculty;
        const q = query(collection(firestore, 'faculty'), where('faculty_id', '==', details.faculty_id));
        const querySnapshot = await getDocs(q);
        if(!querySnapshot.empty){
            const userDoc = querySnapshot.docs[0];
            if (userDoc.data().password === currentPassword) {
                await updateDoc(userDoc.ref, { password: newPassword });
                success = true;
            }
        }
    } else if (user.role === 'admin') {
      throw new Error("Admin password cannot be changed in this version.");
    }
    
    if (!success) {
      throw new Error("Incorrect current password.");
    } else {
        const updatedUser = {
            ...user,
            details: { ...user.details, password: newPassword }
        };
        setUser(updatedUser as User);
        localStorage.setItem('feedloop-user', JSON.stringify(updatedUser));
    }
  };
  
  const addStudent = async (studentData: Omit<Student, 'id' | 'password'>, password: string) => {
    if(!firestore) return;
    await addDoc(collection(firestore, 'students'), { ...studentData, password });
  };
  const updateStudent = async (id: string, data: Partial<Omit<Student, 'id'>>) => {
    if(!firestore) return;
    await updateDoc(doc(firestore, 'students', id), data);
  };
  const deleteStudent = async (id: string) => {
    if(!firestore) return;
    await deleteDoc(doc(firestore, 'students', id));
  };

  const addFaculty = async (facultyData: Omit<Faculty, 'id' | 'password'>, password: string) => {
    if(!firestore) return;
    await addDoc(collection(firestore, 'faculty'), { ...facultyData, password });
  };
  const updateFaculty = async (id: string, data: Partial<Omit<Faculty, 'id'>>) => {
    if(!firestore) return;
    await updateDoc(doc(firestore, 'faculty', id), data);
  };
  const deleteFaculty = async (id: string) => {
    if(!firestore) return;
    await deleteDoc(doc(firestore, 'faculty', id));
  };

  const addMapping = async (mappingData: Omit<ClassFacultyMapping, 'id'>) => {
    if(!firestore) return;
    await addDoc(collection(firestore, 'classFacultyMapping'), mappingData);
  };
  const updateMapping = async (id: string, data: Partial<Omit<ClassFacultyMapping, 'id'>>) => {
    if(!firestore) return;
    await updateDoc(doc(firestore, 'classFacultyMapping', id), data);
  };
  const deleteMapping = async (id: string) => {
    if(!firestore) return;
    await deleteDoc(doc(firestore, 'classFacultyMapping', id));
  };

  const addFeedback = async (feedbackData: Omit<Feedback, 'id'>) => {
    if(!firestore) return;
    await addDoc(collection(firestore, 'feedback'), feedbackData);
  };

  const addBulk = async <T extends object>(collectionName: string, items: T[]) => {
    if(!firestore) return;
    const batch = writeBatch(firestore);
    const collectionRef = collection(firestore, collectionName);
    items.forEach(item => {
        const docRef = doc(collectionRef);
        batch.set(docRef, item);
    });
    await batch.commit();
  };

  const addBulkStudents = (d: Omit<Student, 'id'>[]) => addBulk('students', d);
  const addBulkFaculty = (d: Omit<Faculty, 'id'>[]) => addBulk('faculty', d);
  const addBulkMappings = (d: Omit<ClassFacultyMapping, 'id'>[]) => addBulk('classFacultyMapping', d);
  
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
