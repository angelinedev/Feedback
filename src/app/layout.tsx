import type {Metadata} from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/components/auth-provider';
import { DataProvider } from '@/components/data-provider';
import { FirebaseClientProvider } from '@/firebase';
import type { FirebaseOptions } from 'firebase/app';

export const metadata: Metadata = {
  title: 'FeedLoop v2',
  description: 'A comprehensive feedback system for educational institutions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read environment variables on the server and pass them to the client provider.
  const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased min-h-screen bg-background font-sans")}>
        <FirebaseClientProvider firebaseConfig={firebaseConfig}>
          <DataProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </DataProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
