"use client";

import { AppLogo } from "@/components/app-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ModeToggle } from "@/components/mode-toggle";
import { NewProjectSheet } from "@/components/product/new-project-sheet";

export function ProjectsNavbar({ userEmail }: { userEmail: string }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="flex min-w-0 items-center gap-6">
        <AppLogo />
        <p className="truncate text-sm text-muted-foreground">
          Signed in as {userEmail}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <NewProjectSheet />
        <SignOutButton />
        <ModeToggle />
      </div>
    </header>
  );
}
