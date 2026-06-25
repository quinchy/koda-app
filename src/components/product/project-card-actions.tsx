"use client";

import {
  Delete02Icon,
  Edit01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { DeleteProjectDialog } from "@/components/product/delete-project-dialog";
import { ProjectSheet } from "@/components/product/project-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SerializedProject } from "@/lib/projects/types";

export function ProjectCardActions({
  project,
}: {
  project: SerializedProject;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" className="shrink-0" />
          }
        >
          <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
          <span className="sr-only">Project actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProjectSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
      />
      <DeleteProjectDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        project={project}
      />
    </>
  );
}
