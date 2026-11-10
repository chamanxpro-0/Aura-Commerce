"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { REVENUE_TREND, CATEGORY_SPLIT } from "@/data/mockData";

export function AnalyticsDashboard() {
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);

  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const conversion = 3.84;
  const activeUsers = 1284;

  const sparkData = REVENUE_TREND.slice(-14).map((d) => ({ day: d.day, revenue: d.revenue }));

  const kpis = [
    {
      label: "Total Revenue",
      value: `$${(totalRevenue + 48210).toLocaleString()}`,
      delta: +12.4,
      icon: DollarSign,
      data: sparkData.map((d) => d.revenue),
    },
    {
      label: "Orders",
      value: String(totalOrders + 218),
      delta: +8.1,
      icon: ShoppingBag,
      data: REVENUE_TREND.slice(-14).map((d) => d.orders),
    },
    {
      label: "Conversion Rate",
      value: `${conversion}%`,
      delta: +0.6,
      icon: TrendingUp,
      data: [2.1, 2.4, 2.2, 2.8, 3.0, 2.9, 3.2, 3.1, 3.4, 3.6, 3.8, 3.84],
    },
    {
      label: "Active Users",
      value: activeUsers.toLocaleString(),
      delta: -2.3,
      icon: Users,
      data: [980, 1020, 1100, 1050, 1180, 1240, 1210, 1284],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight font-display">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          A live view of your storefront performance · last 30 days
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold/10 text-gold">
                    <k.icon className="h-3.5 w-3.5" />
                  </span>
                  {k.label}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="mt-3 text-2xl font-bold tracking-tight"
                >
                  {k.value}
                </motion.div>
              </div>
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  k.delta >= 0
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                }`}
              >
                {k.delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(k.delta)}%
              </span>
            </div>
            <div className="mt-3 h-10">
              <Sparkline data={k.data} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Revenue trend</h3>
              <p className="text-xs text-muted-foreground">Daily gross revenue</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Activity className="h-3 w-3" /> Live
            </span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--popover-foreground)",
                  }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <h3 className="text-sm font-semibold">Sales by category</h3>
          <p className="text-xs text-muted-foreground">Share of revenue</p>
          <div className="mt-2 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATEGORY_SPLIT} dataKey="value" nameKey="name" innerRadius={42} outerRadius={66} paddingAngle={3} stroke="none">
                  {CATEGORY_SPLIT.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => `${v}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {CATEGORY_SPLIT.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                  {c.name}
                </span>
                <span className="font-medium">{c.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* orders bar chart + top products */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <h3 className="text-sm font-semibold">Orders per day</h3>
          <p className="text-xs text-muted-foreground">Last 14 days</p>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_TREND.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="orders" fill="var(--gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-5 lg:col-span-2"
        >
          <h3 className="text-sm font-semibold">Top performing products</h3>
          <p className="text-xs text-muted-foreground">By units sold</p>
          <div className="mt-4 space-y-3">
            {[...products]
              .sort((a, b) => b.sales - a.sales)
              .slice(0, 5)
              .map((p, i) => {
                const max = Math.max(...products.map((x) => x.sales));
                const pct = (p.sales / max) * 100;
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-4 text-xs font-semibold text-muted-foreground">{i + 1}</span>
                    <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-border" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground">{p.sales} sold</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.05 }}
                          className="h-full gold-gradient"
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold">{p.currency}{p.price}</span>
                  </div>
                );
              })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <defs>
          <linearGradient id="aura-sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke="var(--gold)" strokeWidth={2} fill="var(--gold)" fillOpacity={0.18} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
