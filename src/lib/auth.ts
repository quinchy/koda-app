import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { getAuthBaseUrl } from "@/lib/auth-env";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  baseURL: getAuthBaseUrl(),
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
