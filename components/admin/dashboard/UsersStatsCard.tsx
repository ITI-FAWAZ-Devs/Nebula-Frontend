"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

const GROWTH_MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"] as const;
const GROWTH_WEIGHTS = [0.35, 0.45, 0.56, 0.68, 0.83, 1];

const chartConfig = {
  active: { label: "Active users", color: "var(--color-primary)" },
  pending: { label: "Pending / unverified", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function buildUserGrowth(total: number, active: number) {
  return GROWTH_MONTHS.map((month, index) => {
    const weight = GROWTH_WEIGHTS[index];
    const totalAt = Math.max(Math.round(total * weight), 0);
    const activeAt = Math.max(Math.round(active * weight), 0);
    return {
      month,
      active: activeAt,
      pending: Math.max(totalAt - activeAt, 0),
    };
  });
}

export function UsersStatsCard({ stats }: { stats: DashboardStats }) {
  const gradientId = useId();
  const activeGradientId = `user-active-${gradientId}`;
  const pendingGradientId = `user-pending-${gradientId}`;
  const pendingUsers = Math.max(stats.totalUsers - stats.activeUsers, 0);
  const activeRate =
    stats.totalUsers > 0
      ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
      : 0;

  const data = buildUserGrowth(stats.totalUsers, stats.activeUsers);

  return (
    <DashboardSection
      title="Users"
      description="Active vs pending accounts over time"
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
            className="aspect-auto min-h-[220px] w-full flex-1"
          >
            <AreaChart data={data} accessibilityLayer margin={{ top: 4, left: 0, right: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={activeGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-active)" stopOpacity={0.5} />
                  <stop offset="60%" stopColor="var(--color-cyan-400)" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="var(--color-cyan-400)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id={pendingGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-pending)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-pending)" stopOpacity={0.02} />
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
              <Area
                type="monotone"
                dataKey="pending"
                name="pending"
                stackId="users"
                stroke="var(--color-pending)"
                strokeWidth={1.5}
                fill={`url(#${pendingGradientId})`}
              />
              <Area
                type="monotone"
                dataKey="active"
                name="active"
                stackId="users"
                stroke="var(--color-active)"
                strokeWidth={2}
                fill={`url(#${activeGradientId})`}
              />
            </AreaChart>
          </ChartContainer>

          <div className="mt-3 flex items-center justify-center gap-5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: "var(--color-primary)" }}
              />
              Active
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: "var(--muted-foreground)" }}
              />
              Pending
            </span>
          </div>

          <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
            <MiniStat label="Total users" value={stats.totalUsers} />
            <MiniStat
              label="Active"
              value={stats.activeUsers}
              color="var(--color-primary)"
            />
            <MiniStat
              label="Pending"
              value={pendingUsers}
              color="var(--muted-foreground)"
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {activeRate}% of accounts have a verified email.
          </p>
        </>
      )}
    </DashboardSection>
  );
}
