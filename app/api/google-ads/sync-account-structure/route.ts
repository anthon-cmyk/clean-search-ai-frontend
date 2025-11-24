import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase/supabase-server";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  const { customerId, loginCustomerId, startDate, endDate } = body;

  if (!customerId || !loginCustomerId) {
    return NextResponse.json(
      { error: "customerId and loginCustomerId are required" },
      { status: 400 }
    );
  }

  const fetchUrl = `${API_URL}/google-ads/sync-account-structure`;

  const res = await fetch(fetchUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId,
      loginCustomerId,
      startDate,
      endDate,
    }),
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
