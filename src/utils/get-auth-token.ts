"use server";

import { createSupabaseServerClient } from "../lib/supabase/supabase-server";

export async function getAuthToken() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}
