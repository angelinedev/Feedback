'use client';

import { firebaseConfig, isFirebaseConfigValid } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  // Throw an error if the config is not valid to prevent Firebase errors.
  if (!isFirebaseConfigValid()) {
    console.error("Firebase config is not valid. Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_ variables are set.");
    throw new Error("Firebase configuration is missing or invalid. Please check your environment variables.");
  }

  // Initialize with the config object. This is the most reliable way.
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