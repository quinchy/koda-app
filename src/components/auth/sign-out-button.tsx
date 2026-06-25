"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { redirectAfterAuth } from "@/lib/auth-redirect";

function useSignOutMutation() {
  return useMutation({
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
      redirectAfterAuth("/auth/login");
    },
  });
}

export function SignOutButton() {
  const mutation = useSignOutMutation();

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

export function SignOutMenuItem() {
  const mutation = useSignOutMutation();

  return (
    <DropdownMenuItem
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending ? "Signing out..." : "Sign out"}
    </DropdownMenuItem>
  );
}
