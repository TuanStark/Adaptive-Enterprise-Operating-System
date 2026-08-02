"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Team</h1>
          <p className="text-gray-500">Manage members and permissions.</p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-primary/90">Invite Member</Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Members (4)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Tony Stark', 'Peter Parker', 'Bruce Banner', 'Natasha Romanoff'].map((name, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                    <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{i === 0 ? 'Admin' : 'Member'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-500">Edit</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
