
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';


// This configuration uses environment variables for security and flexibility.
const firebaseConfig = {
  apiKey: "AIzaSyDJA3ib0qyCJSAOQFzG2mhc__HAAcMPicI",
  authDomain: "studio-2001864493-753fe.firebaseapp.com",
  projectId: "studio-2001864493-753fe",
  storageBucket: "studio-2001864493-753fe.appspot.com",
  messagingSenderId: "769242473645",
  appId: "1:769242473645:web:a0dfb9c83ff0dfe2b19224"
};

function initializeFirebase(): { firebaseApp: FirebaseApp, auth: Auth, firestore: Firestore } | { firebaseApp: null, auth: null, firestore: null } {
  const allConfigAvailable = Object.values(firebaseConfig).every(Boolean);

  if (!allConfigAvailable) {
      console.error("Firebase config is missing or incomplete. Please ensure all NEXT_PUBLIC_FIREBASE_ variables are set in your .env file.");
      // Return null services to prevent app crash, the UI will show an error message.
      return { firebaseApp: null, auth: null, firestore: null };
  }

  let app: FirebaseApp;
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app)
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
                    If you are running this locally, please ensure your <code className="bg-muted px-1 py-0.5 rounded-sm">.env</code> file is correctly filled out with your Firebase project credentials. Remember to restart your server after editing the file.
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
