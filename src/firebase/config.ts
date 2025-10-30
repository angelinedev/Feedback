// This file is intentionally left simple.
// The configuration is now built and passed directly in FirebaseClientProvider
// to ensure environment variables are correctly loaded on the client.

import type { FirebaseOptions } from 'firebase/app';

export const firebaseConfig: FirebaseOptions = {};

// A function to check if the config is valid
export const isFirebaseConfigValid = (config: FirebaseOptions) => {
  return !!(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.appId
  );
};
