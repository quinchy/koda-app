"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { ProjectSheet } from "@/components/product/project-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewProjectDrawer({
  buttonClassName,
  labelClassName,
}: {
  buttonClassName?: string;
  labelClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className={buttonClassName}>
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
        <span className={cn(labelClassName)}>New project</span>
      </Button>
      <ProjectSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
