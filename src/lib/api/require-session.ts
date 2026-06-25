import { headers } from "next/headers";
import { UnauthorizedError } from "@/lib/api/errors";
import { auth } from "@/lib/auth";

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new UnauthorizedError("Sign in required to access projects.");
  }

  return session;
}
