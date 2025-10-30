"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { department: "Computer Science", rating: 4.5, fill: "hsl(var(--chart-1))" },
  { department: "Electronics", rating: 4.2, fill: "hsl(var(--chart-2))" },
  { department: "Mechanical", rating: 4.1, fill: "hsl(var(--chart-1))" },
  { department: "Civil", rating: 3.9, fill: "hsl(var(--chart-2))" },
  { department: "Biotechnology", rating: 4.6, fill: "hsl(var(--chart-1))" },
]

export function AvgRatingByDeptChart() {
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
            />
             <YAxis domain={[3, 5]} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="rating" radius={8} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
