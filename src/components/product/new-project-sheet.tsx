"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { ProjectSheet } from "@/components/product/project-sheet";
import { Button } from "@/components/ui/button";

export function NewProjectSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <HugeiconsIcon
          icon={Add01Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        New project
      </Button>
      <ProjectSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
