
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// This configuration uses environment variables for security and flexibility.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

function initializeFirebase() {
  if (getApps().length > 0) {
    const app = getApp();
    return {
        firebaseApp: app,
        auth: getAuth(app),
        firestore: getFirestore(app)
    };
  }
  
  const allConfigAvailable = Object.values(firebaseConfig).every(Boolean);

  if (!allConfigAvailable) {
      console.error("Firebase config is missing or incomplete. Ensure .env.local is configured for local development and environment variables are set for production.");
      // Return null services to prevent app crash, errors will be handled downstream
      return { firebaseApp: null, auth: null, firestore: null };
  }
  
  const firebaseApp = initializeApp(firebaseConfig);
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}


interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []); 

  // Handle the case where initialization failed
  if (!firebaseServices.firebaseApp || !firebaseServices.auth || !firebaseServices.firestore) {
    // You can render a loading state or an error message here
    return <div>Initializing Firebase... If this persists, check your environment variables.</div>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
