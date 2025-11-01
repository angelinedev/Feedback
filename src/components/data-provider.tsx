
"use client";

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import type { Student, Faculty, ClassFacultyMapping, Feedback, Question } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, where, getDocs, query, DocumentData } from 'firebase/firestore';


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
  loginStudent: (regNo: string, pass: string) => Promise<Student | null>;
  loginFaculty: (facultyId: string, pass: string) => Promise<Faculty | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();

  const studentsQuery = useMemo(() => firestore ? collection(firestore, 'students') : null, [firestore]);
  const facultyQuery = useMemo(() => firestore ? collection(firestore, 'faculty') : null, [firestore]);
  const mappingsQuery = useMemo(() => firestore ? collection(firestore, 'classFacultyMapping') : null, [firestore]);
  const questionsQuery = useMemo(() => firestore ? collection(firestore, 'questions') : null, [firestore]);
  const feedbackQuery = useMemo(() => firestore ? collection(firestore, 'feedback') : null, [firestore]);
  
  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);
  const { data: faculty, isLoading: facultyLoading } = useCollection<Faculty>(facultyQuery);
  const { data: mappings, isLoading: mappingsLoading } = useCollection<ClassFacultyMapping>(mappingsQuery);
  const { data: feedback, isLoading: feedbackLoading } = useCollection<Feedback>(feedbackQuery);
  const { data: questions, isLoading: questionsLoading } = useCollection<Question>(questionsQuery);
  
  const loading = studentsLoading || facultyLoading || mappingsLoading || feedbackLoading || questionsLoading;

  const findUserInFirestore = async (collectionName: string, idField: string, id: string, pass: string) => {
    if(!firestore) return null;
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

  const loginStudent = async (regNo: string, pass: string): Promise<Student | null> => {
    return findUserInFirestore('students', 'register_number', regNo, pass) as Promise<Student | null>;
  };

  const loginFaculty = async (facultyId: string, pass: string): Promise<Faculty | null> => {
    return findUserInFirestore('faculty', 'faculty_id', facultyId, pass) as Promise<Faculty | null>;
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
    const feedbackRef = collection(firestore, 'students', studentId, 'feedback');
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
    loginStudent,
    loginFaculty,
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
