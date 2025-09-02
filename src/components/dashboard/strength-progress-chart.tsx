
"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// This is static example data. In a real app, you'd fetch this.
const strengthData = [
  { month: "Jan", squat: 80, bench: 60 },
  { month: "Feb", squat: 85, bench: 65 },
  { month: "Mar", squat: 90, bench: 70 },
  { month: "Apr", squat: 95, bench: 72 },
  { month: "May", squat: 100, bench: 75 },
  { month: "Jun", squat: 105, bench: 80 },
];

const chartConfig = {
  squat: {
    label: "Squat (kg)",
    color: "hsl(var(--chart-1))",
  },
  bench: {
    label: "Bench (kg)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function StrengthProgressChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <LineChart
        accessibilityLayer
        data={strengthData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickCount={6}
          domain={['dataMin - 10', 'dataMax + 10']}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
          dataKey="squat"
          type="monotone"
          stroke="var(--color-squat)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="bench"
          type="monotone"
          stroke="var(--color-bench)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
