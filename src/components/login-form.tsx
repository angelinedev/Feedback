
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "./auth-provider";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole>("student");

  const handleTabChange = (value: string) => {
    setActiveTab(value as UserRole);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      // The role is taken from the activeTab state
      const success = await login(activeTab, email, password);
      if (!success) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid credentials. Please check your email and password.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = (role: UserRole) => {
    return (
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${role}-email`}>Email</Label>
          <Input id={`${role}-email`} name="email" type="email" placeholder="Enter your email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${role}-password`}>Password</Label>
          <Input id={`${role}-password`} name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full transition-all duration-300 ease-in-out shadow-lg hover:shadow-primary/40" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
        </Button>
      </form>
    );
  };

  return (
    <Card className="w-full shadow-2xl bg-card/80 backdrop-blur-sm border-white/10">
      <CardHeader>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          <CardTitle className="pt-6 text-2xl">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Login
          </CardTitle>
          <CardDescription>
            Please enter your credentials to proceed.
          </CardDescription>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="student" forceMount={true} hidden={activeTab !== 'student'}>
            {renderFormFields("student")}
          </TabsContent>
          <TabsContent value="faculty" forceMount={true} hidden={activeTab !== 'faculty'}>
            {renderFormFields("faculty")}
          </TabsContent>
          <TabsContent value="admin" forceMount={true} hidden={activeTab !== 'admin'}>
            {renderFormFields("admin")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
