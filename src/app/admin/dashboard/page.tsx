
"use client";

import { useState, useMemo } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { AvgRatingByDeptChart } from "@/components/charts/avg-rating-by-dept";
import { FeedbackCriteriaChart } from '@/components/charts/feedback-criteria-chart';
import { ResponseRateChart } from '@/components/charts/response-rate-chart';
import { ClassFacultyRatingsChart } from '@/components/charts/class-faculty-ratings-chart';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirebase } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import type { Student, Faculty, ClassFacultyMapping, Feedback } from '@/lib/types';


export default function AdminDashboard() {
  const { firestore } = useFirebase();
  const { user } = useAuth();

  const feedbackQuery = useMemo(() => {
    if (!firestore || !user || user.role !== 'admin') return null;
    return collection(firestore, 'feedback');
  }, [firestore, user]);

  const facultyQuery = useMemo(() => {
    if (!firestore || !user || user.role !== 'admin') return null;
    return collection(firestore, 'faculty');
  }, [firestore, user]);

  const mappingsQuery = useMemo(() => {
    if (!firestore || !user || user.role !== 'admin') return null;
    return collection(firestore, 'classFacultyMapping');
  }, [firestore, user]);

  const studentsQuery = useMemo(() => {
    if (!firestore || !user || user.role !== 'admin') return null;
    return collection(firestore, 'students');
  }, [firestore, user]);

  const { data: feedback } = useCollection<Feedback>(feedbackQuery);
  const { data: faculty } = useCollection<Faculty>(facultyQuery);
  const { data: mappings } = useCollection<ClassFacultyMapping>(mappingsQuery);
  const { data: students } = useCollection<Student>(studentsQuery);
  
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null);

  // Memoize overall stats
  const { overallAverage, totalSubmissions } = useMemo(() => {
    if (!feedback || feedback.length === 0) {
      return { overallAverage: "N/A", totalSubmissions: 0 };
    }
    let totalRating = 0;
    let ratingCount = 0;
    feedback.forEach(fb => {
      (fb.ratings || []).forEach(r => {
        totalRating += r.rating;
        ratingCount++;
      });
    });
    const average = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "N/A";
    return { overallAverage: average, totalSubmissions: feedback.length };
  }, [feedback]);
  
  // Memoize data for the selected faculty view
  const selectedFaculty = useMemo(() => {
    return faculty?.find(f => f.faculty_id === selectedFacultyId) || null;
  }, [selectedFacultyId, faculty]);

  const assignedSubjects = useMemo(() => {
    if (!selectedFaculty || !mappings) return [];
    return mappings.filter(mapping => mapping.faculty_id === selectedFaculty.faculty_id);
  }, [selectedFaculty, mappings]);

  const selectedMapping = useMemo(() => {
    if (!selectedSubject) return null;
    const [className, subject] = selectedSubject.split('||');
    return assignedSubjects.find(s => s.class_name === className && s.subject === subject);
  }, [selectedSubject, assignedSubjects]);

  const feedbackForSubject = useMemo(() => {
    if (!selectedMapping || !feedback) return [];
    return feedback.filter(f => f.faculty_id === selectedMapping.faculty_id && f.subject === selectedMapping.subject && f.class_name === selectedMapping.class_name);
  }, [selectedMapping, feedback]);

  const totalStudentsInClass = useMemo(() => {
    if (!selectedMapping || !students) return 0;
    return students.filter(s => s.class_name === selectedMapping.class_name).length;
  }, [selectedMapping, students]);

  const shuffledComments = useMemo(() => {
    return (feedbackForSubject || [])
      .map(f => f.comment)
      .filter((c): c is string => c !== null && c.trim() !== '')
      .sort(() => Math.random() - 0.5);
  }, [feedbackForSubject]);

  const handleFacultyChange = (facultyId: string) => {
    setSelectedFacultyId(facultyId);
    setSelectedSubject(null); // Reset subject selection
  }

  const uniqueClassNames = useMemo(() => {
    if (!mappings) return [];
    const classSet = new Set(mappings.map(m => m.class_name));
    return Array.from(classSet).sort();
  }, [mappings]);

  const facultyScoresForClass = useMemo(() => {
    if (!selectedClassName || !feedback || !faculty) return [];

    const classFeedback = feedback.filter(fb => fb.class_name === selectedClassName);
    const ratingsByFaculty: { [key: string]: { total: number; count: number; name: string } } = {};

    classFeedback.forEach(fb => {
      const facultyMember = faculty.find(f => f.faculty_id === fb.faculty_id);
      if (!facultyMember) return;

      if (!ratingsByFaculty[fb.faculty_id]) {
        ratingsByFaculty[fb.faculty_id] = { total: 0, count: 0, name: facultyMember.name };
      }

      (fb.ratings || []).forEach(rating => {
        ratingsByFaculty[fb.faculty_id].total += rating.rating;
        ratingsByFaculty[fb.faculty_id].count += 1;
      });
    });

    return Object.entries(ratingsByFaculty).map(([faculty_id, data]) => ({
      facultyName: data.name,
      score: data.count > 0 ? (data.total / data.count).toFixed(2) : 'N/A',
    })).sort((a, b) => b.score.localeCompare(a.score));

  }, [selectedClassName, faculty, feedback]);

  const facultyOptions = useMemo(() => faculty || [], [faculty]);
  const allFeedback = useMemo(() => feedback || [], [feedback]);
  const allStudents = useMemo(() => students || [], [students]);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Analytics Dashboard</h1>
      </div>
      <div className="grid flex-1 auto-rows-max items-start gap-4 md:gap-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Card className="sm:col-span-2 shadow-2xl" x-chunk="dashboard-05-chunk-0">
            <CardHeader className="pb-3">
                <CardTitle>Welcome, Admin</CardTitle>
                <CardDescription className="max-w-lg text-balance leading-relaxed">
                Here's an overview of the feedback data across the institution. Use these insights to identify trends and areas for improvement.
                </CardDescription>
            </CardHeader>
            </Card>
            <Card className="shadow-2xl" x-chunk="dashboard-05-chunk-1">
            <CardHeader className="pb-2">
                <CardDescription>Overall Average Rating</CardDescription>
                <CardTitle className="text-4xl text-accent">{overallAverage}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground">
                Based on all feedback
                </div>
            </CardContent>
            </Card>
            <Card className="shadow-2xl" x-chunk="dashboard-05-chunk-2">
            <CardHeader className="pb-2">
                <CardDescription>Total Feedback Submitted</CardDescription>
                <CardTitle className="text-4xl">{totalSubmissions}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground">
                Across all departments
                </div>
            </CardContent>
            </Card>
        </div>
        
        <Card className="shadow-2xl">
            <CardHeader>
            <CardTitle>Average Rating by Department</CardTitle>
            <CardDescription>A comparative look at performance across departments.</CardDescription>
            </CardHeader>
            <CardContent>
            <AvgRatingByDeptChart feedback={allFeedback} faculty={facultyOptions} />
            </CardContent>
        </Card>

        {/* Class Drilldown Section */}
        <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">Class-Specific View</h2>
            <Card className="shadow-2xl">
                <CardHeader>
                    <CardTitle>Select a Class</CardTitle>
                    <CardDescription>Choose a class to see a breakdown of faculty ratings within that class.</CardDescription>
                    <div className="pt-4 max-w-sm">
                        <Select onValueChange={setSelectedClassName} value={selectedClassName || ''}>
                            <SelectTrigger className="shadow-lg">
                                <SelectValue placeholder="Select a class..." />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueClassNames.map(name => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                {selectedClassName && (
                    <CardContent>
                        <Separator className="my-6" />
                        <h3 className="text-lg font-semibold mb-2">Faculty Performance in {selectedClassName}</h3>
                        <p className="text-muted-foreground mb-4">Average ratings for all subjects taught in this class.</p>
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="md:col-span-2 shadow-inner bg-muted/30">
                                <CardHeader>
                                    <CardTitle>Performance Chart</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ClassFacultyRatingsChart className={selectedClassName} feedback={allFeedback} faculty={facultyOptions} />
                                </CardContent>
                            </Card>
                            <Card className="shadow-inner bg-muted/30">
                                <CardHeader>
                                    <CardTitle>Faculty Scores</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     {facultyScoresForClass.length > 0 ? (
                                        <ul className="space-y-3">
                                            {facultyScoresForClass.map(faculty => (
                                                <li key={faculty.facultyName} className="flex justify-between items-center text-sm">
                                                    <span>{faculty.facultyName}</span>
                                                    <span className="font-bold text-accent">{faculty.score}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-muted-foreground text-center">No scores to display.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
        
        <Separator className="my-4" />

        {/* Faculty Drilldown Section */}
        <div>
            <h2 className="text-xl font-semibold mb-4">Faculty-Specific View</h2>
            <Card className="shadow-2xl">
            <CardHeader>
                <CardTitle>Select a Faculty Member</CardTitle>
                <CardDescription>Choose a faculty member to see their detailed feedback report.</CardDescription>
                <div className="pt-4 max-w-sm">
                    <Select onValueChange={handleFacultyChange} value={selectedFacultyId || ''}>
                        <SelectTrigger className="shadow-lg">
                            <SelectValue placeholder="Select a faculty member..." />
                        </SelectTrigger>
                        <SelectContent>
                            {facultyOptions.map(f => (
                                <SelectItem key={f.faculty_id} value={f.faculty_id}>{f.name} ({f.department})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            {selectedFaculty && (
                <CardContent>
                    <Separator className="my-6" />
                    <h3 className="text-lg font-semibold mb-2">Report for {selectedFaculty.name}</h3>
                    <p className="text-muted-foreground mb-4">Select a subject to view the feedback report.</p>

                    <div className="mb-6 max-w-sm">
                        <Select onValueChange={setSelectedSubject} value={selectedSubject || ''}>
                            <SelectTrigger className="shadow-lg">
                                <SelectValue placeholder="Select a subject..." />
                            </SelectTrigger>
                            <SelectContent>
                                {assignedSubjects.map(s => (
                                    <SelectItem key={`${s.class_name}-${s.subject}`} value={`${s.class_name}||${s.subject}`}>
                                        {s.class_name} - {s.subject}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedMapping ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                            <Card className="lg:col-span-2 shadow-inner bg-muted/30">
                                <CardHeader>
                                <CardTitle>Feedback Criteria Analysis</CardTitle>
                                <CardDescription>Average scores for each feedback category.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                <FeedbackCriteriaChart feedback={feedbackForSubject} />
                                </CardContent>
                            </Card>
                            
                            <Card className="shadow-inner bg-muted/30">
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

                            <Card className="lg:col-span-3 shadow-inner bg-muted/30">
                                <CardHeader>
                                <CardTitle>Anonymous Comments</CardTitle>
                                <CardDescription>All comments are displayed in a random order to ensure anonymity.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                {shuffledComments.length > 0 ? (
                                    <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                                    {shuffledComments.map((comment, index) => (
                                        <div key={index} className="p-4 bg-background/50 rounded-lg shadow-inner">
                                        <p className="italic">"{comment}"</p>
                                        </div>
                                    ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center p-4">No comments submitted for this subject.</p>
                                )}
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        assignedSubjects.length > 0 && <p className="text-muted-foreground mt-4">Please select a subject to see the detailed report.</p>
                    )}
                </CardContent>
            )}

            </Card>
        </div>

      </div>
    </>
  )
}

    