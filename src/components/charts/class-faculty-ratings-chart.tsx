
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react";
import type { Feedback, Faculty } from "@/lib/types";

interface ClassFacultyRatingsChartProps {
  className: string;
  feedback: Feedback[];
  faculty: Faculty[];
}

export function ClassFacultyRatingsChart({ className, feedback, faculty }: ClassFacultyRatingsChartProps) {

  const chartData = useMemo(() => {
    if (!className || !feedback || feedback.length === 0 || !faculty || faculty.length === 0) return [];

    const classFeedback = feedback.filter(fb => fb.class_name === className);

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

    return Object.entries(ratingsByFaculty).map(([faculty_id, data], index) => ({
      facultyName: data.name,
      rating: parseFloat((data.total / data.count).toFixed(2)),
      fill: `hsl(var(--chart-${(index % 2) + 1}))`
    }));

  }, [className, faculty, feedback]);

  if (chartData.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No feedback data available for this class yet.</div>
  }

  return (
    <ChartContainer config={{}} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="facultyName"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.split(' ').slice(0, 2).join(' ')}
                 tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
             <YAxis domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}/>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="rating" radius={8} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

    