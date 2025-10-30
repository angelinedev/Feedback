"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useFirebase, useUser } from '@/firebase';
import type { Student, Faculty } from '@/lib/types';
import { useData } from './data-provider';
import { doc, getDoc } from 'firebase/firestore';


export type UserRole = 'admin' | 'student' | 'faculty';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  details: Student | Faculty | { id: 'admin'; name: 'Admin' };
  firebaseUser: FirebaseUser;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: UserRole, id: string, pass: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function AuthProviderContent({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { students, faculty } = useData();
  const { auth, firestore } = useFirebase();
  const { user: firebaseUser, isUserLoading } = useUser();

  useEffect(() => {
    const loadUser = async () => {
      if (isUserLoading) return;
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
  
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('feedloop-user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if(parsedUser.id === firebaseUser.uid) {
              setUser({...parsedUser, firebaseUser});
              setLoading(false);
              return;
            }
        }

        // If localStorage is out of sync or empty, fetch user role
        let userRole: UserRole | null = null;
        let userDetails: any = null;

        const adminDoc = await getDoc(doc(firestore, "roles_admin", firebaseUser.uid));
        if (adminDoc.exists()) {
          userRole = 'admin';
          userDetails = { id: 'admin', name: 'Admin' };
        } else {
            const studentDoc = await getDoc(doc(firestore, "students", firebaseUser.uid));
            if (studentDoc.exists()) {
                userRole = 'student';
                userDetails = studentDoc.data() as Student;
            } else {
                const facultyDoc = await getDoc(doc(firestore, "faculty", firebaseUser.uid));
                if (facultyDoc.exists()) {
                    userRole = 'faculty';
                    userDetails = facultyDoc.data() as Faculty;
                }
            }
        }
        
        if (userRole && userDetails) {
            const appUser: User = { 
                id: firebaseUser.uid,
                name: userDetails.name, 
                role: userRole, 
                details: userDetails, 
                firebaseUser 
            };
            setUser(appUser);
            localStorage.setItem('feedloop-user', JSON.stringify(appUser));
        } else {
            // User exists in Auth but not in our collections
            await auth.signOut();
            setUser(null);
            localStorage.removeItem('feedloop-user');
        }

      } catch (error) {
        console.error("Failed to load user data", error);
        setUser(null);
        localStorage.removeItem('feedloop-user');
      } finally {
        setLoading(false);
      }
    };
    loadUser();

  }, [firebaseUser, isUserLoading, firestore, auth]);

  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/'];
    const pathIsPublic = publicPaths.includes(pathname);

    if (!user && !pathIsPublic) {
      router.push('/');
    } else if (user && pathIsPublic) {
      router.push(`/${user.role}/dashboard`);
    }

  }, [user, loading, pathname, router]);


  const login = async (role: UserRole, id: string, pass: string): Promise<boolean> => {
     let email = '';
    if (role === 'admin') {
      email = 'admin@feedloop.com';
      if (id !== 'admin' || pass !== 'admin') return false;
    } else if (role === 'student') {
        const student = students.find(s => s.register_number === id);
        if(!student) return false;
        email = `${student.register_number}@feedloop-student.com`;
    } else if (role === 'faculty') {
        const facultyMember = faculty.find(f => f.faculty_id === id);
        if(!facultyMember) return false;
        email = `${facultyMember.faculty_id}@feedloop-faculty.com`;
    }
    
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        return true;
    } catch(error: any) {
        if(error.code === 'auth/user-not-found') {
            // This is a first-time login for a pre-loaded user
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
                // The onAuthStateChanged listener will handle the rest
                return true;
            } catch(createError) {
                console.error("Failed to create user for first-time login:", createError);
                return false;
            }
        }
        console.error("Login failed:", error);
        return false;
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    localStorage.removeItem('feedloop-user');
    router.push('/');
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.firebaseUser.email) throw new Error("Not authenticated or email missing.");

    const credential = EmailAuthProvider.credential(user.firebaseUser.email, currentPassword);
    
    try {
        await reauthenticateWithCredential(user.firebaseUser, credential);
        await updatePassword(user.firebaseUser, newPassword);
    } catch (error) {
        console.error("Password change failed:", error);
        throw new Error("Failed to change password. Please check your current password.");
    }
  };

  const value = { user, loading, login, logout, changePassword };

  if(isUserLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProviderContent>{children}</AuthProviderContent>
  );
}
