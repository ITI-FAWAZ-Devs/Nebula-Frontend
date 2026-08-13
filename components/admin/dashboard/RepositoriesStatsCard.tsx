"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts";
import { FolderGit2 } from "lucide-react";
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
} from "./DashboardSection";
import { MiniStat } from "./StatsCard";

const REPO_COLOR = "#a78bfa";
const JOBS_COLOR = "#fbbf24";

const chartConfig = {
  Count: { label: "Count" },
} satisfies ChartConfig;

export function RepositoriesStatsCard({ stats }: { stats: DashboardStats }) {
  const avgJobsPerRepo =
    stats.totalImportedRepositories > 0
      ? (stats.totalDocumentationJobs / stats.totalImportedRepositories).toFixed(2)
      : "0.00";

  const data = [
    {
      name: "repositories",
      label: "Repositories",
      value: stats.totalImportedRepositories,
      fill: REPO_COLOR,
    },
    {
      name: "docJobs",
      label: "Doc jobs",
      value: stats.totalDocumentationJobs,
      fill: JOBS_COLOR,
    },
  ];

  return (
    <DashboardSection
      title="Repositories"
      description="Imported codebases vs documentation generated"
      icon={FolderGit2}
    >
      {stats.totalImportedRepositories === 0 ? (
        <DashboardSectionEmpty
          icon={FolderGit2}
          title="No repositories yet"
          description="Imported codebases will appear here once repositories are connected."
        />
      ) : (
        <>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto min-h-[200px] w-full"
          >
            <BarChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar
                dataKey="value"
                name="Count"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat
              label="Repositories"
              value={stats.totalImportedRepositories}
              color={REPO_COLOR}
            />
            <MiniStat
              label="Doc jobs"
              value={stats.totalDocumentationJobs}
              color={JOBS_COLOR}
            />
            <MiniStat label="Avg jobs / repo" value={avgJobsPerRepo} />
          </div>
        </>
      )}
    </DashboardSection>
  );
}
