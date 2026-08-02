"use client";

import { Button } from "@/components/ui/button";

export function CreateDocumentButton() {
  return (
    <Button 
      className="rounded-full bg-primary hover:bg-primary/90"
      onClick={() => {
        console.log("Open Create Document Modal");
      }}
    >
      Create Document
    </Button>
  );
}
