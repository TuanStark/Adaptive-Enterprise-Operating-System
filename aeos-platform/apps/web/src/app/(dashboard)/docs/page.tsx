import { DocumentList } from "@/features/docs/components/DocumentList";
import { CreateDocumentButton } from "@/features/docs/components/CreateDocumentButton";
import { Document } from "@/features/docs/types";

async function getDocuments(): Promise<Document[]> {
  return [
    { id: "1", name: "Architecture Guide", ownerId: "user-1", visibility: "INTERNAL", versionCount: 3, createdAt: "2026-07-15T10:00:00Z" },
    { id: "2", name: "API Reference", ownerId: "user-1", visibility: "PUBLIC", versionCount: 2, createdAt: "2026-07-20T10:00:00Z" },
    { id: "3", name: "Deployment Runbook", ownerId: "user-2", visibility: "PRIVATE", versionCount: 1, createdAt: "2026-07-25T10:00:00Z" },
    { id: "4", name: "Team Onboarding", ownerId: "user-3", visibility: "INTERNAL", versionCount: 5, createdAt: "2026-07-28T10:00:00Z" },
  ];
}

export default async function DocsPage() {
  const documents = await getDocuments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Documents</h1>
          <p className="text-gray-500">Wiki and project documentation.</p>
        </div>
        <CreateDocumentButton />
      </div>

      <DocumentList documents={documents} />
    </div>
  );
}
