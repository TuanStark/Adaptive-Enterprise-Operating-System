"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, CheckSquare, FileText, Users, TrendingUp, GitMerge, Bell, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useWorkspaceAnalytics } from "../hooks/useAnalytics";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import type { Notification } from "@/features/notifications/types";

// ── Chart data — not returned by BE analytics endpoint, kept as static visualization ──
const velocityData = [
  { name: "Mon", tasks: 12, completed: 8 },
  { name: "Tue", tasks: 15, completed: 11 },
  { name: "Wed", tasks: 9, completed: 7 },
  { name: "Thu", tasks: 18, completed: 14 },
  { name: "Fri", tasks: 22, completed: 19 },
  { name: "Sat", tasks: 6, completed: 5 },
  { name: "Sun", tasks: 3, completed: 2 },
];

const burndownData = [
  { day: "Day 1", remaining: 42, ideal: 42 },
  { day: "Day 2", remaining: 39, ideal: 39 },
  { day: "Day 3", remaining: 36, ideal: 36 },
  { day: "Day 4", remaining: 34, ideal: 33 },
  { day: "Day 5", remaining: 30, ideal: 30 },
  { day: "Day 6", remaining: 28, ideal: 27 },
  { day: "Day 7", remaining: 23, ideal: 24 },
  { day: "Day 8", remaining: 22, ideal: 21 },
  { day: "Day 9", remaining: 18, ideal: 18 },
  { day: "Day 10", remaining: 14, ideal: 15 },
];

interface MetricConfig {
  title: string;
  key: keyof MetricValues;
  icon: typeof Folder;
  color: string;
  bg: string;
}

interface MetricValues {
  totalProjects: number;
  totalTasks: number;
  totalDocuments: number;
  totalMembers: number;
}

const METRIC_CONFIGS: MetricConfig[] = [
  { title: "Total Projects", key: "totalProjects", icon: Folder, color: "text-blue-500", bg: "bg-blue-100" },
  { title: "Active Tasks", key: "totalTasks", icon: CheckSquare, color: "text-indigo-500", bg: "bg-indigo-100" },
  { title: "Documents", key: "totalDocuments", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-100" },
  { title: "Team Members", key: "totalMembers", icon: Users, color: "text-amber-500", bg: "bg-amber-100" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DashboardOverview() {
  const workspaceId = useAppStore((s) => s.activeWorkspaceId);
  const { data: analytics, isLoading: analyticsLoading } = useWorkspaceAnalytics(workspaceId);
  const { data: notificationsData } = useNotifications(1, 5);

  const metricValues: MetricValues = {
    totalProjects: analytics?.totalProjects ?? 0,
    totalTasks: analytics?.totalTasks ?? 0,
    totalDocuments: 0, // Not in analytics response
    totalMembers: analytics?.totalMembers ?? 0,
  };

  const notifications = notificationsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here is your workspace overview.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {METRIC_CONFIGS.map((metric, i) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow border-0 shadow-sm overflow-hidden relative">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {analyticsLoading ? "—" : metricValues[metric.key]}
                    </p>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl ${metric.bg} ${metric.color}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Task Velocity Chart */}
        <Card className="lg:col-span-4 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Task Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTasks)" name="Created" />
                  <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sprint Burndown */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-800">Sprint Burndown</CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-semibold">ACTIVE</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={burndownData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 2px 8px rgb(0 0 0 / 0.08)', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="ideal" stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Ideal" />
                  <Area type="monotone" dataKey="remaining" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#burnGrad)" name="Remaining" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications from API */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-800">Recent Notifications</CardTitle>
            <span className="text-xs text-primary hover:text-primary/80 font-medium cursor-pointer flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No recent notifications</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${!notif.read ? "bg-primary/[0.03] hover:bg-primary/[0.06]" : "hover:bg-gray-50"}`}>
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${!notif.read ? "bg-primary/10" : "bg-gray-100"}`}>
                    <Bell className={`w-3.5 h-3.5 ${!notif.read ? "text-primary" : "text-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notif.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                        {notif.title}
                      </p>
                      {!notif.read && <span className="mt-1.5 w-2 h-2 bg-primary rounded-full shrink-0" />}
                    </div>
                    {notif.content && <p className="text-xs text-gray-500 mt-0.5">{notif.content}</p>}
                    <p className="text-[11px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
