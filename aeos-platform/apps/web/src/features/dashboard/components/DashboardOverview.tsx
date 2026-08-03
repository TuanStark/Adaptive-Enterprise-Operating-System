"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, CheckSquare, FileText, Users, TrendingUp, GitMerge, Bell, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

// ── Mock Analytics Data (aligned with GET /analytics/workspace) ──
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

const metrics = [
  { title: "Total Projects", value: "12", change: "+2", icon: Folder, color: "text-blue-500", bg: "bg-blue-100", trend: "up" },
  { title: "Active Tasks", value: "148", change: "+23", icon: CheckSquare, color: "text-indigo-500", bg: "bg-indigo-100", trend: "up" },
  { title: "Documents", value: "32", change: "+5", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-100", trend: "up" },
  { title: "Team Members", value: "8", change: "0", icon: Users, color: "text-amber-500", bg: "bg-amber-100", trend: "flat" },
];

// ── Mock Sprint Progress ──
const activeSprint = {
  name: "SCRUM Sprint 1",
  progress: 65,
  daysLeft: 9,
  totalTasks: 12,
  completedTasks: 8,
};

// ── Mock Recent Notifications ──
const recentNotifications = [
  { id: "1", title: "New task assigned", content: "\"Setup CI/CD Pipeline\" assigned to you", time: "12m ago", unread: true },
  { id: "2", title: "Comment on your task", content: "Bruce Banner commented on CQRS task", time: "45m ago", unread: true },
  { id: "3", title: "Sprint started", content: "SCRUM Sprint 1 has been started", time: "5h ago", unread: false },
];

// ── Mock Activity Feed ──
const recentActivity = [
  { user: "Peter Parker", action: "completed", target: "Design API Schema", time: "2 hours ago", type: "task" },
  { user: "Bruce Banner", action: "commented on", target: "Implement CQRS Pattern", time: "3 hours ago", type: "comment" },
  { user: "Tony Stark", action: "created sprint", target: "SCRUM Sprint 2", time: "5 hours ago", type: "sprint" },
  { user: "Peter Parker", action: "moved to REVIEW", target: "Setup Database Migrations", time: "6 hours ago", type: "task" },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, Tony! Here is your workspace overview.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
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
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    {metric.change !== "0" && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> {metric.change}
                      </span>
                    )}
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
                <AreaChart
                  data={velocityData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTasks)" name="Created" />
                  <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sprint Progress */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-800">Sprint Progress</CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-semibold">ACTIVE</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-indigo-500" /> {activeSprint.name}
                </span>
                <span className="text-sm text-gray-500">{activeSprint.daysLeft}d left</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${activeSprint.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-xs text-gray-500">
                <span>{activeSprint.completedTasks}/{activeSprint.totalTasks} tasks</span>
                <span className="font-semibold text-gray-700">{activeSprint.progress}%</span>
              </div>
            </div>

            {/* Sprint Burndown Mini */}
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={burndownData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className={`w-2 h-2 mt-2 rounded-full ring-4 shrink-0 ${
                    item.type === "comment" ? "bg-amber-400 ring-amber-100" :
                    item.type === "sprint" ? "bg-indigo-400 ring-indigo-100" :
                    "bg-primary/40 ring-primary/10"
                  }`}></div>
                  <div className="space-y-0.5">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{item.user}</span>{" "}
                      <span className="text-gray-500">{item.action}</span>{" "}
                      <span className="font-medium text-gray-700">&quot;{item.target}&quot;</span>
                    </p>
                    <p className="text-[11px] text-gray-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
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
            <div className="space-y-4">
              {recentNotifications.map((notif) => (
                <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${notif.unread ? "bg-primary/[0.03] hover:bg-primary/[0.06]" : "hover:bg-gray-50"}`}>
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${notif.unread ? "bg-primary/10" : "bg-gray-100"}`}>
                    <Bell className={`w-3.5 h-3.5 ${notif.unread ? "text-primary" : "text-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${notif.unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                        {notif.title}
                      </p>
                      {notif.unread && <span className="mt-1.5 w-2 h-2 bg-primary rounded-full shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{notif.content}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
