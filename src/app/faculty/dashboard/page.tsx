
"use client";

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedbackCriteriaChart } from '@/components/charts/feedback-criteria-chart';
import { ResponseRateChart } from '@/components/charts/response-rate-chart';
import type { Faculty } from '@/lib/types';
import { useData } from '@/components/data-provider';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/change-password-dialog';


export default function FacultyDashboard() {
  const { user } = useAuth();
  const { students, mappings, feedback } = useData();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const faculty = user?.details as Faculty;

  const assignedSubjects = useMemo(() => {
    if (!faculty?.faculty_id) return [];
    return mappings.filter(mapping => mapping.faculty_id === faculty.faculty_id);
  }, [faculty?.faculty_id, mappings]);

  // Set default selection
  useState(() => {
    if (assignedSubjects.length > 0) {
      const firstSubject = assignedSubjects[0];
      setSelectedSubject(`${firstSubject.class_name}-${firstSubject.subject}`);
    }
  });

  const selectedMapping = useMemo(() => {
    if (!selectedSubject) return null;
    return assignedSubjects.find(s => `${s.class_name}-${s.subject}` === selectedSubject);
  }, [selectedSubject, assignedSubjects]);

  const feedbackForSubject = useMemo(() => {
    if (!selectedMapping) return [];
    return feedback.filter(f => f.faculty_id === selectedMapping.faculty_id && f.subject === selectedMapping.subject);
  }, [selectedMapping, feedback]);
  
  const totalStudentsInClass = useMemo(() => {
    if (!selectedMapping) return 0;
    return students.filter(s => s.class_name === selectedMapping.class_name).length;
  }, [selectedMapping, students]);

  const shuffledComments = useMemo(() => {
    return feedbackForSubject
      .map(f => f.comment)
      .filter((c): c is string => c !== null && c.trim() !== '')
      .sort(() => Math.random() - 0.5);
  }, [feedbackForSubject]);

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Select a subject to view the feedback report.</p>
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

      <div className="mb-6 max-w-sm">
        <Select onValueChange={setSelectedSubject} value={selectedSubject || ''}>
          <SelectTrigger className="shadow-lg">
            <SelectValue placeholder="Select a subject..." />
          </SelectTrigger>
          <SelectContent>
            {assignedSubjects.map(s => (
              <SelectItem key={`${s.class_name}-${s.subject}`} value={`${s.class_name}-${s.subject}`}>
                {s.class_name} - {s.subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedMapping ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-2xl">
            <CardHeader>
              <CardTitle>Feedback Criteria Analysis</CardTitle>
              <CardDescription>Average scores for each feedback category.</CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackCriteriaChart feedback={feedbackForSubject} />
            </CardContent>
          </Card>
          
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle>Response Rate</CardTitle>
              <CardDescription>
                {feedbackForSubject.length} out of {totalStudentsInClass} students submitted feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponseRateChart submitted={feedbackForSubject.length} total={totalStudentsInClass} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 shadow-2xl">
            <CardHeader>
              <CardTitle>Anonymous Comments</CardTitle>
              <CardDescription>All comments are displayed in a random order to ensure anonymity.</CardDescription>
            </CardHeader>
            <CardContent>
              {shuffledComments.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                  {shuffledComments.map((comment, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg shadow-inner">
                      <p className="italic">"{comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No comments submitted for this subject.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-muted-foreground mb-4"><path d="M4 17.5a2.5 2.5 0 0 1 5 0"/><path d="M15 17.5a2.5 2.5 0 0 1 5 0"/><path d="M12 17.5a2.5 2.5 0 0 1 5 0"/><path d="M4 12.5a2.5 2.5 0 0 1 5 0"/><path d="M12 12.5a2.5 2.5 0 0 1 5 0"/><path d="m19 12.5 2.5-2.5"/><path d="M4 7.5a2.5 2.5 0 0 1 5 0"/><path d="M12 7.5a2.5 2.5 0 0 1 5 0"/></svg>
            <h2 className="text-xl font-semibold">{assignedSubjects.length > 0 ? "No Subject Selected" : "Not Assigned to Any Subjects"}</h2>
            <p className="text-muted-foreground">
              {assignedSubjects.length > 0 ? "Please choose a subject from the dropdown above to view the report." : "Please contact an admin to be assigned to a subject."}
            </p>
        </div>
      )}
    </div>
  );
}
