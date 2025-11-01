
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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, writeBatch } from "firebase/firestore";

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
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: z.infer<typeof setupSchema>) => {
    setLoading(true);
    const adminEmail = "admin@feedloop.com";

    if (!auth || !firestore) {
      toast({ variant: "destructive", title: "Setup Failed", description: "Firebase not initialized." });
      setLoading(false);
      return;
    }

    try {
      // 1. Create the user in Firebase Auth.
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, values.password);
      const uid = userCredential.user.uid;

      // 2. Create the role and admin documents in Firestore in a batch.
      const batch = writeBatch(firestore);
      
      const adminDocRef = doc(firestore, "admin", uid);
      batch.set(adminDocRef, { name: "Admin", id: uid, email: adminEmail });

      const userRoleDocRef = doc(firestore, "users", uid);
      batch.set(userRoleDocRef, { role: 'admin', name: 'Admin' });

      await batch.commit();
      
      toast({
        title: "Admin Account Setup Complete!",
        description: "You can now log in using the home page.",
      });
      setSuccess(true);

    } catch (error: any) {
      console.error(error);
      const description = error.code === 'auth/email-already-in-use' 
        ? 'Admin user already exists. If you forgot the password, you must reset it from the Firebase Console.'
        : error.message || "An unexpected error occurred.";
      
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description,
      });

    } finally {
      // Always sign out any session that might have been created during the process
      if (auth.currentUser) {
        await auth.signOut();
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
            Create your master admin account. This is a one-time operation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
             <div className="text-center">
                <p className="text-green-400 font-bold mb-4">Setup Complete!</p>
                <p className="text-muted-foreground">You can now go to the login page and use the ID `admin` and the password you just set.</p>
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
