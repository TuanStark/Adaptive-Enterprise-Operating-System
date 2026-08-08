import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, FileText, Globe, Lock, Users, Clock, History } from "lucide-react";
import { getDocument, getFileUrl } from "@/features/docs/api/queries";
import { getSessionContext } from "@/lib/api-server";
import { DocumentEditor } from "@/features/docs/components/DocumentEditor";
import { formatDistanceToNow } from "date-fns";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workspaceId } = await getSessionContext();

  const document = await getDocument(id, workspaceId);

  if (!document) {
    notFound();
  }

  let initialContent = "";
  if (document.versions && document.versions.length > 0) {
    const latestVersion = [...document.versions].sort((a, b) => b.versionNumber - a.versionNumber)[0];
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

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC": return <Globe className="w-4 h-4" />;
      case "INTERNAL": return <Users className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 flex bg-gray-50/50 dark:bg-zinc-950/50 min-h-screen">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar / Breadcrumbs */}
        <header className="h-14 border-b border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-10 flex items-center px-6 gap-2 text-sm text-gray-500 dark:text-zinc-400">
          <Link href="/docs" className="hover:text-gray-900 dark:hover:text-zinc-100 flex items-center gap-1.5 transition-colors">
            <FileText className="w-4 h-4" />
            Documents
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-gray-900 dark:text-zinc-100 truncate max-w-[300px]">
            {document.name}
          </span>
        </header>

        {/* Editor Container */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto py-8 px-6 lg:px-8">
            <div className="mb-8">
              <input 
                type="text" 
                defaultValue={document.name}
                className="w-full text-4xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 bg-transparent border-0 outline-none p-0 focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-zinc-700"
                placeholder="Document Title"
                readOnly
              />
            </div>
            
            <div className="min-h-[500px]">
              <DocumentEditor documentId={document.id} initialContent={initialContent} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Metadata) */}
      <aside className="w-80 border-l border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex-shrink-0 flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            Document Info
          </h3>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-zinc-400">Visibility</span>
              <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-zinc-300">
                {getVisibilityIcon(document.visibility)}
                <span className="capitalize">{document.visibility.toLowerCase()}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-zinc-400">Created</span>
              <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-zinc-300">
                <Clock className="w-4 h-4 text-gray-400" />
                {new Date(document.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/50">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-zinc-100 uppercase tracking-wider mb-3 flex items-center gap-2">
              <History className="w-4 h-4" />
              Version History
            </h4>
            <div className="space-y-3">
              {[...document.versions]
                .sort((a, b) => b.versionNumber - a.versionNumber)
                .map((version, index) => (
                <div key={version.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${index === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-zinc-300'}`}>
                      Version {version.versionNumber} {index === 0 && '(Latest)'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">
                    {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
