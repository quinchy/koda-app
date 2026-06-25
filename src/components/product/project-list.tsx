"use client";

import { useQuery } from "@tanstack/react-query";
import { ProjectCard } from "@/components/product/project-card";
import { ProjectListEmpty } from "@/components/product/project-list-empty";
import { ProjectListError } from "@/components/product/project-list-error";
import { ProjectListToolbar } from "@/components/product/project-list-toolbar";
import { ProjectListUnauthorized } from "@/components/product/project-list-unauthorized";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, fetchProjects, projectKeys } from "@/lib/projects/api";
import {
  hasActiveProjectFilters,
  toProjectListQuery,
  useProjectSearchParams,
} from "@/lib/projects/search-params";

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
  const [searchParams] = useProjectSearchParams();
  const query = toProjectListQuery(searchParams);
  const filtered = hasActiveProjectFilters(query);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: projectKeys.list(query),
    queryFn: () => fetchProjects(query),
  });

  const content = (() => {
    if (isLoading) {
      return <ProjectListSkeleton />;
    }

    if (isError) {
      if (error instanceof ApiError && error.status === 401) {
        return <ProjectListUnauthorized message={error.message} />;
      }

      return (
        <ProjectListError
          message={
            error instanceof Error ? error.message : "Failed to load projects."
          }
          isRetrying={isFetching}
          onRetry={() => void refetch()}
        />
      );
    }

    if (!data?.length) {
      return <ProjectListEmpty filtered={filtered} />;
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  })();

  const isCenteredState = !isLoading && (isError || !data?.length);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ProjectListToolbar />
      <div className={isCenteredState ? "flex flex-1 flex-col" : undefined}>
        {content}
      </div>
    </div>
  );
}
