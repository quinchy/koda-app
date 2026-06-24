import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

const email = z.email("Enter a valid email");
const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);

const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;
const matchError = {
  message: "Passwords do not match",
  path: ["confirmPassword"],
};

export const loginSchema = z.object({
  email,
  password,
});

export const registerSchema = z
  .object({
    email,
    password,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine(passwordsMatch, matchError);
