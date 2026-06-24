import { createAuthClient } from "better-auth/react";

// baseURL omitted -> defaults to the current origin (works in dev and prod).
export const authClient = createAuthClient();
