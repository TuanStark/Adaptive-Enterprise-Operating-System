"use client";

import { Button } from "@/components/ui/button";

export function CreateProjectButton() {
  return (
    <Button 
      className="rounded-full bg-primary hover:bg-primary/90"
      onClick={() => {
        // In a real app, this would open a modal or navigate to a creation page
        console.log("Open Create Project Modal");
      }}
    >
      New Project
    </Button>
  );
}
