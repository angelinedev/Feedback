
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
  addDoc,
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
  details: Student | Faculty | { id: string; name: string };
}

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  login: (role: UserRole, email: string, pass: string) => Promise<boolean>;
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

    const unsubQuestions = onSnapshot(
      collection(firestore, 'questions'),
      (snap) => {
        if (snap.empty) {
          const batch = writeBatch(firestore);
          mockQuestions.forEach(q => {
            const qRef = doc(firestore, "questions", q.id);
            batch.set(qRef, q);
          });
          batch.commit();
        } else {
          setQuestions(
            snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question))
          );
        }
      }
    );

    return () => unsubQuestions();
  }, [firestore]);


  useEffect(() => {
    if (!firestore || !user) {
        setStudents([]);
        setFaculty([]);
        setMappings([]);
        setFeedbacks([]);
        return;
    };

    if (user.role === 'admin') {
      const unsubStudents = onSnapshot(collection(firestore, 'students'), (snap) =>
        setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student)))
      );
      const unsubFaculty = onSnapshot(collection(firestore, 'faculty'), (snap) =>
        setFaculty(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Faculty)))
      );
      const unsubMappings = onSnapshot(collection(firestore, 'classFacultyMapping'), (snap) =>
        setMappings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassFacultyMapping)))
      );
      const unsubFeedbacks = onSnapshot(collection(firestore, 'feedback'), (snap) =>
        setFeedbacks(snap.docs.map((d) => ({ id: d.id, ...d.data(), submitted_at: d.data().submitted_at?.toDate() } as Feedback)))
      );
      return () => { unsubStudents(); unsubFaculty(); unsubMappings(); unsubFeedbacks(); };
    } else if (user.role === 'student' || user.role === 'faculty') {
       const unsubFaculty = onSnapshot(collection(firestore, 'faculty'), (snap) =>
        setFaculty(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Faculty)))
      );
      const unsubMappings = onSnapshot(collection(firestore, 'classFacultyMapping'), (snap) =>
        setMappings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassFacultyMapping)))
      );
      const unsubFeedbacks = onSnapshot(collection(firestore, 'feedback'), (snap) =>
        setFeedbacks(snap.docs.map((d) => ({ id: d.id, ...d.data(), submitted_at: d.data().submitted_at?.toDate() } as Feedback)))
      );
      return () => { unsubFaculty(); unsubMappings(); unsubFeedbacks(); };
    }


  }, [firestore, user]);

  useEffect(() => {
    if(!auth || !firestore) {
        setAuthLoading(false);
        return;
    };
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role as UserRole;
            let details: any;
            let name: string = userData.name || "User";

            if (role === 'admin') {
                const adminDoc = await getDoc(doc(firestore, 'admin', firebaseUser.uid));
                if (adminDoc.exists()) {
                    details = { id: adminDoc.id, ...adminDoc.data() };
                    name = details.name;
                }
            } else if (role === 'student') {
                const studentDoc = await getDoc(doc(firestore, 'students', firebaseUser.uid));
                 if (studentDoc.exists()) {
                    details = { id: studentDoc.id, ...studentDoc.data() };
                    name = details.name;
                }
            } else if (role === 'faculty') {
                const facultyDoc = await getDoc(doc(firestore, 'faculty', firebaseUser.uid));
                if (facultyDoc.exists()) {
                    details = { id: facultyDoc.id, ...facultyDoc.data() };
                    name = details.name;
                }
            }
            if (details) {
                setUser({ id: firebaseUser.uid, name, role, details });
            } else {
                 setUser(null); // Document for role does not exist
            }
        } else {
             setUser(null);
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

    const publicPaths = ['/', '/setup-admin'];
    const pathIsPublic = publicPaths.includes(pathname);

    if (!user && !pathIsPublic) {
      router.push('/');
    } else if (user && (pathIsPublic || pathname.startsWith('/setup-admin'))) { 
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, authLoading, pathname, router]);

  const login = async (
    role: UserRole,
    email: string,
    pass: string
  ): Promise<boolean> => {
    try {
      if (!auth) throw new Error("Auth not initialized");
      
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      
      if(userCredential.user) {
         if (!firestore) throw new Error("Firestore not initialized");
         const userDoc = await getDoc(doc(firestore, 'users', userCredential.user.uid));
         if(userDoc.exists() && userDoc.data().role === role) {
             return true;
         } else {
             await auth.signOut(); // Role doesn't match, sign out immediately.
             return false;
         }
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    if (!auth) return;
    await auth.signOut();
    setUser(null);
    router.push('/');
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!auth) throw new Error("Auth not initialized");
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
        if (!auth || !firestore) throw new Error("Firebase not initialized");
        const userCredential = await createUserWithEmailAndPassword(auth, studentData.email, password);
        const uid = userCredential.user.uid;
        
        const batch = writeBatch(firestore);
        batch.set(doc(firestore, "students", uid), { ...studentData, id: uid });
        batch.set(doc(firestore, "users", uid), { role: "student", name: studentData.name });
        
        await batch.commit();
        await auth.signOut(); // Sign out to not keep the new user logged in
    };

    const updateStudent = async (id: string, data: Partial<Omit<Student, 'id'>>) => {
        if (!firestore) throw new Error("Firebase not initialized");
        await setDoc(doc(firestore, "students", id), data, { merge: true });
        if(data.name){
           await setDoc(doc(firestore, "users", id), { name: data.name }, { merge: true });
        }
    };

    const deleteStudent = async (id: string) => {
        if (!firestore) throw new Error("Firebase not initialized");
        // This is complex due to auth. For now, we just delete the doc. A backend function is needed for production.
        await deleteDoc(doc(firestore, "students", id));
        await deleteDoc(doc(firestore, "users", id));
    };

    const addFaculty = async (facultyData: Omit<Faculty, 'id' | 'password'>, password: string) => {
        if (!auth || !firestore) throw new Error("Firebase not initialized");
        const userCredential = await createUserWithEmailAndPassword(auth, facultyData.email, password);
        const uid = userCredential.user.uid;
        
        const batch = writeBatch(firestore);
        batch.set(doc(firestore, "faculty", uid), { ...facultyData, id: uid });
        batch.set(doc(firestore, "users", uid), { role: "faculty", name: facultyData.name });

        await batch.commit();
        await auth.signOut(); // Sign out to not keep the new user logged in
    };

    const updateFaculty = async (id: string, data: Partial<Omit<Faculty, 'id'>>) => {
        if (!firestore) throw new Error("Firebase not initialized");
        await setDoc(doc(firestore, "faculty", id), data, { merge: true });
        if(data.name){
           await setDoc(doc(firestore, "users", id), { name: data.name }, { merge: true });
        }
    };
    
    const deleteFaculty = async (id: string) => {
        if (!firestore) throw new Error("Firebase not initialized");
        await deleteDoc(doc(firestore, "faculty", id));
        await deleteDoc(doc(firestore, "users", id));
    };

    const addMapping = async (mappingData: Omit<ClassFacultyMapping, 'id'>) => {
        if (!firestore) throw new Error("Firebase not initialized");
        const newMappingRef = doc(collection(firestore, "classFacultyMapping"));
        await setDoc(newMappingRef, { ...mappingData, id: newMappingRef.id });
    };

    const updateMapping = async (id: string, data: Partial<Omit<ClassFacultyMapping, 'id'>>) => {
        if (!firestore) throw new Error("Firebase not initialized");
        await setDoc(doc(firestore, "classFacultyMapping", id), data, { merge: true });
    };

    const deleteMapping = async (id: string) => {
        if (!firestore) throw new Error("Firebase not initialized");
        await deleteDoc(doc(firestore, "classFacultyMapping", id));
    };

    const addFeedback = async (feedbackData: Omit<Feedback, 'id'>) => {
        if (!firestore) throw new Error("Firebase not initialized");
        await addDoc(collection(firestore, "feedback"), { ...feedbackData, submitted_at: new Date() });
    };

    const addBulkStudents = async (newStudents: Omit<Student, 'id'>[]) => {
      for(const s of newStudents) {
         if(!s.password || !s.email) continue;
         try {
            await addStudent(s, s.password);
         } catch (e) {
             console.error(`Skipping student ${s.email}, likely already exists.`, e)
         }
      }
    };
  
    const addBulkFaculty = async (newFaculty: Omit<Faculty, 'id'>[]) => {
      for(const f of newFaculty) {
        if(!f.password || !f.email) continue;
        try {
           await addFaculty(f, f.password);
        } catch (e) {
             console.error(`Skipping faculty ${f.email}, likely already exists.`, e)
        }
      }
    };

    const addBulkMappings = async (newMappings: Omit<ClassFacultyMapping, 'id'>[]) => {
        if (!firestore) throw new Error("Firebase not initialized");
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
