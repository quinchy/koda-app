"use client";

import { FilterIcon, SortingAZ01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ProjectSearchInput } from "@/components/product/project-search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRIORITY_BADGE_CLASSNAME,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASSNAME,
  STATUS_LABELS,
} from "@/lib/projects/constants";
import {
  getPriorityFilterLabel,
  getSortLabel,
  getStatusFilterLabel,
  PRIORITY_FILTER_OPTIONS,
  SORT_OPTIONS,
  STATUS_FILTER_OPTIONS,
  useProjectSearchParams,
} from "@/lib/projects/search-params";
import type { ProjectPriority, ProjectStatus } from "@/lib/projects/types";

function StatusFilterValue({
  value,
}: {
  value: (typeof STATUS_FILTER_OPTIONS)[number]["value"];
}) {
  if (value === "all") {
    return <span>{getStatusFilterLabel(value)}</span>;
  }

  return (
    <Badge className={STATUS_BADGE_CLASSNAME[value as ProjectStatus]}>
      {STATUS_LABELS[value as ProjectStatus]}
    </Badge>
  );
}

function PriorityFilterValue({
  value,
}: {
  value: (typeof PRIORITY_FILTER_OPTIONS)[number]["value"];
}) {
  if (value === "all") {
    return <span>{getPriorityFilterLabel(value)}</span>;
  }

  return (
    <Badge className={PRIORITY_BADGE_CLASSNAME[value as ProjectPriority]}>
      {PRIORITY_LABELS[value as ProjectPriority]}
    </Badge>
  );
}

export function ProjectListToolbar() {
  const [params, setParams] = useProjectSearchParams();
  const hasActiveFilters = params.status !== "all" || params.priority !== "all";

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ProjectSearchInput />

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant={hasActiveFilters ? "secondary" : "outline"}
                  className="w-full min-w-0 justify-between gap-2 sm:w-auto sm:min-w-28"
                />
              }
            >
              <span className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={FilterIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Filter
              </span>
              {hasActiveFilters ? (
                <span className="flex items-center gap-1">
                  {params.status !== "all" ? (
                    <StatusFilterValue value={params.status} />
                  ) : null}
                  {params.priority !== "all" ? (
                    <PriorityFilterValue value={params.priority} />
                  ) : null}
                </span>
              ) : null}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={params.status}
                  onValueChange={(value) => {
                    if (value) {
                      setParams({ status: value });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <StatusFilterValue value={params.status} />
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <StatusFilterValue value={option.value} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={params.priority}
                  onValueChange={(value) => {
                    if (value) {
                      setParams({ priority: value });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <PriorityFilterValue value={params.priority} />
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <PriorityFilterValue value={option.value} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>

          <Select
            value={params.sort}
            onValueChange={(value) => {
              if (value) {
                setParams({ sort: value });
              }
            }}
          >
            <SelectTrigger className="w-full min-w-0 justify-between gap-2 sm:min-w-52">
              <span className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={SortingAZ01Icon}
                  strokeWidth={2}
                  className="size-4 text-muted-foreground"
                />
                <SelectValue>{getSortLabel(params.sort)}</SelectValue>
              </span>
            </SelectTrigger>
            <SelectContent align="end">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
