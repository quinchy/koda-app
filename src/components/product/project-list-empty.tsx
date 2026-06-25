"use client";

import { Add01Icon, FolderOpenIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { ProjectSheet } from "@/components/product/project-sheet";
import { Button } from "@/components/ui/button";

export function ProjectListEmpty() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <HugeiconsIcon
          icon={FolderOpenIcon}
          strokeWidth={1.5}
          className="size-16 text-muted-foreground"
        />
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-medium">No Projects Yet</h2>
          <p className="text-sm text-muted-foreground">
            Create your first one with New project.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <HugeiconsIcon
            icon={Add01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          New project
        </Button>
      </div>
      <ProjectSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
