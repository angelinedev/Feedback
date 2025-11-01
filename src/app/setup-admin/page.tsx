
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase } from "@/firebase/provider";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, writeBatch, getDoc } from "firebase/firestore";

const setupSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SetupAdminPage() {
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof setupSchema>>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof setupSchema>) => {
    setLoading(true);
    const adminEmail = "admin@feedloop.com";

    try {
      if (!auth || !firestore) {
        throw new Error("Firebase not initialized");
      }
      
      // Attempt to create the user. This will fail if the user already exists, which is fine.
      try {
        await createUserWithEmailAndPassword(auth, adminEmail, values.password);
      } catch (authError: any) {
        if (authError.code !== 'auth/email-already-in-use') {
          // If it's an error other than "already exists", throw it.
          throw authError;
        }
        // If user exists, we'll just ensure their roles are set correctly.
        // We might need to sign them in temporarily to get their UID if we don't have it.
        // For this setup, we assume if it fails, we can't proceed with password changes, but we can still set firestore rules.
      }
      
      // Temporarily sign in as the admin to get the UID, then sign out.
      const tempUserCredential = await createUserWithEmailAndPassword(auth, `temp-setup-${Date.now()}@test.com`, 'password123');
      const tempUser = tempUserCredential.user;
      await signOut(auth); // Sign out the temporary user
      
      // Now sign in the actual admin to get their real UID.
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, values.password);
      const uid = userCredential.user.uid;

      // Use the UID to create the necessary Firestore documents.
      const batch = writeBatch(firestore);
      
      const userRoleRef = doc(firestore, "users", uid);
      batch.set(userRoleRef, { role: "admin", name: "Admin" });
      
      const adminDetailsRef = doc(firestore, "admin", uid);
      batch.set(adminDetailsRef, { name: "Admin", id: uid, email: adminEmail });

      await batch.commit();
      
      // Sign out the newly created admin user so the user can log in normally.
      await signOut(auth);

      toast({
        title: "Admin Account Created!",
        description: "You can now log in using the home page.",
      });
      setSuccess(true);

    } catch (error: any) {
      console.error(error);
      const description = error.code === 'auth/email-already-in-use'
        ? 'Admin account already seems to exist. If you forgot the password, you may need to reset it in the Firebase Console.'
        : error.message || "An unexpected error occurred.";
      
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description,
      });

    } finally {
      // Ensure we're fully signed out at the end of the process
      if (auth?.currentUser) {
        await signOut(auth);
      }
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px] shadow-2xl">
        <CardHeader>
          <CardTitle>Admin Account Setup</CardTitle>
          <CardDescription>
            This is a one-time setup to create your admin user in the database. Use this page if the admin account does not exist or you need to reset its records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
             <div className="text-center">
                <p className="text-green-400 font-bold mb-4">Setup Complete!</p>
                <p className="text-muted-foreground">You can now proceed to the login page and use the credentials you just created.</p>
                <Button onClick={() => window.location.href = '/'} className="mt-4 w-full">
                    Go to Login
                </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <p className="text-sm font-medium">Admin Email</p>
                    <p className="text-muted-foreground rounded-md border px-3 py-2 bg-muted/50">{`admin@feedloop.com`}</p>
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Set Admin Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Admin Account
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
