"use client";

import { useQuery } from "@tanstack/react-query";
import { ProjectCard } from "@/components/product/project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProjects, projectKeys } from "@/lib/projects/api";

function ProjectListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {["s1", "s2", "s3", "s4", "s5", "s6"].map((id) => (
        <Skeleton key={id} className="h-40 rounded-xl" />
      ))}
    </div>
  );
}

export function ProjectList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: projectKeys.all,
    queryFn: fetchProjects,
  });

  if (isLoading) {
    return <ProjectListSkeleton />;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load projects."}
      </p>
    );
  }

  if (!data?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No projects yet. Create your first one with New project.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
