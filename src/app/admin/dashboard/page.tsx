
"use client";

import { useMemo } from 'react';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/components/auth-provider';
import { ResponseRateChart } from '@/components/charts/response-rate-chart';
import { FeedbackCriteriaChart } from '@/components/charts/feedback-criteria-chart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SubjectReportCard } from '@/components/subject-report-card';
import { ClassAverageChart } from '@/components/charts/class-average-chart';

export default function AdminDashboard() {
  const { feedback: allFeedback, students: allStudents, mappings: allMappings, faculty: allFaculty } = useAuth();
  
  const totalPossibleFeedback = useMemo(() => {
    if (!allStudents.length || !allMappings.length) return 0;
    const studentCountByClass = allStudents.reduce((acc, student) => {
        acc[student.class_name] = (acc[student.class_name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const totalSubmissionsPossible = Object.entries(studentCountByClass).reduce((acc, [className, studentCount]) => {
        const subjectsForClass = allMappings.filter(m => m.class_name === className).length;
        return acc + (studentCount * subjectsForClass);
    }, 0);

    return totalSubmissionsPossible;
  }, [allStudents, allMappings]);
  
  const uniqueSubmissions = useMemo(() => new Set(allFeedback.map(f => `${f.student_id}-${f.faculty_id}-${f.subject}`)).size, [allFeedback]);

  const responseRate = useMemo(() => {
    if (totalPossibleFeedback === 0) return 0;
    return (uniqueSubmissions / totalPossibleFeedback) * 100;
  }, [uniqueSubmissions, totalPossibleFeedback]);

  const overallAverageRating = useMemo(() => {
    if (allFeedback.length === 0) return 0;
    let totalRating = 0;
    let ratingCount = 0;
    allFeedback.forEach(fb => {
      (fb.ratings || []).forEach(r => {
        totalRating += r.rating;
        ratingCount++;
      });
    });
    return ratingCount > 0 ? (totalRating / ratingCount) : 0;
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
                <CardTitle className="text-4xl">{uniqueSubmissions}</CardTitle>
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
                   {uniqueSubmissions} of {totalPossibleFeedback} completed
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
                <CardTitle>Overall Response Rate</CardTitle>
                <CardDescription>Percentage of students who have submitted feedback across all classes.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponseRateChart submitted={uniqueSubmissions} total={totalPossibleFeedback} />
              </CardContent>
            </Card>
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle>Overall Feedback Criteria Analysis</CardTitle>
                <CardDescription>Average ratings for each feedback question across all submissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackCriteriaChart feedback={allFeedback} />
              </CardContent>
            </Card>
        </div>

        <Separator className="my-4" />
        
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Average Feedback Score by Class</CardTitle>
            <CardDescription>Compares the overall average feedback score for teachers across different classes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ClassAverageChart allFeedback={allFeedback} allMappings={allMappings} />
          </CardContent>
        </Card>

        <Separator className="my-4" />

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Faculty Feedback Analysis</CardTitle>
            <CardDescription>Review detailed feedback reports for each faculty member.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {allFaculty.sort((a,b) => a.name.localeCompare(b.name)).map(faculty => {
                const facultyMappings = allMappings.filter(m => m.faculty_id === faculty.faculty_id);
                if (facultyMappings.length === 0) return null;
                
                return (
                  <AccordionItem value={faculty.id} key={faculty.id}>
                    <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                      <div>
                        <div className="font-bold text-base">{faculty.name}</div>
                        <div className="text-sm text-muted-foreground">{faculty.department} ({faculty.faculty_id})</div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 bg-muted/20 rounded-b-md">
                        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                           {facultyMappings.map(mapping => (
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
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
        </Card>

      </div>
    </>
  )
}
