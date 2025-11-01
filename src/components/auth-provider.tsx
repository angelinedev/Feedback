'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  writeBatch,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import type {
  Student,
  Faculty,
  Feedback,
  ClassFacultyMapping,
  Question,
} from '@/lib/types';
import { mockQuestions } from '@/lib/mock-data';

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
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  addStudent: (
    student: Omit<Student, 'id' | 'password'>,
    password: string
  ) => Promise<void>;
  updateStudent: (id: string, data: Partial<Omit<Student, 'id'>>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addFaculty: (
    faculty: Omit<Faculty, 'id' | 'password'>,
    password: string
  ) => Promise<void>;
  updateFaculty: (id: string, data: Partial<Omit<Faculty, 'id'>>) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;
  addMapping: (mapping: Omit<ClassFacultyMapping, 'id'>) => Promise<void>;
  updateMapping: (
    id: string,
    data: Partial<Omit<ClassFacultyMapping, 'id'>>
  ) => Promise<void>;
  deleteMapping: (id: string) => Promise<void>;
  addFeedback: (feedback: Omit<Feedback, 'id'>) => Promise<void>;
  addBulkStudents: (students: Omit<Student, 'id'>[]) => Promise<void>;
  addBulkFaculty: (faculty: Omit<Faculty, 'id'>[]) => Promise<void>;
  addBulkMappings: (
    mappings: Omit<ClassFacultyMapping, 'id'>[]
  ) => Promise<void>;
  students: Student[];
  faculty: Faculty[];
  mappings: ClassFacultyMapping[];
  feedback: Feedback[];
  questions: Question[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [mappings, setMappings] = useState<ClassFacultyMapping[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!firestore) return;
    const unsubStudents = onSnapshot(collection(firestore, 'students'), (snap) =>
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student)))
    );
    const unsubFaculty = onSnapshot(collection(firestore, 'faculty'), (snap) =>
      setFaculty(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Faculty)))
    );
    const unsubMappings = onSnapshot(
      collection(firestore, 'classFacultyMapping'),
      (snap) =>
        setMappings(
          snap.docs.map(
            (d) => ({ id: d.id, ...d.data() } as ClassFacultyMapping)
          )
        )
    );
    const unsubFeedbacks = onSnapshot(
      collection(firestore, 'feedback'),
      (snap) =>
        setFeedbacks(
          snap.docs.map((d) => ({ id: d.id, ...d.data(), submitted_at: d.data().submitted_at.toDate() } as Feedback))
        )
    );
    const unsubQuestions = onSnapshot(
      collection(firestore, 'questions'),
      (snap) =>
        setQuestions(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question))
        )
    );

    return () => {
      unsubStudents();
      unsubFaculty();
      unsubMappings();
      unsubFeedbacks();
      unsubQuestions();
    };
  }, [firestore]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role as UserRole;
          let details: any;

          if (role === 'admin') {
            details = { id: 'admin', name: 'Admin' };
          } else if (role === 'student') {
            const studentDoc = await getDoc(
              doc(firestore, 'students', firebaseUser.uid)
            );
            details = { id: studentDoc.id, ...studentDoc.data() };
          } else if (role === 'faculty') {
            const facultyDoc = await getDoc(
              doc(firestore, 'faculty', firebaseUser.uid)
            );
            details = { id: facultyDoc.id, ...facultyDoc.data() };
          }

          setUser({
            id: firebaseUser.uid,
            name: details.name,
            role,
            details,
          });
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth, firestore]);

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

  const login = async (
    role: UserRole,
    id: string,
    pass: string
  ): Promise<boolean> => {
    try {
      const email =
        role === 'admin'
          ? 'admin@feedloop.com'
          : role === 'student'
          ? `${id}@student.jce.com`
          : `${id}@faculty.jce.com`;
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      return !!userCredential.user;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    router.push('/');
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) throw new Error('Not authenticated');

    await signInWithEmailAndPassword(
      auth,
      firebaseUser.email,
      currentPassword
    );
    await updatePassword(firebaseUser, newPassword);
  };
  
    const addStudent = async (studentData: Omit<Student, 'id' | 'password'>, password: string) => {
        const email = `${studentData.register_number}@student.jce.com`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        const batch = writeBatch(firestore);
        batch.set(doc(firestore, "students", uid), { ...studentData, id: uid });
        batch.set(doc(firestore, "users", uid), { role: "student" });
        
        await batch.commit();
    };

    const updateStudent = async (id: string, data: Partial<Omit<Student, 'id'>>) => {
        await setDoc(doc(firestore, "students", id), data, { merge: true });
    };

    const deleteStudent = async (id: string) => {
        // This is complex due to auth. For now, we just delete the doc.
        await deleteDoc(doc(firestore, "students", id));
        await deleteDoc(doc(firestore, "users", id));
    };

    const addFaculty = async (facultyData: Omit<Faculty, 'id' | 'password'>, password: string) => {
        const email = `${facultyData.faculty_id}@faculty.jce.com`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        const batch = writeBatch(firestore);
        batch.set(doc(firestore, "faculty", uid), { ...facultyData, id: uid });
        batch.set(doc(firestore, "users", uid), { role: "faculty" });

        await batch.commit();
    };

    const updateFaculty = async (id: string, data: Partial<Omit<Faculty, 'id'>>) => {
        await setDoc(doc(firestore, "faculty", id), data, { merge: true });
    };
    
    const deleteFaculty = async (id: string) => {
        await deleteDoc(doc(firestore, "faculty", id));
        await deleteDoc(doc(firestore, "users", id));
    };

    const addMapping = async (mappingData: Omit<ClassFacultyMapping, 'id'>) => {
        const newMappingRef = doc(collection(firestore, "classFacultyMapping"));
        await setDoc(newMappingRef, { ...mappingData, id: newMappingRef.id });
    };

    const updateMapping = async (id: string, data: Partial<Omit<ClassFacultyMapping, 'id'>>) => {
        await setDoc(doc(firestore, "classFacultyMapping", id), data, { merge: true });
    };

    const deleteMapping = async (id: string) => {
        await deleteDoc(doc(firestore, "classFacultyMapping", id));
    };

    const addFeedback = async (feedbackData: Omit<Feedback, 'id'>) => {
        const newFeedbackRef = doc(collection(firestore, "feedback"));
        await setDoc(newFeedbackRef, { ...feedbackData, id: newFeedbackRef.id, submitted_at: new Date() });
    };

    const addBulkStudents = async (newStudents: Omit<Student, 'id'>[]) => {
      const batch = writeBatch(firestore);
      for(const s of newStudents) {
         if(!s.password) continue;
         const email = `${s.register_number}@student.jce.com`;
         // This is not ideal as createUserWithEmailAndPassword cannot be batched
         // In a real app, this should be a backend function.
         // For now, we will create users one by one. This will be slow.
         try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, s.password);
            const uid = userCredential.user.uid;
            batch.set(doc(firestore, "students", uid), { ...s, id: uid, password: ''});
            batch.set(doc(firestore, "users", uid), { role: "student" });
         } catch (e) {
             console.error(`Skipping student ${s.register_number}, likely already exists.`, e)
         }
      }
      await batch.commit();
    };
  
    const addBulkFaculty = async (newFaculty: Omit<Faculty, 'id'>[]) => {
      const batch = writeBatch(firestore);
      for(const f of newFaculty) {
        if(!f.password) continue;
        const email = `${f.faculty_id}@faculty.jce.com`;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, f.password);
            const uid = userCredential.user.uid;
            batch.set(doc(firestore, "faculty", uid), { ...f, id: uid, password: '' });
            batch.set(doc(firestore, "users", uid), { role: "faculty" });
        } catch (e) {
             console.error(`Skipping faculty ${f.faculty_id}, likely already exists.`, e)
        }
      }
      await batch.commit();
    };

    const addBulkMappings = async (newMappings: Omit<ClassFacultyMapping, 'id'>[]) => {
        const batch = writeBatch(firestore);
        newMappings.forEach(m => {
            const newMappingRef = doc(collection(firestore, "classFacultyMapping"));
            batch.set(newMappingRef, {...m, id: newMappingRef.id });
        });
        await batch.commit();
    };

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
    addBulkStudents,
    addBulkFaculty,
    addBulkMappings,
    students,
    faculty,
    mappings,
    feedback: feedbacks,
    questions,
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
