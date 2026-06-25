"use client";

import { AlertCircleIcon, Refresh01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

type ProjectListErrorProps = {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
};

export function ProjectListError({
  message,
  onRetry,
  isRetrying = false,
}: ProjectListErrorProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <HugeiconsIcon
        icon={AlertCircleIcon}
        strokeWidth={1.5}
        className="size-16 text-destructive"
      />
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-medium">
          Failed to Load Projects
        </h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" disabled={isRetrying} onClick={onRetry}>
        <HugeiconsIcon
          icon={Refresh01Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        {isRetrying ? "Retrying..." : "Retry"}
      </Button>
    </div>
  );
}
