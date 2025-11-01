
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
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

function initializeFirebase() {
  const allConfigAvailable = Object.values(firebaseConfig).every(Boolean);

  if (!allConfigAvailable) {
      console.error("Firebase config is missing or incomplete in your .env file. Please ensure all NEXT_PUBLIC_FIREBASE_ variables are set.");
      // Return null services to prevent app crash, the UI will show an error message.
      return { firebaseApp: null, auth: null, firestore: null };
  }

  if (getApps().length > 0) {
    const app = getApp();
    return {
        firebaseApp: app,
        auth: getAuth(app),
        firestore: getFirestore(app)
    };
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

  // Handle the case where initialization failed due to missing config
  if (!firebaseServices.firebaseApp || !firebaseServices.auth || !firebaseServices.firestore) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="text-center max-w-md p-6 bg-card rounded-lg shadow-2xl">
                <h1 className="text-2xl font-bold text-destructive mb-4">Configuration Error</h1>
                <p className="text-card-foreground">
                    Firebase configuration is missing or incomplete.
                </p>
                 <p className="text-muted-foreground mt-2 text-sm">
                    If you are running this locally, please ensure your <code className="bg-muted px-1 py-0.5 rounded-sm">.env</code> file is correctly filled out with your Firebase project credentials.
                </p>
            </div>
        </div>
    );
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

    