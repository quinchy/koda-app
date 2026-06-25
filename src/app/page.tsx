import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProjectsPage } from "@/components/product/projects-page";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  return <ProjectsPage userEmail={session.user.email} />;
}
