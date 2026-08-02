import { DocumentList } from "@/features/docs/components/DocumentList";
import { CreateDocumentButton } from "@/features/docs/components/CreateDocumentButton";
import { Document } from "@/features/docs/types";

async function getDocuments(): Promise<Document[]> {
  return [
    { id: "1", title: "Architecture Guide 1", summary: "Detailed technical specifications for the AEOS platform deployment." },
    { id: "2", title: "Architecture Guide 2", summary: "Detailed technical specifications for the AEOS platform deployment." },
    { id: "3", title: "Architecture Guide 3", summary: "Detailed technical specifications for the AEOS platform deployment." },
    { id: "4", title: "Architecture Guide 4", summary: "Detailed technical specifications for the AEOS platform deployment." },
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
