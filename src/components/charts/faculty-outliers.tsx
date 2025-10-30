
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useData } from "../data-provider";
import { useMemo } from "react";


interface FacultyOutliersChartProps {
  type: "top" | "bottom"
}

export function FacultyOutliersChart({ type }: FacultyOutliersChartProps) {
  const { faculty, feedback } = useData();

  const facultyRatings = useMemo(() => {
    if (feedback.length === 0) return [];

    const ratingsByFaculty: { [key: string]: { total: number; count: number; name: string } } = {};

    feedback.forEach(fb => {
      const facultyMember = faculty.find(f => f.faculty_id === fb.faculty_id);
      if (!facultyMember) return;

      if (!ratingsByFaculty[fb.faculty_id]) {
        ratingsByFaculty[fb.faculty_id] = { total: 0, count: 0, name: facultyMember.name };
      }

      fb.ratings.forEach(rating => {
        ratingsByFaculty[fb.faculty_id].total += rating.rating;
        ratingsByFaculty[fb.faculty_id].count += 1;
      });
    });

    return Object.entries(ratingsByFaculty).map(([faculty_id, data]) => ({
      name: data.name.split(' ').slice(0,2).join(' '), // Shorten name
      rating: parseFloat((data.total / data.count).toFixed(2)),
      fill: type === 'top' ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"
    }));

  }, [faculty, feedback, type]);

  const sortedData = useMemo(() => {
    const sorted = [...facultyRatings].sort((a, b) => type === 'top' ? b.rating - a.rating : a.rating - b.rating);
    return sorted.slice(0, 5);
  }, [facultyRatings, type]);
  
  const domain: [number, number] | [string, string] = useMemo(() => {
    if (sortedData.length === 0) return [0, 5];
    if (type === 'top') {
        const min = Math.max(0, Math.min(...sortedData.map(d => d.rating)) - 0.2);
        return [parseFloat(min.toFixed(1)), 5];
    }
    const max = Math.min(5, Math.max(...sortedData.map(d => d.rating)) + 0.2);
    return [0, parseFloat(max.toFixed(1))];
  }, [sortedData, type]);

  if(sortedData.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No feedback data available yet.</div>
  }
  
  return (
    <ChartContainer config={{}} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={sortedData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
          <XAxis type="number" hide domain={domain} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            tickMargin={5}
            width={80}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="rating" radius={5} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
