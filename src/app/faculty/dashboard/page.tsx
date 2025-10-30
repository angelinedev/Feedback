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
import type { Faculty, Student, Feedback, ClassFacultyMapping } from '@/lib/types';


// In a real app, this data would come from a database.
const MOCK_GLOBAL_STUDENTS: Student[] = [
  { id: '1', register_number: '1111222233334441', name: 'Alice Johnson', password: 'password123', class_name: 'CS-A' },
  { id: '2', register_number: '1111222233334442', name: 'Bob Williams', password: 'password123', class_name: 'CS-A' },
  { id: '3', register_number: '1111222233334443', name: 'Charlie Brown', password: 'password123', class_name: 'CS-B' },
  { id: '4', register_number: '1111222233334444', name: 'Diana Miller', password: 'password123', class_name: 'EC-A' },
  { id: '5', register_number: '1111222233334445', name: 'Ethan Davis', password: 'password123', class_name: 'EC-A' },
];

const MOCK_GLOBAL_MAPPINGS: ClassFacultyMapping[] = [
    { id: 'map1', class_name: 'CS-A', faculty_id: '101', subject: 'Data Structures' },
    { id: 'map2', class_name: 'CS-A', faculty_id: '102', subject: 'Algorithms' },
    { id: 'map3', class_name: 'CS-B', faculty_id: '101', subject: 'Database Management' },
    { id: 'map4', class_name: 'EC-A', faculty_id: '201', subject: 'Digital Circuits' },
    { id: 'map5', class_name: 'EC-A', faculty_id: '202', subject: 'Signal Processing' },
];

const MOCK_GLOBAL_FEEDBACK: Feedback[] = [
    {
        id: 'fb1',
        student_id: '2', // Bob Williams
        faculty_id: '101', // Dr. Evelyn Reed
        class_name: 'CS-A',
        subject: 'Data Structures',
        ratings: [
            { question_id: 'q1', rating: 5 },
            { question_id: 'q2', rating: 5 },
            { question_id: 'q3', rating: 4 },
            { question_id: 'q4', rating: 5 },
            { question_id: 'q5', rating: 4 },
            { question_id: 'q6', rating: 5 },
        ],
        comment: 'Dr. Reed is an excellent teacher. The concepts were made very clear.',
        semester: 'Fall 2023',
        submitted_at: new Date('2023-11-15T10:00:00Z'),
    },
];

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const faculty = user?.details as Faculty;

  const assignedSubjects = useMemo(() => {
    if (!faculty?.faculty_id) return [];
    return MOCK_GLOBAL_MAPPINGS.filter(mapping => mapping.faculty_id === faculty.faculty_id);
  }, [faculty?.faculty_id]);

  const selectedMapping = useMemo(() => {
    if (!selectedSubject) return null;
    return assignedSubjects.find(s => `${s.class_name}-${s.subject}` === selectedSubject);
  }, [selectedSubject, assignedSubjects]);

  const feedbackForSubject = useMemo(() => {
    if (!selectedMapping) return [];
    return MOCK_GLOBAL_FEEDBACK.filter(f => f.faculty_id === selectedMapping.faculty_id && f.subject === selectedMapping.subject);
  }, [selectedMapping]);
  
  const totalStudentsInClass = useMemo(() => {
    if (!selectedMapping) return 0;
    return MOCK_GLOBAL_STUDENTS.filter(s => s.class_name === selectedMapping.class_name).length;
  }, [selectedMapping]);

  const shuffledComments = useMemo(() => {
    return feedbackForSubject
      .map(f => f.comment)
      .filter((c): c is string => c !== null && c.trim() !== '')
      .sort(() => Math.random() - 0.5);
  }, [feedbackForSubject]);

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Select a subject to view the feedback report.</p>
      </div>

      <div className="mb-6 max-w-sm">
        <Select onValueChange={setSelectedSubject}>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-muted-foreground mb-4"><path d="M4 17.5a2.5 2.5 0 0 1 5 0"/><path d="M15 17.5a2.5 2.5 0 0 1 5 0"/><path d="M12 17.5a2.5 2.5 0 0 1 5 0"/><path d="M4 12.5a2.5 2.5 0 0 1 5 0"/><path d="M12 12.5a2.5 2.5 0 0 1 5 0"/><path d="m19 12.5 2.5-2.5"/><path d="M4 7.5a2.5 2.5 0 0 1 5 0"/><path d="M12 7.5a2.5 2.5 0 0
 1 5 0"/></svg>
            <h2 className="text-xl font-semibold">No Subject Selected</h2>
            <p className="text-muted-foreground">Please choose a subject from the dropdown above to view the report.</p>
        </div>
      )}
    </div>
  );
}
