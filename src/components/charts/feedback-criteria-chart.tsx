
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis } from "recharts"
import type { Feedback, Question } from "@/lib/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirebase } from "@/firebase/provider";
import { collection } from "firebase/firestore";

interface FeedbackCriteriaChartProps {
    feedback: Feedback[];
}

export function FeedbackCriteriaChart({ feedback }: FeedbackCriteriaChartProps) {
  const { firestore } = useFirebase();
  const { data: questions } = useCollection<Question>(collection(firestore, 'questions'));

  const chartData = useMemo(() => {
    if (!questions || feedback.length === 0) {
      return (questions || []).map(q => ({ name: q.text, averageRating: 0, fill: "hsl(var(--muted))" }));
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

    return questions.map(q => {
        const sum = ratingSums[q.id];
        const averageRating = sum ? sum.total / sum.count : 0;
        return {
            name: q.text,
            averageRating: parseFloat(averageRating.toFixed(2)),
            fill: averageRating >= 4 ? "hsl(var(--chart-1))" : averageRating > 0 ? "hsl(var(--chart-2))" : "hsl(var(--muted))"
        };
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [feedback, questions]);

  if(feedback.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No feedback has been submitted for this subject yet.</div>
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
                tickFormatter={(value) => value.split(' ')[0]}
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
