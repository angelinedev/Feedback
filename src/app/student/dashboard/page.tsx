
"use client";

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FeedbackForm } from '@/components/feedback-form';
import type { ClassFacultyMapping, Student, Feedback, Rating, Faculty } from '@/lib/types';
import { CheckCircle, Edit, KeyRound } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/change-password-dialog';

export default function StudentDashboard() {
  const { user, mappings, questions, addFeedback, feedback, faculty } = useAuth();
  const [selectedMapping, setSelectedMapping] = useState<(ClassFacultyMapping & { facultyName: string }) | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
  const student = user?.details as Student | undefined;
  
  const subjectsForStudent = useMemo(() => {
    if (!student?.class_name) return [];
    return mappings
      .filter(mapping => mapping.class_name === student.class_name)
      .map(mapping => {
        const facultyMember = faculty.find(f => f.faculty_id === mapping.faculty_id);
        return {
          ...mapping,
          facultyName: facultyMember?.name || 'Unknown Faculty'
        };
      });
  }, [student?.class_name, mappings, faculty]);

  const submittedFeedbackKeys = useMemo(() => {
    if (!student) return new Set();
    const studentFeedback = feedback.filter(f => f.student_id === student.id);
    return new Set(
      studentFeedback.map(f => `${f.faculty_id}-${f.subject}`)
    );
  }, [feedback, student]);


  const handleFeedbackSubmit = (facultyId: string, subject: string, ratings: Rating[], comment: string) => {
    if (!student) return;
    const newFeedback: Omit<Feedback, 'id'> = {
      student_id: student.id,
      faculty_id: facultyId,
      class_name: student.class_name,
      subject: subject,
      ratings: ratings,
      comment: comment,
      semester: 'Spring 2024', // This could be dynamic in a real app
      submitted_at: new Date(),
    };
    addFeedback(newFeedback, student.id);
    setSelectedMapping(null);
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Here are the feedback forms available for your class: {student?.class_name}</p>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjectsForStudent.map(mapping => {
          const isSubmitted = submittedFeedbackKeys.has(`${mapping.faculty_id}-${mapping.subject}`);
          const uniqueKey = `${mapping.id}-${mapping.faculty_id}-${mapping.subject}`;
          return (
            <Card key={uniqueKey} className="shadow-2xl flex flex-col transition-all duration-300 hover:border-primary">
              <CardHeader>
                <CardTitle>{mapping.subject}</CardTitle>
                <CardDescription>Faculty: {mapping.facultyName}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {isSubmitted ? (
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    <p className="font-semibold">Feedback Submitted</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Your feedback is anonymous and valuable for improving teaching quality.</p>
                )}
              </CardContent>
              <CardFooter>
                <Sheet open={selectedMapping?.id === mapping.id} onOpenChange={(isOpen) => !isOpen && setSelectedMapping(null)}>
                  <SheetTrigger asChild>
                    <Button 
                      className="w-full shadow-lg hover:shadow-primary/40"
                      disabled={isSubmitted}
                      onClick={() => setSelectedMapping(mapping)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {isSubmitted ? 'Submitted' : 'Give Feedback'}
                    </Button>
                  </SheetTrigger>
                   {selectedMapping?.id === mapping.id && (
                     <SheetContent className="w-full sm:max-w-lg md:max-w-2xl overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Feedback for {selectedMapping.subject}</SheetTitle>
                          <SheetDescription>
                            Faculty: {selectedMapping.facultyName}. Your feedback is completely anonymous.
                          </SheetDescription>
                        </SheetHeader>
                        <FeedbackForm
                          questions={questions}
                          facultyId={selectedMapping.faculty_id}
                          subject={selectedMapping.subject}
                          onSubmit={handleFeedbackSubmit}
                        />
                      </SheetContent>
                   )}
                </Sheet>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

    