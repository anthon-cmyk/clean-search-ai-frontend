import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase/supabase-server";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }

  const fetchUrl = `${API_URL}/google-ads/sync-jobs?customerId=${customerId}`;

  const res = await fetch(fetchUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const dataText = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: dataText }, { status: res.status });
  }

  return new NextResponse(dataText, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
