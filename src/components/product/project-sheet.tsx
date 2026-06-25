"use client";

import { useEffect, useState } from "react";
import { ProjectForm } from "@/components/product/project-form";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
  const isMobile = useMediaQuery("(max-width: 639px)");

  const title = isEdit ? "Edit project" : "New project";
  const description = isEdit
    ? "Update this client project."
    : "Add a client project to your tracker.";
  const form = (
    <ProjectForm
      key={project?.id ?? (open ? "create" : "closed")}
      formId={formId}
      project={project}
      onSuccess={() => onOpenChange(false)}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent className="max-h-[85vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          {form}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {form}
      </SheetContent>
    </Sheet>
  );
}

// ponytail: matchMedia is the only way to swap drawer/sheet (different DOM); CSS can't.
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
