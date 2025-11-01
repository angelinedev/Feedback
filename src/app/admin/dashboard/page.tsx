
"use client";

import { useMemo } from 'react';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/hooks/use-auth';
import { mockClassFacultyMapping, mockFeedback, mockStudents } from '@/lib/mock-data';
import { ResponseRateChart } from '@/components/charts/response-rate-chart';
import { FeedbackCriteriaChart } from '@/components/charts/feedback-criteria-chart';
import { BarChart, Users, CheckCircle } from 'lucide-react';


export default function AdminDashboard() {
  const { user } = useAuth();
  
  const allFeedback = useMemo(() => mockFeedback, []);
  const allStudents = useMemo(() => mockStudents, []);
  const allMappings = useMemo(() => mockClassFacultyMapping, []);

  const totalPossibleFeedback = useMemo(() => {
    return allStudents.length * allMappings.length;
  }, [allStudents, allMappings]);

  const responseRate = useMemo(() => {
    if (totalPossibleFeedback === 0) return 0;
    const uniqueStudentFeedback = new Set(allFeedback.map(f => `${f.student_id}-${f.subject}`)).size;
    return (uniqueStudentFeedback / (allStudents.length * allMappings.filter(m => m.class_name === 'CS-A').length) * 100); // Simplified for one class
  }, [allFeedback, allStudents, allMappings, totalPossibleFeedback]);

  const overallAverageRating = useMemo(() => {
    if (allFeedback.length === 0) return 0;
    let totalRating = 0;
    let ratingCount = 0;
    allFeedback.forEach(fb => {
      fb.ratings.forEach(r => {
        totalRating += r.rating;
        ratingCount++;
      });
    });
    return (totalRating / ratingCount);
  }, [allFeedback]);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Analytics Dashboard</h1>
      </div>
      <div className="grid flex-1 auto-rows-max items-start gap-4 md:gap-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            <Card className="sm:col-span-2 md:col-span-2 lg:col-span-4 xl:col-span-4 shadow-2xl" x-chunk="dashboard-05-chunk-0">
              <CardHeader className="pb-3">
                  <CardTitle>Welcome, Admin</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                  Here's a summary of the feedback collected so far.
                  </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-2xl">
              <CardHeader className="pb-2">
                <CardDescription>Total Submissions</CardDescription>
                <CardTitle className="text-4xl">{new Set(allFeedback.map(f => `${f.student_id}-${f.subject}`)).size}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Out of {totalPossibleFeedback} possible</div>
              </CardContent>
            </Card>
             <Card className="shadow-2xl">
              <CardHeader className="pb-2">
                <CardDescription>Response Rate</CardDescription>
                <CardTitle className="text-4xl">{responseRate.toFixed(1)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                   {new Set(allFeedback.map(f => `${f.student_id}-${f.subject}`)).size} of {totalPossibleFeedback} completed
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-2xl">
              <CardHeader className="pb-2">
                <CardDescription>Overall Average Rating</CardDescription>
                <CardTitle className="text-4xl">{overallAverageRating.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Across all criteria</div>
              </CardContent>
            </Card>
            <Card className="shadow-2xl">
              <CardHeader className="pb-2">
                <CardDescription>Total Students</CardDescription>
                <CardTitle className="text-4xl">{allStudents.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Enrolled in the system</div>
              </CardContent>
            </Card>
        </div>
        
        <Separator className="my-4" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle>Response Rate</CardTitle>
                <CardDescription>Percentage of students who have submitted feedback.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponseRateChart submitted={new Set(allFeedback.map(f => `${f.student_id}-${f.subject}`)).size} total={totalPossibleFeedback} />
              </CardContent>
            </Card>
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle>Feedback Criteria Analysis</CardTitle>
                <CardDescription>Average ratings for each feedback question.</CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackCriteriaChart feedback={allFeedback} />
              </CardContent>
            </Card>
        </div>
      </div>
    </>
  )
}
