'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import type { FirebaseOptions } from 'firebase/app';

interface FirebaseClientProviderProps {
  children: ReactNode;
  firebaseConfig: FirebaseOptions;
}

export function FirebaseClientProvider({ children, firebaseConfig }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount,
    // using the config passed down from the server component layout.
    return initializeFirebase(firebaseConfig);
  }, [firebaseConfig]); // Dependency array ensures this only re-runs if config changes.

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
