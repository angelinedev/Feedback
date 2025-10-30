"use client";

import React, { createContext, useState, ReactNode, useContext } from 'react';
import type { Student, Faculty, ClassFacultyMapping } from '@/lib/types';

interface DataContextType {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  faculty: Faculty[];
  setFaculty: React.Dispatch<React.SetStateAction<Faculty[]>>;
  mappings: ClassFacultyMapping[];
  setMappings: React.Dispatch<React.SetStateAction<ClassFacultyMapping[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [mappings, setMappings] = useState<ClassFacultyMapping[]>([]);

  const value = {
    students,
    setStudents,
    faculty,
    setFaculty,
    mappings,
    setMappings,
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
