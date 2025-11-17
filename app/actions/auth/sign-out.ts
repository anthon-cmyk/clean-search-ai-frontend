"use server";

import { createSupabaseServerClient } from "@/src/lib/supabase/supabase-server";
import { redirect } from "next/navigation";

/**
 * Signs out the currently authenticated user and clears session
 *
 * @returns Redirects to sign-in page after successful sign out
 *
 * @example
 * await signOut(); // User session cleared and redirected
 */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/sign-in");
}
