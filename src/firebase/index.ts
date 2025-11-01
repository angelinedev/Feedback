
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// This configuration uses environment variables for security and flexibility,
// especially for production deployments on platforms like Vercel.
// It's set up to work both in a deployed environment and locally.

// For local development, create a `.env.local` file in the root of your project
// and copy the values from your Firebase project settings into it.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};


// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  // Check if all required config values are present. This is the key to fixing the error.
  const allConfigAvailable = 
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId;

  if (!allConfigAvailable) {
      const errorMessage = "Firebase config is missing or incomplete. Ensure you have a .env file with all NEXT_PUBLIC_FIREBASE_ variables set for local development, and that they are set in your hosting provider's environment variables for production.";
      console.error(errorMessage);
       // We'll return a dummy object here to prevent crashing, but Firebase will not work.
      return { firebaseApp: null, auth: null, firestore: null };
  }
  
  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
