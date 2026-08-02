import { Project } from "@/features/projects/types";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { CreateProjectButton } from "@/features/projects/components/CreateProjectButton";

async function getProjects(): Promise<Project[]> {
  return [
    {
      id: "proj-1", tenantId: "tenant-1", workspaceId: "ws-1",
      name: "Project Alpha", description: "A revolutionary new product for enterprise.",
      ownerId: "user-1", status: "ACTIVE", priority: "HIGH",
      startDate: "2026-07-01T00:00:00Z", endDate: "2026-12-31T00:00:00Z",
      members: [], createdAt: "2026-07-01T00:00:00Z", updatedAt: "2026-08-01T00:00:00Z",
    },
    {
      id: "proj-2", tenantId: "tenant-1", workspaceId: "ws-1",
      name: "Project Beta", description: "Internal tooling and automation.",
      ownerId: "user-1", status: "ACTIVE", priority: "MEDIUM",
      startDate: "2026-08-01T00:00:00Z", endDate: null,
      members: [], createdAt: "2026-08-01T00:00:00Z", updatedAt: "2026-08-01T00:00:00Z",
    },
    {
      id: "proj-3", tenantId: "tenant-1", workspaceId: "ws-1",
      name: "Project Gamma", description: "Research and development initiative.",
      ownerId: "user-2", status: "DRAFT", priority: "LOW",
      startDate: null, endDate: null,
      members: [], createdAt: "2026-07-20T00:00:00Z", updatedAt: "2026-07-28T00:00:00Z",
    },
  ];
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Projects</h1>
          <p className="text-gray-500">Manage your workspace projects.</p>
        </div>
        <CreateProjectButton />
      </div>

      <ProjectList projects={projects} />
    </div>
  );
}
