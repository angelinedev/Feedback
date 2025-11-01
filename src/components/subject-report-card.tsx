
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Feedback, Faculty } from '@/lib/types';
import { FeedbackCriteriaChart } from '@/components/charts/feedback-criteria-chart';
import { User } from 'lucide-react';

interface SubjectReportCardProps {
    facultyId: string;
    subject: string;
    className: string;
    allFeedback: Feedback[];
    allFaculty: Faculty[];
}

export function SubjectReportCard({ facultyId, subject, className, allFeedback, allFaculty }: SubjectReportCardProps) {

  const subjectFeedback = useMemo(() => {
    return allFeedback.filter(fb => 
        fb.faculty_id === facultyId && 
        fb.subject === subject && 
        fb.class_name === className
    );
  }, [allFeedback, facultyId, subject, className]);

  const averageRating = useMemo(() => {
    if (subjectFeedback.length === 0) return 0;
    let totalRating = 0;
    let ratingCount = 0;
    subjectFeedback.forEach(fb => {
      (fb.ratings || []).forEach(r => {
        totalRating += r.rating;
        ratingCount++;
      });
    });
    return ratingCount > 0 ? (totalRating / ratingCount) : 0;
  }, [subjectFeedback]);

  const facultyName = useMemo(() => {
    return allFaculty.find(f => f.faculty_id === facultyId)?.name || 'Unknown';
  }, [allFaculty, facultyId]);

  return (
    <Card className="shadow-lg bg-card/70">
        <CardHeader>
            <CardTitle>{subject}</CardTitle>
            <CardDescription>
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{facultyName} | {className}</span>
                </div>
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className='flex justify-between items-center bg-muted p-3 rounded-lg'>
                <div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <p className="text-2xl font-bold">{averageRating.toFixed(2)}</p>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Submissions</p>
                    <p className="text-2xl font-bold">{subjectFeedback.length}</p>
                </div>
            </div>
            <FeedbackCriteriaChart feedback={subjectFeedback} />
        </CardContent>
    </Card>
  );
}
