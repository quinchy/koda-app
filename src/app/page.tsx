import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-medium">KodaTrack</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {session.user.email}
        </p>
      </div>
      <SignOutButton />
    </main>
  );
}
