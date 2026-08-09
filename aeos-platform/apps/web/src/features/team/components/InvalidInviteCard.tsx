"use client";

import { useRouter } from "next/navigation";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface InvalidInviteCardProps {
  message?: string;
}

export function InvalidInviteCard({ message = "The invitation link is missing a token or is invalid." }: InvalidInviteCardProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg border-red-100">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <XCircle className="w-5 h-5" /> Invalid Link
          </CardTitle>
          <CardDescription className="pt-1 text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/")}>
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
