import { notFound } from "next/navigation";
import { getDocument, getFileUrl } from "@/features/docs/api/queries";
import { getSessionContext } from "@/lib/api-server";
import { DocumentEditor } from "@/features/docs/components/DocumentEditor";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workspaceId } = await getSessionContext();

  const document = await getDocument(id, workspaceId);

  if (!document) {
    notFound();
  }

  let initialContent = "";
  if (document.versions && document.versions.length > 0) {
    const latestVersion = document.versions.sort((a, b) => b.versionNumber - a.versionNumber)[0];
    const fileUrl = await getFileUrl(latestVersion.fileId);
    if (fileUrl) {
      try {
        const res = await fetch(fileUrl);
        if (res.ok) {
          initialContent = await res.text();
        }
      } catch (err) {
        console.error("Failed to fetch document content from file url", err);
      }
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">{document.name}</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
            Visibility: {document.visibility} &bull; Versions: {document.versionCount} &bull; Created: {new Date(document.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 min-h-[500px]">
          <DocumentEditor documentId={document.id} initialContent={initialContent} />
        </div>
      </div>
    </div>
  );
}
