"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts";
import { Users } from "lucide-react";
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

const ACTIVE_COLOR = "#4493F8";
const PENDING_COLOR = "#94a3b8";

const chartConfig = {
  Users: { label: "Users" },
} satisfies ChartConfig;

export function UsersStatsCard({ stats }: { stats: DashboardStats }) {
  const pendingUsers = Math.max(stats.totalUsers - stats.activeUsers, 0);
  const activeRate =
    stats.totalUsers > 0
      ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
      : 0;

  const data = [
    {
      name: "active",
      label: "Active",
      value: stats.activeUsers,
      fill: ACTIVE_COLOR,
    },
    {
      name: "pending",
      label: "Pending",
      value: pendingUsers,
      fill: PENDING_COLOR,
    },
  ];

  return (
    <DashboardSection
      title="Users"
      description="Registered accounts vs verified"
      icon={Users}
    >
      {stats.totalUsers === 0 ? (
        <DashboardSectionEmpty
          icon={Users}
          title="No users yet"
          description="User registrations will appear here once accounts are created."
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
                name="Users"
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
            <MiniStat label="Total users" value={stats.totalUsers} />
            <MiniStat label="Active" value={stats.activeUsers} color={ACTIVE_COLOR} />
            <MiniStat label="Pending" value={pendingUsers} color={PENDING_COLOR} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {activeRate}% of accounts have a verified email.
          </p>
        </>
      )}
    </DashboardSection>
  );
}
