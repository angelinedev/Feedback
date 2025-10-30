"use client";

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FeedbackForm } from '@/components/feedback-form';
import type { ClassFacultyMapping, Faculty, Student } from '@/lib/types';
import { CheckCircle, Edit } from 'lucide-react';

// In a real app, this would come from a database
const MOCK_GLOBAL_FACULTY: Faculty[] = [
  { id: '101', faculty_id: '101', name: 'Dr. Evelyn Reed', password: 'password123', department: 'Computer Science' },
  { id: '102', faculty_id: '102', name: 'Prof. Samuel Green', password: 'password123', department: 'Computer Science' },
  { id: '201', faculty_id: '201', name: 'Dr. Olivia White', password: 'password123', department: 'Electronics' },
  { id: '202', faculty_id: '202', name: 'Prof. David Black', password: 'password123', department: 'Electronics' },
];

const MOCK_GLOBAL_MAPPINGS: ClassFacultyMapping[] = [
    { id: 'map1', class_name: 'CS-A', faculty_id: '101', subject: 'Data Structures' },
    { id: 'map2', class_name: 'CS-A', faculty_id: '102', subject: 'Algorithms' },
    { id: 'map3', class_name: 'CS-B', faculty_id: '101', subject: 'Database Management' },
    { id: 'map4', class_name: 'EC-A', faculty_id: '201', subject: 'Digital Circuits' },
    { id: 'map5', class_name: 'EC-A', faculty_id: '202', subject: 'Signal Processing' },
];

const MOCK_GLOBAL_QUESTIONS = [
  { id: 'q1', text: 'Clarity of explanation', order: 1 },
  { id: 'q2', text: 'Punctuality and regularity', order: 2 },
  { id: 'q3', text: 'Subject knowledge', order: 3 },
  { id: 'q4', text: 'Interaction and engagement with students', order: 4 },
  { id: 'q5', text: 'Quality of learning materials provided', order: 5 },
  { id: 'q6', text: 'Fairness in evaluation', order: 6 },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [submittedFeedback, setSubmittedFeedback] = useState<string[]>([]);
  const [selectedMapping, setSelectedMapping] = useState<(ClassFacultyMapping & { facultyName: string }) | null>(null);
  
  const student = user?.details as Student | undefined;

  const subjectsForStudent = useMemo(() => {
    if (!student?.class_name) return [];
    return MOCK_GLOBAL_MAPPINGS
      .filter(mapping => mapping.class_name === student.class_name)
      .map(mapping => {
        const faculty = MOCK_GLOBAL_FACULTY.find(f => f.faculty_id === mapping.faculty_id);
        return {
          ...mapping,
          facultyName: faculty?.name || 'Unknown Faculty'
        };
      });
  }, [student?.class_name]);

  const handleFeedbackSubmit = (facultyId: string, subject: string) => {
    const key = `${facultyId}-${subject}`;
    setSubmittedFeedback(prev => [...prev, key]);
    setSelectedMapping(null);
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Here are the feedback forms available for your class: {student?.class_name}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjectsForStudent.map(mapping => {
          const isSubmitted = submittedFeedback.includes(`${mapping.faculty_id}-${mapping.subject}`);
          return (
            <Card key={mapping.id} className="shadow-2xl flex flex-col transition-all duration-300 hover:border-primary">
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
                          questions={MOCK_GLOBAL_QUESTIONS}
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
