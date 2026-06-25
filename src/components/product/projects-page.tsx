import { ProjectList } from "@/components/product/project-list";
import { ProjectsNavbar } from "@/components/product/projects-navbar";

export function ProjectsPage({ userEmail }: { userEmail: string }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ProjectsNavbar userEmail={userEmail} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-6">
        <ProjectList />
      </main>
    </div>
  );
}
