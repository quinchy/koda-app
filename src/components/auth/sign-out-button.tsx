"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();

      if (error) {
        throw new Error(error.message ?? "Unable to sign out.");
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign out.",
      );
    },
    onSuccess: () => {
      router.push("/auth/login");
      router.refresh();
    },
  });

  return (
    <Button
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
      type="button"
      variant="outline"
    >
      {mutation.isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
