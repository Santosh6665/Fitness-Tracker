
"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  ChartLegend,
  ChartLegendContent,
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
  calories: {
    label: "Calories/day",
    color: "hsl(var(--chart-3))",
  },
  workouts: {
    label: "Workouts/wk",
    color: "hsl(var(--chart-4))",
  }
} satisfies ChartConfig;

export function ProgressChart() {
  return (
    <ChartContainer config={chartConfig} className="lg:min-h-[300h] w-full">
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
          yAxisId="weight"
          stroke="var(--color-weight)"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickCount={6}
          domain={['dataMin - 5', 'dataMax + 5']}
        />
        <YAxis
          yAxisId="squat"
          orientation="right"
          stroke="var(--color-squat)"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickCount={6}
          domain={['dataMin - 10', 'dataMax + 10']}
        />
         <YAxis
          yAxisId="calories"
          orientation="left"
          stroke="var(--color-calories)"
          tickLine={false}
          axisLine={false}
          tickMargin={-20}
          tick={{ display: 'none' }}
          domain={['dataMin - 500', 'dataMax + 500']}
        />
         <YAxis
          yAxisId="workouts"
          orientation="right"
          stroke="var(--color-workouts)"
          tickLine={false}
          axisLine={false}
          tickMargin={-20}
          tick={{ display: 'none' }}
          domain={[0, 'dataMax + 1']}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="weight"
          type="monotone"
          stroke="var(--color-weight)"
          strokeWidth={2}
          dot={true}
          yAxisId="weight"
          name="Weight"
        />
        <Line
          dataKey="squat"
          type="monotone"
          stroke="var(--color-squat)"
          strokeWidth={2}
          dot={true}
          yAxisId="squat"
          name="Squat"
        />
        <Line
          dataKey="calories"
          type="monotone"
          stroke="var(--color-calories)"
          strokeWidth={2}
          dot={true}
          yAxisId="calories"
          name="Calories"
          strokeDasharray="3 3"
        />
        <Line
          dataKey="workouts"
          type="monotone"
          stroke="var(--color-workouts)"
          strokeWidth={2}
          dot={true}
          yAxisId="workouts"
          name="Workouts"
          strokeDasharray="3 3"
        />
      </LineChart>
    </ChartContainer>
  );
}
