
"use client";

import React, { createContext, ReactNode, useContext } from 'react';
import type { Student, Faculty, ClassFacultyMapping, Feedback, Question } from '@/lib/types';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { mockQuestions } from '@/lib/mock-data';

interface DataContextType {
  students: Student[];
  faculty: Faculty[];
  mappings: ClassFacultyMapping[];
  feedback: Feedback[];
  questions: Question[];
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { firestore } = useFirebase();

  const studentsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'students')) : null),
    [firestore]
  );
  const { data: studentsData, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);

  const facultyQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'faculty')) : null),
    [firestore]
  );
  const { data: facultyData, isLoading: facultyLoading } = useCollection<Faculty>(facultyQuery);

  const mappingsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'classFacultyMapping')) : null),
    [firestore]
  );
  const { data: mappingsData, isLoading: mappingsLoading } = useCollection<ClassFacultyMapping>(mappingsQuery);
  
  const feedbackQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'feedback')) : null),
    [firestore]
  );
  const { data: feedbackData, isLoading: feedbackLoading } = useCollection<Feedback>(feedbackQuery);

  const loading = studentsLoading || facultyLoading || mappingsLoading || feedbackLoading;

  const value = {
    students: studentsData || [],
    faculty: facultyData || [],
    mappings: mappingsData || [],
    feedback: feedbackData || [],
    questions: mockQuestions, // Questions are static for now
    loading: loading,
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
