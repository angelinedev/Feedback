
"use client";

import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Student, Faculty, ClassFacultyMapping, Feedback, Question } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, where, getDocs, query, DocumentData } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';


interface DataContextType {
  students: Student[];
  faculty: Faculty[];
  mappings: ClassFacultyMapping[];
  feedback: Feedback[];
  questions: Question[];
  loading: boolean;
  addStudent: (student: Omit<Student, 'id' | 'password'>, password: string) => Promise<void>;
  updateStudent: (id: string, data: Partial<Omit<Student, 'id'>>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  updateStudentPassword: (id: string, newPass: string) => Promise<void>;
  addFaculty: (faculty: Omit<Faculty, 'id' | 'password'>, password: string) => Promise<void>;
  updateFaculty: (id: string, data: Partial<Omit<Faculty, 'id'>>) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;
  updateFacultyPassword: (id: string, newPass: string) => Promise<void>;
  addMapping: (mapping: Omit<ClassFacultyMapping, 'id'>) => Promise<void>;
  updateMapping: (id: string, data: Partial<Omit<ClassFacultyMapping, 'id'>>) => Promise<void>;
  deleteMapping: (id: string) => Promise<void>;
  addFeedback: (feedback: Omit<Feedback, 'id'>, studentId: string) => Promise<void>;
  addBulkStudents: (students: Omit<Student, 'id'>[]) => Promise<void>;
  addBulkFaculty: (faculty: Omit<Faculty, 'id'>[]) => Promise<void>;
  addBulkMappings: (mappings: Omit<ClassFacultyMapping, 'id'>[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { firestore } = useFirebase();
  const { user, authLoading } = useAuth();
  
  const studentsQuery = useMemo(() => {
    if (!firestore || !user || user.role !== 'admin') return null;
    return collection(firestore, 'students');
  }, [firestore, user]);

  const facultyQuery = useMemo(() => {
      if (!firestore || !user ) return null;
       if (user.role === 'admin' || user.role === 'student') return collection(firestore, 'faculty');
      return null
  }, [firestore, user]);
  
  const mappingsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    if(user.role === 'admin') return collection(firestore, 'classFacultyMapping');
    if(user.role === 'student') return query(collection(firestore, 'classFacultyMapping'), where('class_name', '==', (user.details as Student).class_name));
    if(user.role === 'faculty') return query(collection(firestore, 'classFacultyMapping'), where('faculty_id', '==', (user.details as Faculty).faculty_id));
    return null;
  }, [firestore, user]);

  const questionsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'questions');
  }, [firestore, user]);
  
  const feedbackQuery = useMemo(() => {
    if (!firestore || !user) return null;
    if (user.role === 'admin' || user.role === 'faculty') return collection(firestore, 'feedback');
    if (user.role === 'student') return query(collection(firestore, 'feedback'), where('student_id', '==', user.id));
    return null;
  }, [firestore, user]);

  const { data: studentsData, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);
  const { data: facultyData, isLoading: facultyLoading } = useCollection<Faculty>(facultyQuery);
  const { data: mappingsData, isLoading: mappingsLoading } = useCollection<ClassFacultyMapping>(mappingsQuery);
  const { data: feedbackData, isLoading: feedbackLoading } = useCollection<Feedback>(feedbackQuery);
  const { data: questionsData, isLoading: questionsLoading } = useCollection<Question>(questionsQuery);
  

  const loading = authLoading || studentsLoading || facultyLoading || mappingsLoading || feedbackLoading || questionsLoading;
  
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
  const updateStudentPassword = async (id: string, newPass: string) => {
    if(!firestore) return;
    await updateDoc(doc(firestore, 'students', id), { password: newPass });
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
  const updateFacultyPassword = async (id: string, newPass: string) => {
    if(!firestore) return;
     await updateDoc(doc(firestore, 'faculty', id), { password: newPass });
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

  const addFeedback = async (feedbackData: Omit<Feedback, 'id'>, studentId: string) => {
    if(!firestore) return;
    const feedbackRef = collection(firestore, 'feedback');
    await addDoc(feedbackRef, { ...feedbackData, student_id: studentId });
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

  const addBulkStudents = async (students: Omit<Student, 'id'>[]) => addBulk('students', students);
  const addBulkFaculty = async (faculty: Omit<Faculty, 'id'>[]) => addBulk('faculty', faculty);
  const addBulkMappings = async (mappings: Omit<ClassFacultyMapping, 'id'>[]) => addBulk('classFacultyMapping', mappings);


  const value: DataContextType = {
    students: studentsData || [],
    faculty: facultyData || [],
    mappings: mappingsData || [],
    feedback: feedbackData || [],
    questions: questionsData || [],
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    updateStudentPassword,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    updateFacultyPassword,
    addMapping,
    updateMapping,
    deleteMapping,
    addFeedback,
    addBulkStudents,
    addBulkFaculty,
    addBulkMappings,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
