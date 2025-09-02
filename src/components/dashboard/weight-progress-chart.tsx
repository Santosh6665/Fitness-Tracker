
"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const progressData = [
  { month: "Jan", weight: 0 },
  { month: "Feb", weight: -1 },
  { month: "Mar", weight: -1.5 },
  { month: "Apr", weight: -2.5 },
  { month: "May", weight: -3.5 },
  { month: "Jun", weight: -4 },
];

const chartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function WeightProgressChart({ userWeight }: { userWeight?: number }) {
  const chartData = progressData.map(item => ({
    ...item,
    weight: userWeight ? userWeight + item.weight : 75 + item.weight,
  }));
  
  const minWeight = Math.min(...chartData.map(d => d.weight));
  const maxWeight = Math.max(...chartData.map(d => d.weight));

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <AreaChart
        accessibilityLayer
        data={chartData}
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
          domain={[Math.floor(minWeight - 2), Math.ceil(maxWeight + 2)]}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Area
          dataKey="weight"
          type="natural"
          fill="var(--color-weight)"
          fillOpacity={0.4}
          stroke="var(--color-weight)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
