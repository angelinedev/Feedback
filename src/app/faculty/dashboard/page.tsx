
"use client";

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Faculty } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/change-password-dialog';
import { SubjectReportCard } from '@/components/subject-report-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FacultyDashboard() {
  const { user, mappings, feedback: allFeedback, faculty: allFaculty } = useAuth();
  
  const faculty = user?.details as Faculty | undefined;
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const assignedSubjects = useMemo(() => {
    if (!faculty?.faculty_id) return [];
    return mappings.filter(mapping => mapping.faculty_id === faculty.faculty_id);
  }, [faculty?.faculty_id, mappings]);

  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>(
    assignedSubjects.length > 0 ? `${assignedSubjects[0].subject}-${assignedSubjects[0].class_name}` : ''
  );

  const selectedMapping = useMemo(() => {
    if (!selectedSubjectKey) return null;
    const [subject, className] = selectedSubjectKey.split('-');
    return assignedSubjects.find(m => m.subject === subject && m.class_name === className) || null;
  }, [selectedSubjectKey, assignedSubjects]);

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

      <div className="grid gap-6">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Feedback Report</CardTitle>
            <CardDescription>Select one of your assigned subjects to see the detailed report.</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedSubjects.length > 0 ? (
                <div className="space-y-6">
                    <Select value={selectedSubjectKey} onValueChange={setSelectedSubjectKey}>
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Select a subject..." />
                        </SelectTrigger>
                        <SelectContent>
                            {assignedSubjects.map(m => (
                                <SelectItem key={`${m.subject}-${m.class_name}`} value={`${m.subject}-${m.class_name}`}>
                                    {m.subject} ({m.class_name})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    {selectedMapping && faculty && (
                        <div className="mt-4">
                            <SubjectReportCard
                                facultyId={faculty.faculty_id}
                                subject={selectedMapping.subject}
                                className={selectedMapping.class_name}
                                allFeedback={allFeedback}
                                allFaculty={allFaculty}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-muted-foreground">You are not currently assigned to any subjects.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
