"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  SEARCH_DEBOUNCE_MS,
  useProjectSearchParams,
} from "@/lib/projects/search-params";

export function ProjectSearchInput() {
  const [params, setParams] = useProjectSearchParams();
  const [value, setValue] = useState(params.q);

  useEffect(() => {
    setValue(params.q);
  }, [params.q]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (value !== params.q) {
        void setParams({ q: value });
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [value, params.q, setParams]);

  return (
    <div className="relative w-full sm:max-w-sm">
      <HugeiconsIcon
        icon={Search01Icon}
        strokeWidth={2}
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        className="pl-8"
        placeholder="Search client or project..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
}
