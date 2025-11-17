"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/src/lib/supabase/supabase-server";

const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type TSignUpInput = z.infer<typeof signUpSchema>;

interface ISignUpResult {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof TSignUpInput, string>>;
}

/**
 * Creates a new user account with email and password
 *
 * @param email - User's email address
 * @param password - User's password (min 8 characters)
 * @param confirmPassword - Password confirmation
 * @returns Result object with success status and optional error messages
 *
 * @example
 * const result = await signUp(formData);
 * if (result.success) {
 *   // User created successfully, check email for confirmation
 * }
 */
export async function signUp(
  email: string,
  password: string,
  confirmPassword: string
): Promise<ISignUpResult> {
  const validation = signUpSchema.safeParse({
    email,
    password,
    confirmPassword,
  });

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  redirect("/sign-in?message=Check your email to confirm your account");
}
