"use client";

import { LockIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ProjectListUnauthorizedProps = {
  message: string;
};

export function ProjectListUnauthorized({
  message,
}: ProjectListUnauthorizedProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <HugeiconsIcon
        icon={LockIcon}
        strokeWidth={1.5}
        className="size-16 text-muted-foreground"
      />
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-medium">Unauthorized</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" render={<Link href="/auth/login" />}>
        Sign in
      </Button>
    </div>
  );
}
