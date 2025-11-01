
// This configuration uses environment variables for security and flexibility,
// especially for production deployments on platforms like Vercel.
// It's set up to work both in a deployed environment and locally.

// For local development, create a `.env.local` file in the root of your project
// and copy the values from your Firebase project settings into it.
// Example `.env.local` file:
// NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
// ...and so on.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

