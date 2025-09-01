"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { progressData } from "@/lib/data";

const chartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--chart-1))",
  },
  squat: {
    label: "Squat (kg)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ProgressChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <LineChart
        accessibilityLayer
        data={progressData}
        margin={{
          left: 12,
          right: 12,
          top: 5,
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
          yAxisId="left"
          stroke="hsl(var(--chart-1))"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickCount={6}
          domain={['dataMin - 5', 'dataMax + 5']}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="hsl(var(--chart-2))"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickCount={6}
          domain={['dataMin - 10', 'dataMax + 10']}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Line
          dataKey="weight"
          type="monotone"
          stroke="var(--color-weight)"
          strokeWidth={2}
          dot={true}
          yAxisId="left"
        />
        <Line
          dataKey="squat"
          type="monotone"
          stroke="var(--color-squat)"
          strokeWidth={2}
          dot={true}
          yAxisId="right"
        />
      </LineChart>
    </ChartContainer>
  );
}
