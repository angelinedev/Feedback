
"use client"

import { Pie, PieChart, ResponsiveContainer } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react";

interface ResponseRateChartProps {
    submitted: number;
    total: number;
}

export function ResponseRateChart({ submitted, total }: ResponseRateChartProps) {
    const data = useMemo(() => [
        { name: "Submitted", value: submitted, fill: "hsl(var(--chart-1))" },
        { name: "Not Submitted", value: Math.max(0, total - submitted), fill: "hsl(var(--muted))" },
    ], [submitted, total]);
    
  return (
    <ChartContainer config={{}} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
            labelLine={false}
            label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                value,
                index,
              }) => {
                const RADIAN = Math.PI / 180
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                const x = cx + radius * Math.cos(-midAngle * RADIAN)
                const y = cy + radius * Math.sin(-midAngle * RADIAN)

                if (total === 0 || value === 0) return null;
      
                return (
                  <text
                    x={x}
                    y={y}
                    fill="hsl(var(--card-foreground))"
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                  >
                    {`${((value / total) * 100).toFixed(0)}%`}
                  </text>
                )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
