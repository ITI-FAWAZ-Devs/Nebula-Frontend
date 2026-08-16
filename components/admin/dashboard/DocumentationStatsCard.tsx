"use client";

import { Cell, Pie, PieChart } from "recharts";
import { FileText } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardStats } from "@/hooks/use-admin";
import {
  DashboardSection,
  DashboardSectionEmpty,
  ProgressBar,
} from "./DashboardSection";

const chartConfig = {
  successful: { label: "Successful", color: "var(--color-emerald-400)" },
  failed: { label: "Failed", color: "var(--color-rose-400)" },
  inProgress: { label: "In progress", color: "var(--color-amber-400)" },
} satisfies ChartConfig;

export function DocumentationStatsCard({ stats }: { stats: DashboardStats }) {
  const inProgressJobs = Math.max(
    stats.totalDocumentationJobs -
      stats.successfulDocumentationJobs -
      stats.failedDocumentationJobs,
    0
  );

  const successRate =
    stats.totalDocumentationJobs > 0
      ? Math.round(
          (stats.successfulDocumentationJobs / stats.totalDocumentationJobs) *
            100
        )
      : 0;
  const failedRate =
    stats.totalDocumentationJobs > 0
      ? Math.round(
          (stats.failedDocumentationJobs / stats.totalDocumentationJobs) * 100
        )
      : 0;
  const inProgressRate = Math.max(100 - successRate - failedRate, 0);

  const data = [
    {
      name: "successful",
      value: stats.successfulDocumentationJobs,
      fill: "var(--color-emerald-400)",
    },
    {
      name: "failed",
      value: stats.failedDocumentationJobs,
      fill: "var(--color-rose-400)",
    },
    {
      name: "inProgress",
      value: inProgressJobs,
      fill: "var(--color-amber-400)",
    },
  ];

  return (
    <DashboardSection
      title="Documentation"
      description="Generation job outcomes"
      icon={FileText}
    >
      {stats.totalDocumentationJobs === 0 ? (
        <DashboardSectionEmpty
          icon={FileText}
          title="No documentation jobs yet"
          description="Documentation job outcomes will appear here once generation starts."
        />
      ) : (
        <>
          <div className="flex min-h-0 flex-1 flex-col justify-center">
            <div className="relative mx-auto aspect-square min-h-[170px] w-full max-w-[240px] max-h-[210px]">
              <ChartContainer
                config={chartConfig}
                className="absolute inset-0"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="62%"
                    outerRadius="92%"
                    paddingAngle={2}
                    cornerRadius={4}
                    strokeWidth={0}
                  >
                    {data
                      .filter((entry) => entry.value > 0)
                      .map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
                <span className="font-display text-2xl font-semibold tracking-tight text-white tabular-nums">
                  {stats.totalDocumentationJobs.toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Jobs
                </span>
                <span className="font-mono text-xs font-medium text-emerald-400 tabular-nums">
                  {successRate}% success
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-4">
            <ProgressBar
              label="Successful"
              value={successRate}
              color="var(--color-emerald-400)"
              hint={`${stats.successfulDocumentationJobs.toLocaleString()} · ${successRate}%`}
            />
            <ProgressBar
              label="Failed"
              value={failedRate}
              color="var(--color-rose-400)"
              hint={`${stats.failedDocumentationJobs.toLocaleString()} · ${failedRate}%`}
            />
            <ProgressBar
              label="In progress"
              value={inProgressRate}
              color="var(--color-amber-400)"
              hint={`${inProgressJobs.toLocaleString()} · ${inProgressRate}%`}
            />
          </div>
        </>
      )}
    </DashboardSection>
  );
}
