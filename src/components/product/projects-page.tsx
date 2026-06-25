import { ProjectList } from "@/components/product/project-list";
import { ProjectsNavbar } from "@/components/product/projects-navbar";

export function ProjectsPage({ userEmail }: { userEmail: string }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ProjectsNavbar userEmail={userEmail} />
      <main className="mx-auto w-full max-w-6xl flex-1 p-6">
        <ProjectList />
      </main>
    </div>
  );
}
