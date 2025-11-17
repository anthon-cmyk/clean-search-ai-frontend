"use server";

import { createSupabaseServerClient } from "@/src/lib/supabase/supabase-server";
import { redirect } from "next/navigation";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type TSignInInput = z.infer<typeof signInSchema>;

interface ISignInResult {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof TSignInInput, string>>;
}

/**
 * Authenticates user with email and password credentials
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Result object with success status and optional error messages
 *
 * @example
 * const result = await signIn(formData);
 * if (result.success) {
 *   // User signed in successfully, redirects to dashboard
 * }
 */
export async function signIn(
  email: string,
  password: string
): Promise<ISignInResult> {
  const validation = signInSchema.safeParse({ email, password });

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  redirect("/dashboard");
}
