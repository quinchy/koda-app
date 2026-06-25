"use client";

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AppLogo } from "@/components/app-logo";
import {
  SignOutButton,
  SignOutMenuItem,
} from "@/components/auth/sign-out-button";
import { ModeToggle, ThemeMenuItems } from "@/components/mode-toggle";
import { NewProjectDrawer } from "@/components/product/new-project-drawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function MobileNavMenu({ userEmail }: { userEmail: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="icon" className="sm:hidden" />}
      >
        <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
        <span className="sr-only">Open navigation menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="space-y-1">
            <span className="block text-xs font-medium text-muted-foreground">
              Signed in as
            </span>
            <span className="block truncate text-sm font-medium text-foreground">
              {userEmail}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <SignOutMenuItem />
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Mode</DropdownMenuSubTrigger>
          <DropdownMenuSubContent align="end">
            <ThemeMenuItems />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProjectsNavbar({ userEmail }: { userEmail: string }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-6">
        <AppLogo textClassName="hidden sm:inline" />
        <p className="hidden truncate text-sm text-muted-foreground sm:block">
          Signed in as {userEmail}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <NewProjectDrawer
          buttonClassName="w-9 px-0 sm:w-auto sm:px-2.5"
          labelClassName="sr-only sm:not-sr-only"
        />
        <div className="hidden items-center gap-2 sm:flex">
          <SignOutButton />
          <ModeToggle />
        </div>
        <MobileNavMenu userEmail={userEmail} />
      </div>
    </header>
  );
}
