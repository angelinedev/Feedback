
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { Feedback, ClassFacultyMapping } from "@/lib/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react";
import { CardDescription } from "../ui/card";

interface ClassAverageChartProps {
    allFeedback: Feedback[];
    allMappings: ClassFacultyMapping[];
}

export function ClassAverageChart({ allFeedback, allMappings }: ClassAverageChartProps) {

  const chartData = useMemo(() => {
    const uniqueClasses = [...new Set(allMappings.map(m => m.class_name))];

    const data = uniqueClasses.map(className => {
        const classFeedback = allFeedback.filter(fb => fb.class_name === className);
        
        if(classFeedback.length === 0) {
            return {
                name: className,
                averageRating: 0,
                fill: "hsl(var(--muted))"
            }
        }

        let totalRating = 0;
        let ratingCount = 0;
        classFeedback.forEach(fb => {
            (fb.ratings || []).forEach(r => {
                totalRating += r.rating;
                ratingCount++;
            });
        });

        const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
        return {
            name: className,
            averageRating: parseFloat(averageRating.toFixed(2)),
            fill: "hsl(var(--chart-2))"
        };
    });

    return data.sort((a,b) => b.averageRating - a.averageRating);
  }, [allFeedback, allMappings]);

  if(allFeedback.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No feedback has been submitted yet to compare classes.</div>
  }

  return (
    <ChartContainer config={{}} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}/>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="averageRating" radius={8} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

