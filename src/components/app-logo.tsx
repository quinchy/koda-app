import Link from "next/link";
import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary font-heading text-lg font-black text-primary-foreground">
        K
      </span>
      <span className="font-heading text-2xl font-medium tracking-tight">
        KodaTrack
      </span>
    </Link>
  );
}
