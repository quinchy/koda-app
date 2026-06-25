"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useId, useState } from "react";
import { ProjectForm } from "@/components/product/project-form";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export function NewProjectDrawer({
  buttonClassName,
  labelClassName,
}: {
  buttonClassName?: string;
  labelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <Button onClick={() => setOpen(true)} className={buttonClassName}>
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
        <span className={cn(labelClassName)}>New project</span>
      </Button>
      <Drawer open={open} onOpenChange={setOpen} direction="bottom">
        <DrawerContent className="max-h-[85vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>New project</DrawerTitle>
            <DrawerDescription>
              Add a client project to your tracker.
            </DrawerDescription>
          </DrawerHeader>
          <ProjectForm
            key={open ? "create" : "closed"}
            formId={formId}
            onSuccess={() => setOpen(false)}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
}
