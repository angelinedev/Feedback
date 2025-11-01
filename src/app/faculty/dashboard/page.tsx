
"use client";

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Faculty, ClassFacultyMapping } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/change-password-dialog';

export default function FacultyDashboard() {
  const { user, mappings } = useAuth();
  
  const faculty = user?.details as Faculty | undefined;

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const assignedSubjects = useMemo(() => {
    if (!faculty?.faculty_id) return [];
    return mappings.filter(mapping => mapping.faculty_id === faculty.faculty_id);
  }, [faculty?.faculty_id, mappings]);


  return (
    <div className="container mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Select a subject to view its detailed feedback report.</p>
        </div>
        <ChangePasswordDialog 
          open={isPasswordDialogOpen} 
          onOpenChange={setIsPasswordDialogOpen}
        >
          <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
            <KeyRound className="mr-2" /> Change Password
          </Button>
        </ChangePasswordDialog>
      </div>

       <Card className="mb-8 shadow-2xl">
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your feedback reports are being generated. Please check back later.
            </p>
          </CardContent>
        </Card>
    </div>
  );
}
