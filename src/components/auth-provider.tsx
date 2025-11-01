
"use client";

import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Student, Faculty, ClassFacultyMapping, Feedback, Question } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, where, getDocs, query, DocumentData } from 'firebase/firestore';

export type UserRole = 'admin' | 'student' | 'faculty';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  details: Student | Faculty | { id: 'admin'; name: 'Admin' };
}

interface AuthContextType {
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
  user: User | null;
  authLoading: boolean;
  login: (role: UserRole, id: string, pass: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Auth logic
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
        throw new Error("Admin password cannot be changed in this version.");
    }
    
    if(!success) {
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


  // Queries
  const studentsQuery = useMemo(() => {
    if (!firestore || user?.role !== 'admin') return null;
    return collection(firestore, 'students');
  }, [firestore, user]);

  const facultyQuery = useMemo(() => {
    if (!firestore || user?.role !== 'admin') return null;
    return collection(firestore, 'faculty');
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
  
  const [allFaculty, setAllFaculty] = useState<Faculty[]>([]);
  
  useEffect(() => {
    async function fetchAllFaculty() {
        if (!user || !firestore) return;
        
        if (user.role === 'student' || user.role === 'faculty') {
            const facQuery = collection(firestore, 'faculty');
            try {
                const snapshot = await getDocs(facQuery);
                const facultyList = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Faculty));
                setAllFaculty(facultyList);
            } catch(e) {
                // This might fail if rules don't allow general listing, which is fine for students/faculty.
                // We'll rely on admin-loaded data if direct fetching fails.
                console.warn("Could not fetch all faculty directly. This is expected for non-admin users.");
            }
        } else if (user.role === 'admin') {
            setAllFaculty(facultyData || []);
        }
    }
    fetchAllFaculty();
  }, [firestore, user, facultyData]);
  

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


  const value: AuthContextType = {
    students: studentsData || [],
    faculty: user?.role === 'admin' ? (facultyData || []) : allFaculty,
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
    user,
    authLoading,
    login,
    logout,
    changePassword,
  };

  if(authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
