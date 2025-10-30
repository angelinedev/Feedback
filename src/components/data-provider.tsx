
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Student, Faculty, ClassFacultyMapping, Feedback, Question } from '@/lib/types';
import {
  mockStudents,
  mockFaculty,
  mockClassFacultyMapping,
  mockFeedback,
  mockQuestions,
} from '@/lib/mock-data';

interface DataContextType {
  students: Student[];
  faculty: Faculty[];
  mappings: ClassFacultyMapping[];
  feedback: Feedback[];
  questions: Question[];
  loading: boolean;
  addStudent: (student: Omit<Student, 'id' | 'password'>, password: string) => void;
  updateStudent: (id: string, data: Partial<Omit<Student, 'id'>>) => void;
  deleteStudent: (id: string) => void;
  updateStudentPassword: (id: string, newPass: string) => void;
  addFaculty: (faculty: Omit<Faculty, 'id' | 'password'>, password: string) => void;
  updateFaculty: (id: string, data: Partial<Omit<Faculty, 'id'>>) => void;
  deleteFaculty: (id: string) => void;
  updateFacultyPassword: (id: string, newPass: string) => void;
  addMapping: (mapping: Omit<ClassFacultyMapping, 'id'>) => void;
  updateMapping: (id: string, data: Partial<Omit<ClassFacultyMapping, 'id'>>) => void;
  deleteMapping: (id: string) => void;
  addFeedback: (feedback: Feedback) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [faculty, setFaculty] = useState<Faculty[]>(mockFaculty);
  const [mappings, setMappings] = useState<ClassFacultyMapping[]>(mockClassFacultyMapping);
  const [feedback, setFeedback] = useState<Feedback[]>(mockFeedback);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const loading = false; // No async loading with mock data

  const addStudent = (studentData: Omit<Student, 'id' | 'password'>, password: string) => {
    const newStudent: Student = { ...studentData, id: `student-${Date.now()}`, password };
    setStudents(prev => [...prev, newStudent]);
  };
  const updateStudent = (id: string, data: Partial<Omit<Student, 'id'>>) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
  };
  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };
   const updateStudentPassword = (id: string, newPass: string) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, password: newPass } : s)));
  };


  const addFaculty = (facultyData: Omit<Faculty, 'id' | 'password'>, password: string) => {
    const newFaculty: Faculty = { ...facultyData, id: `faculty-${Date.now()}`, password };
    setFaculty(prev => [...prev, newFaculty]);
  };
  const updateFaculty = (id: string, data: Partial<Omit<Faculty, 'id'>>) => {
    setFaculty(prev => prev.map(f => (f.id === id ? { ...f, ...data } : f)));
  };
  const deleteFaculty = (id: string) => {
    setFaculty(prev => prev.filter(f => f.id !== id));
  };
  const updateFacultyPassword = (id: string, newPass: string) => {
    setFaculty(prev => prev.map(f => (f.id === id ? { ...f, password: newPass } : f)));
  };

  const addMapping = (mappingData: Omit<ClassFacultyMapping, 'id'>) => {
    const newMapping: ClassFacultyMapping = { ...mappingData, id: `map-${Date.now()}` };
    setMappings(prev => [...prev, newMapping]);
  };
  const updateMapping = (id: string, data: Partial<Omit<ClassFacultyMapping, 'id'>>) => {
    setMappings(prev => prev.map(m => (m.id === id ? { ...m, ...data } : m)));
  };
  const deleteMapping = (id: string) => {
    setMappings(prev => prev.filter(m => m.id !== id));
  };

  const addFeedback = (newFeedback: Feedback) => {
    setFeedback(prev => [...prev, newFeedback]);
  };


  const value = {
    students,
    faculty,
    mappings,
    feedback,
    questions,
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

    