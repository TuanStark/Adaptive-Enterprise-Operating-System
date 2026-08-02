import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Document } from "../types";

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="hover:shadow-md transition-shadow border-0 shadow-sm cursor-pointer">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500 mb-2">
              <FileText className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base font-medium text-gray-800 mb-1">{doc.name}</CardTitle>
            <p className="text-xs text-gray-500 line-clamp-2">{doc.versionCount} version(s) · {doc.visibility.toLowerCase()}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
