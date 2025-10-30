"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const topData = [
  { name: "Dr. Reed", rating: 4.8, fill: "hsl(var(--chart-1))" },
  { name: "Prof. Black", rating: 4.7, fill: "hsl(var(--chart-1))" },
  { name: "Dr. Alpha", rating: 4.65, fill: "hsl(var(--chart-1))" },
  { name: "Prof. Beta", rating: 4.6, fill: "hsl(var(--chart-1))" },
  { name: "Dr. Gamma", rating: 4.55, fill: "hsl(var(--chart-1))" },
]

const bottomData = [
  { name: "Dr. Zeta", rating: 3.2, fill: "hsl(var(--chart-2))" },
  { name: "Prof. Epsilon", rating: 3.4, fill: "hsl(var(--chart-2))" },
  { name: "Dr. Delta", rating: 3.5, fill: "hsl(var(--chart-2))" },
  { name: "Prof. Chi", rating: 3.6, fill: "hsl(var(--chart-2))" },
  { name: "Dr. Psi", rating: 3.7, fill: "hsl(var(--chart-2))" },
]

interface FacultyOutliersChartProps {
  type: "top" | "bottom"
}

export function FacultyOutliersChart({ type }: FacultyOutliersChartProps) {
  const data = type === "top" ? topData : bottomData;
  const domain: [number, number] = type === "top" ? [4.5, 5] : [3, 4];
  
  return (
    <ChartContainer config={{}} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: -10 }}>
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            tickMargin={5}
            width={80}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="rating" radius={5} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
