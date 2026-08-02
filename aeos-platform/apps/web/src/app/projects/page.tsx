import { Project } from "@/features/projects/types";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { CreateProjectButton } from "@/features/projects/components/CreateProjectButton";

async function getProjects(): Promise<Project[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          name: "Project Alpha 1",
          description: "A revolutionary new product for enterprise.",
          updatedAt: "2 days ago",
          status: "Active",
        },
        {
          id: "2",
          name: "Project Alpha 2",
          description: "A revolutionary new product for enterprise.",
          updatedAt: "2 days ago",
          status: "Active",
        },
        {
          id: "3",
          name: "Project Alpha 3",
          description: "A revolutionary new product for enterprise.",
          updatedAt: "2 days ago",
          status: "Active",
        },
      ]);
    }, 100);
  });
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
