"use client";

import { format, parseISO } from "date-fns";
import { ProjectCardActions } from "@/components/product/project-card-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PRIORITY_LABELS,
  STATUS_BADGE_CLASSNAME,
  STATUS_LABELS,
} from "@/lib/projects/constants";
import type { SerializedProject } from "@/lib/projects/types";

function formatDate(value: string) {
  return format(parseISO(value), "MMM d, yyyy");
}

export function ProjectCard({ project }: { project: SerializedProject }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{project.projectName}</CardTitle>
        <CardDescription>{project.clientName}</CardDescription>
        <CardAction>
          <ProjectCardActions project={project} />
        </CardAction>
      </CardHeader>
      {project.description ? (
        <CardContent>
          <p className="line-clamp-3 text-muted-foreground">
            {project.description}
          </p>
        </CardContent>
      ) : null}
      <CardFooter className="flex flex-wrap gap-2">
        <Badge className={STATUS_BADGE_CLASSNAME[project.status]}>
          {STATUS_LABELS[project.status]}
        </Badge>
        <Badge variant="outline">{PRIORITY_LABELS[project.priority]}</Badge>
        <span className="w-full text-xs text-muted-foreground">
          {formatDate(project.startDate)} – {formatDate(project.dueDate)}
        </span>
      </CardFooter>
    </Card>
  );
}
