
"use client";

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Faculty } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { KeyRound, Star } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/change-password-dialog';
import { SubjectReportCard } from '@/components/subject-report-card';

export default function FacultyDashboard() {
  const { user, mappings, feedback: allFeedback, faculty: allFaculty } = useAuth();
  
  const faculty = user?.details as Faculty | undefined;
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const assignedSubjects = useMemo(() => {
    if (!faculty?.faculty_id) return [];
    return mappings.filter(mapping => mapping.faculty_id === faculty.faculty_id);
  }, [faculty?.faculty_id, mappings]);

  const overallAverageScore = useMemo(() => {
    if (!faculty?.faculty_id) return 0;
    
    const facultyFeedback = allFeedback.filter(fb => fb.faculty_id === faculty.faculty_id);
    if(facultyFeedback.length === 0) return 0;

    let totalRating = 0;
    let ratingCount = 0;
    facultyFeedback.forEach(fb => {
      (fb.ratings || []).forEach(r => {
        totalRating += r.rating;
        ratingCount++;
      });
    });

    return ratingCount > 0 ? (totalRating / ratingCount) : 0;
  }, [faculty?.faculty_id, allFeedback]);


  return (
    <div className="container mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Here is your detailed feedback report.</p>
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

      <div className="grid gap-8">
        <Card className="shadow-2xl">
           <CardHeader>
             <CardTitle>Performance Overview</CardTitle>
             <CardDescription>Your average score across all subjects and classes.</CardDescription>
           </CardHeader>
           <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full p-4">
                   <Star className="h-8 w-8" />
                </div>
                <div>
                   <p className="text-sm text-muted-foreground">Overall Average Score</p>
                   <p className="text-4xl font-bold tracking-tighter">{overallAverageScore.toFixed(2)}</p>
                </div>
              </div>
           </CardContent>
        </Card>

        {assignedSubjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {assignedSubjects.map(mapping => (
                    <SubjectReportCard
                        key={`${mapping.faculty_id}-${mapping.subject}-${mapping.class_name}`}
                        facultyId={mapping.faculty_id}
                        subject={mapping.subject}
                        className={mapping.class_name}
                        allFeedback={allFeedback}
                        allFaculty={allFaculty}
                    />
                ))}
            </div>
        ) : (
            <Card className="shadow-2xl">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">You are not currently assigned to any subjects.</p>
              </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
