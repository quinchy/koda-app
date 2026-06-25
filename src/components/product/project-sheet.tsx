"use client";

import { ProjectForm } from "@/components/product/project-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SerializedProject } from "@/lib/projects/types";

type ProjectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: SerializedProject;
};

export function ProjectSheet({
  open,
  onOpenChange,
  project,
}: ProjectSheetProps) {
  const isEdit = Boolean(project);
  const formId = isEdit ? `edit-project-${project?.id}` : "new-project-form";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit project" : "New project"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this client project."
              : "Add a client project to your tracker."}
          </SheetDescription>
        </SheetHeader>
        <ProjectForm
          key={project?.id ?? (open ? "create" : "closed")}
          formId={formId}
          project={project}
          onSuccess={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
