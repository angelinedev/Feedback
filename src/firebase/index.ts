
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

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
      if (process.env.NODE_ENV === 'development') {
          console.error("Firebase config is missing or incomplete. Make sure you have a valid .env file for local development.");
      } else {
          console.error("Firebase config is missing or incomplete. Check your hosting provider's environment variables.");
      }
      // Return a dummy object to prevent further errors, though Firebase will not work.
      // A better approach in a real app might be to show an error page.
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

