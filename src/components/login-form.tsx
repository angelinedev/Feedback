
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
import { useAuth } from "@/hooks/use-auth";
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
    const id = formData.get("id") as string;
    const password = formData.get("password") as string;
    
    try {
      const success = await login(activeTab, id, password);
      if (!success) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
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
    let idLabel = "ID";
    let idPlaceholder = "Enter your ID";
    let idType = "text";
    let idValue = "";
    
    if (role === "admin") {
      idLabel = "Admin ID"
      idPlaceholder = "admin"
      idValue="admin"
    } else if (role === "student") {
      idLabel = "Register Number";
      idPlaceholder = "16-digit register number";
    } else if (role === "faculty") {
      idLabel = "Faculty ID";
      idPlaceholder = "3-4 digit faculty ID";
    }

    return (
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${role}-id`}>{idLabel}</Label>
          <Input id={`${role}-id`} name="id" type={idType} placeholder={idPlaceholder} required defaultValue={idValue} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${role}-password`}>Password</Label>
          <Input id={`${role}-password`} name="password" type="password" required defaultValue={role === 'admin' ? 'admin' : ''} />
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
