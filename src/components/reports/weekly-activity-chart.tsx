
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { WeeklyActivity } from "@/lib/data";

const chartConfig = {
  workouts: {
    label: "Workouts",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function WeeklyActivityChart({ data }: { data: WeeklyActivity }) {
  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] w-full"
      data-testid="weekly-activity-chart"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => (Number.isInteger(value) ? value : "")}
            allowDecimals={false}
            tickCount={Math.max(...data.map((d) => d.workouts)) + 1}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name) => (
                  <div className="flex flex-col">
                    <span className="font-bold">{`${value} ${name}`}</span>
                    {data.find(d => d.workouts === value) && (
                      <span className="text-xs text-muted-foreground">
                        {`Duration: ${data.find(d => d.workouts === value)?.duration} min`}
                      </span>
                    )}
                  </div>
                )}
              />
            }
          />
          <Bar
            dataKey="workouts"
            fill="var(--color-workouts)"
            radius={4}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
