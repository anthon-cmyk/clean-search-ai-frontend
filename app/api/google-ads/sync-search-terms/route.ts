import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase/supabase-server";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const fetchUrl = `${API_URL}/google-ads/sync-search-terms`;

  const body = await req.text();
  const res = await fetch(fetchUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text }, { status: res.status });
  }

  return new NextResponse(text, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
