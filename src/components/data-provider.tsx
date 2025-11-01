
"use client";

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import type { Student, Faculty, ClassFacultyMapping, Feedback, Question } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, where, getDocs, query } from 'firebase/firestore';
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
  addFeedback: (feedback: Omit<Feedback, 'id'>) => Promise<void>;
  addBulkStudents: (students: Omit<Student, 'id'>[]) => Promise<void>;
  addBulkFaculty: (faculty: Omit<Faculty, 'id'>[]) => Promise<void>;
  addBulkMappings: (mappings: Omit<ClassFacultyMapping, 'id'>[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user } = useAuth();

  const studentsQuery = useMemo(() => collection(firestore, 'students'), [firestore]);
  const facultyQuery = useMemo(() => collection(firestore, 'faculty'), [firestore]);
  const mappingsQuery = useMemo(() => collection(firestore, 'classFacultyMapping'), [firestore]);
  const questionsQuery = useMemo(() => collection(firestore, 'questions'), [firestore]);
  
  const feedbackQuery = useMemo(() => {
    if (!user) return null;
    if (user.role === 'student') {
        return query(collection(firestore, 'feedback'), where('student_id', '==', user.id));
    }
    return collection(firestore, 'feedback');
  }, [firestore, user]);

  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);
  const { data: faculty, isLoading: facultyLoading } = useCollection<Faculty>(facultyQuery);
  const { data: mappings, isLoading: mappingsLoading } = useCollection<ClassFacultyMapping>(mappingsQuery);
  const { data: feedback, isLoading: feedbackLoading } = useCollection<Feedback>(feedbackQuery);
  const { data: questions, isLoading: questionsLoading } = useCollection<Question>(questionsQuery);
  
  const loading = studentsLoading || facultyLoading || mappingsLoading || feedbackLoading || questionsLoading;

  const addStudent = async (studentData: Omit<Student, 'id' | 'password'>, password: string) => {
    await addDoc(collection(firestore, 'students'), { ...studentData, password });
  };
  const updateStudent = async (id: string, data: Partial<Omit<Student, 'id'>>) => {
    await updateDoc(doc(firestore, 'students', id), data);
  };
  const deleteStudent = async (id: string) => {
    await deleteDoc(doc(firestore, 'students', id));
  };
  const updateStudentPassword = async (id: string, newPass: string) => {
    await updateDoc(doc(firestore, 'students', id), { password: newPass });
  };

  const addFaculty = async (facultyData: Omit<Faculty, 'id' | 'password'>, password: string) => {
    await addDoc(collection(firestore, 'faculty'), { ...facultyData, password });
  };
  const updateFaculty = async (id: string, data: Partial<Omit<Faculty, 'id'>>) => {
    await updateDoc(doc(firestore, 'faculty', id), data);
  };
  const deleteFaculty = async (id: string) => {
    await deleteDoc(doc(firestore, 'faculty', id));
  };
  const updateFacultyPassword = async (id: string, newPass: string) => {
     await updateDoc(doc(firestore, 'faculty', id), { password: newPass });
  };

  const addMapping = async (mappingData: Omit<ClassFacultyMapping, 'id'>) => {
    await addDoc(collection(firestore, 'classFacultyMapping'), mappingData);
  };
  const updateMapping = async (id: string, data: Partial<Omit<ClassFacultyMapping, 'id'>>) => {
    await updateDoc(doc(firestore, 'classFacultyMapping', id), data);
  };
  const deleteMapping = async (id: string) => {
    await deleteDoc(doc(firestore, 'classFacultyMapping', id));
  };

  const addFeedback = async (feedbackData: Omit<Feedback, 'id'>) => {
    if(!user || user.role !== 'student') return;
    const feedbackRef = doc(collection(firestore, 'students', user.id, 'feedback'));
    await addDoc(collection(firestore, 'feedback'), { ...feedbackData, student_id: user.id });
  };

  const addBulk = async <T>(collectionName: string, items: T[]) => {
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


  const value = {
    students: students || [],
    faculty: faculty || [],
    mappings: mappings || [],
    feedback: feedback || [],
    questions: questions || [],
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
