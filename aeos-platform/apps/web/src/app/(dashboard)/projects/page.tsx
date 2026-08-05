import { getProjects } from "@/features/projects/api/queries";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { CreateProjectButton } from "@/features/projects/components/CreateProjectButton";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Projects</h1>
          <p className="text-gray-500">Manage your workspace projects.</p>
        </div>
        <CreateProjectButton
        />
      </div>

      <ProjectList projects={projects} />
    </div>
  );
}
