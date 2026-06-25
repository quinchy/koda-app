export const PROJECT_IP_RATE_LIMIT = {
  prefix: "projects:ip",
  max: 120,
  windowMs: 60_000,
} as const;

export const PROJECT_READ_RATE_LIMIT = {
  prefix: "projects:read",
  max: 60,
  windowMs: 60_000,
} as const;

export const PROJECT_WRITE_RATE_LIMIT = {
  prefix: "projects:write",
  max: 20,
  windowMs: 60_000,
} as const;
