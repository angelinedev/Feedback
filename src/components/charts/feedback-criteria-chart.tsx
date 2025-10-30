"use client"

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import type { Feedback } from "@/lib/types";
import { mockQuestions } from "@/lib/mock-data";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react";

interface FeedbackCriteriaChartProps {
    feedback: Feedback[];
}

export function FeedbackCriteriaChart({ feedback }: FeedbackCriteriaChartProps) {

  const chartData = useMemo(() => {
    if (feedback.length === 0) {
      return mockQuestions.map(q => ({ name: q.text, averageRating: 0, fill: "hsl(var(--chart-1))" }));
    }

    const ratingSums: { [key: string]: { total: number; count: number } } = {};

    feedback.forEach(fb => {
        fb.ratings.forEach(r => {
            if (!ratingSums[r.question_id]) {
                ratingSums[r.question_id] = { total: 0, count: 0 };
            }
            ratingSums[r.question_id].total += r.rating;
            ratingSums[r.question_id].count += 1;
        });
    });

    return mockQuestions.map(q => {
        const sum = ratingSums[q.id];
        return {
            name: q.text,
            averageRating: sum ? sum.total / sum.count : 0,
            fill: sum ? (sum.total/sum.count >= 4 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))") : "hsl(var(--muted))"
        };
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [feedback]);


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
                tickFormatter={(value) => value.split(' ')[0]}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="averageRating" radius={8} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
