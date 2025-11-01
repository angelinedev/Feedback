
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react";
import type { Feedback, Faculty } from "@/lib/types";

interface AvgRatingByDeptChartProps {
  feedback: Feedback[];
  faculty: Faculty[];
}

export function AvgRatingByDeptChart({ feedback, faculty }: AvgRatingByDeptChartProps) {
  const chartData = useMemo(() => {
    if (!feedback || feedback.length === 0 || !faculty || faculty.length === 0) return [];

    const ratingsByDept: { [key: string]: { total: number; count: number } } = {};

    feedback.forEach(fb => {
      const facultyMember = faculty.find(f => f.faculty_id === fb.faculty_id);
      if (!facultyMember) return;

      const dept = facultyMember.department;
      if (!ratingsByDept[dept]) {
        ratingsByDept[dept] = { total: 0, count: 0 };
      }

      fb.ratings.forEach(rating => {
        ratingsByDept[dept].total += rating.rating;
        ratingsByDept[dept].count += 1;
      });
    });

    return Object.entries(ratingsByDept).map(([department, data], index) => ({
      department,
      rating: parseFloat((data.total / data.count).toFixed(2)),
      fill: `hsl(var(--chart-${(index % 2) + 1}))`
    }));

  }, [faculty, feedback]);

  if(chartData.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No feedback data available yet.</div>
  }

  return (
    <ChartContainer config={{}} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="department"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
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
