"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { loginSchema, PASSWORD_MIN_LENGTH, registerSchema } from "@/lib/validations/auth";

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

function getAuthError(error: { message?: string } | null | undefined) {
  return error?.message ?? "Something went wrong. Please try again.";
}

function getMutationError(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function getDisplayName(email: string) {
  return email.split("@")[0] || email;
}

export function LoginForm() {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (value: LoginValues) => {
      const { error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      });

      if (error) {
        throw new Error(getAuthError(error));
      }
    },
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies LoginValues,
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <AuthCard
      title="Log in"
      description="Use your email and password to continue."
      footer={
        <p className="text-sm text-muted-foreground">
          No account?{" "}
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/auth/register"
          >
            Register
          </Link>
        </p>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        {mutation.isError ? (
          <p className="text-sm text-destructive">
            {getMutationError(mutation.error)}
          </p>
        ) : null}

        <FieldGroup>
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name} required>
                    Email
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={field.state.value}
                    aria-invalid={isInvalid}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name} required>
                    Password
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    variant="password"
                    autoComplete="current-password"
                    placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
                    value={field.state.value}
                    aria-invalid={isInvalid}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        <SubmitButton form={form} isPending={mutation.isPending}>
          Log in
        </SubmitButton>
      </form>
    </AuthCard>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (value: RegisterValues) => {
      const { error } = await authClient.signUp.email({
        email: value.email,
        password: value.password,
        name: getDisplayName(value.email),
      });

      if (error) {
        throw new Error(getAuthError(error));
      }
    },
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    } satisfies RegisterValues,
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <AuthCard
      title="Register"
      description="Create an account with email and password."
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/auth/login"
          >
            Log in
          </Link>
        </p>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        {mutation.isError ? (
          <p className="text-sm text-destructive">
            {getMutationError(mutation.error)}
          </p>
        ) : null}

        <FieldGroup>
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name} required>
                    Email
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={field.state.value}
                    aria-invalid={isInvalid}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name} required>
                    Password
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    variant="password"
                    autoComplete="new-password"
                    placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
                    value={field.state.value}
                    aria-invalid={isInvalid}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name} required>
                    Confirm password
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    variant="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={field.state.value}
                    aria-invalid={isInvalid}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        <SubmitButton form={form} isPending={mutation.isPending}>
          Register
        </SubmitButton>
      </form>
    </AuthCard>
  );
}

function SubmitButton({
  children,
  form,
  isPending,
}: {
  children: React.ReactNode;
  form: {
    Subscribe: <TSelected>(props: {
      selector: (state: { isSubmitting: boolean }) => TSelected;
      children: (state: TSelected) => React.ReactNode;
    }) => React.ReactNode | Promise<React.ReactNode>;
  };
  isPending: boolean;
}) {
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          className="w-full"
          type="submit"
          disabled={isSubmitting || isPending}
        >
          {isSubmitting || isPending ? "Please wait..." : children}
        </Button>
      )}
    </form.Subscribe>
  );
}
