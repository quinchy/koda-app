"use client";

import { FolderOpenIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { NewProjectDrawer } from "@/components/product/new-project-drawer";

export function ProjectListEmpty({ filtered = false }: { filtered?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <HugeiconsIcon
        icon={FolderOpenIcon}
        strokeWidth={1.5}
        className="size-16 text-muted-foreground"
      />
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-medium">
          {filtered ? "No matching projects" : "No Projects Yet"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {filtered
            ? "Try adjusting your search or filters."
            : "Create your first one with New project."}
        </p>
      </div>
      {!filtered ? <NewProjectDrawer /> : null}
    </div>
  );
}
