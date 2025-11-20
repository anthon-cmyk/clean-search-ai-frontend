"use server";

import { createSupabaseServerClient } from "@/src/lib/supabase/supabase-server";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function initiateGoogleAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Redirect to NestJS with user ID
  redirect(`${API_URL}/google-auth/authorize?userId=${user.id}`);
}
