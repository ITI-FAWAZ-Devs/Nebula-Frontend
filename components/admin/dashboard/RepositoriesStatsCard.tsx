"use client";

import { useId } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
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

const ACTIVITY_MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"] as const;
const REPO_WEIGHTS = [0.18, 0.22, 0.16, 0.2, 0.12, 0.12];
const JOB_WEIGHTS = [0.12, 0.16, 0.18, 0.2, 0.16, 0.18];

const chartConfig = {
  repos: { label: "Repositories", color: "var(--color-purple-400)" },
  jobs: { label: "Doc jobs", color: "var(--color-amber-400)" },
} satisfies ChartConfig;

function buildRepoActivity(repos: number, jobs: number) {
  return ACTIVITY_MONTHS.map((month, index) => ({
    month,
    repos: Math.max(Math.round(repos * REPO_WEIGHTS[index]), 0),
    jobs: Math.max(Math.round(jobs * JOB_WEIGHTS[index]), 0),
  }));
}

export function RepositoriesStatsCard({ stats }: { stats: DashboardStats }) {
  const gradientId = useId();
  const reposGradientId = `repo-fill-${gradientId}`;
  const avgJobsPerRepo =
    stats.totalImportedRepositories > 0
      ? (stats.totalDocumentationJobs / stats.totalImportedRepositories).toFixed(2)
      : "0.00";

  const data = buildRepoActivity(
    stats.totalImportedRepositories,
    stats.totalDocumentationJobs
  );

  return (
    <DashboardSection
      title="Repositories"
      description="Imports vs documentation jobs per month"
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
            className="aspect-auto min-h-[220px] w-full flex-1"
          >
            <ComposedChart data={data} accessibilityLayer margin={{ top: 4, left: 0, right: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={reposGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-repos)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--color-repos)" stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={30}
                allowDecimals={false}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar
                dataKey="repos"
                name="repos"
                fill={`url(#${reposGradientId})`}
                radius={[4, 4, 0, 0]}
                maxBarSize={26}
              />
              <Line
                dataKey="jobs"
                name="jobs"
                type="monotone"
                stroke="var(--color-jobs)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-jobs)", strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </ChartContainer>

          <div className="mt-3 flex items-center justify-center gap-5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-[3px]"
                style={{ backgroundColor: "var(--color-purple-400)" }}
              />
              Repositories
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: "var(--color-amber-400)" }}
              />
              Doc jobs
            </span>
          </div>

          <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
            <MiniStat
              label="Repositories"
              value={stats.totalImportedRepositories}
              color="var(--color-purple-400)"
            />
            <MiniStat
              label="Doc jobs"
              value={stats.totalDocumentationJobs}
              color="var(--color-amber-400)"
            />
            <MiniStat label="Avg jobs / repo" value={avgJobsPerRepo} />
          </div>
        </>
      )}
    </DashboardSection>
  );
}
