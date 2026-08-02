"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, CheckSquare, FileText, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const data = [
  { name: "Mon", tasks: 4000, completed: 2400 },
  { name: "Tue", tasks: 3000, completed: 1398 },
  { name: "Wed", tasks: 2000, completed: 9800 },
  { name: "Thu", tasks: 2780, completed: 3908 },
  { name: "Fri", tasks: 1890, completed: 4800 },
  { name: "Sat", tasks: 2390, completed: 3800 },
  { name: "Sun", tasks: 3490, completed: 4300 },
];

const metrics = [
  { title: "Total Projects", value: "12", icon: Folder, color: "text-blue-500", bg: "bg-blue-100" },
  { title: "Active Tasks", value: "148", icon: CheckSquare, color: "text-indigo-500", bg: "bg-indigo-100" },
  { title: "Documents", value: "32", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-100" },
  { title: "Team Members", value: "8", icon: Users, color: "text-amber-500", bg: "bg-amber-100" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, Tony! Here is your workspace overview.</p>
      </div>

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
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-2xl ${metric.bg} ${metric.color}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-5 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Task Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary/40 ring-4 ring-primary/10"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">Task Update</p>
                    <p className="text-xs text-gray-500">Peter Parker completed "Design API Schema"</p>
                    <p className="text-[10px] text-gray-400">2 hours ago</p>
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
