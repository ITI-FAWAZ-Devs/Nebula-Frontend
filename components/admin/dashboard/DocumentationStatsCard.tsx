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

const SUCCESS_COLOR = "#34d399";
const FAILED_COLOR = "#f87171";
const IN_PROGRESS_COLOR = "#fbbf24";

const chartConfig = {
  successful: { label: "Successful", color: SUCCESS_COLOR },
  failed: { label: "Failed", color: FAILED_COLOR },
  inProgress: { label: "In progress", color: IN_PROGRESS_COLOR },
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
      fill: SUCCESS_COLOR,
    },
    { name: "failed", value: stats.failedDocumentationJobs, fill: FAILED_COLOR },
    { name: "inProgress", value: inProgressJobs, fill: IN_PROGRESS_COLOR },
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
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[220px] min-h-[180px]"
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                strokeWidth={5}
              >
                {data
                  .filter((entry) => entry.value > 0)
                  .map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="mt-4 flex flex-col gap-3">
            <ProgressBar
              label="Successful"
              value={successRate}
              color={SUCCESS_COLOR}
              hint={`${stats.successfulDocumentationJobs.toLocaleString()} · ${successRate}%`}
            />
            <ProgressBar
              label="Failed"
              value={failedRate}
              color={FAILED_COLOR}
              hint={`${stats.failedDocumentationJobs.toLocaleString()} · ${failedRate}%`}
            />
            <ProgressBar
              label="In progress"
              value={inProgressRate}
              color={IN_PROGRESS_COLOR}
              hint={`${inProgressJobs.toLocaleString()} · ${inProgressRate}%`}
            />
          </div>
        </>
      )}
    </DashboardSection>
  );
}
