"use client"

import { Line, LineChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"

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
  { semester: "Spring 2022", rating: 4.1 },
  { semester: "Fall 2022", rating: 4.0 },
  { semester: "Spring 2023", rating: 4.2 },
  { semester: "Fall 2023", rating: 4.3 },
  { semester: "Spring 2024", rating: 4.4 },
]

export function TrendChart() {
  return (
    <ChartContainer config={{}} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="semester"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.replace(" 20", "'")}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="rating"
            type="monotone"
            stroke="hsl(var(--accent))"
            strokeWidth={3}
            dot={{
              r: 6,
              fill: "hsl(var(--accent))",
            }}
            activeDot={{
              r: 8,
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
