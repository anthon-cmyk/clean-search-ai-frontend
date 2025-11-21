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

  const url = new URL(req.url);

  const customerId = url.searchParams.get("customerId");
  const loginCustomerId = url.searchParams.get("loginCustomerId");
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  // Required params
  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }

  // NOTE:
  // Your NestJS controller accepts:
  //   getStoredSearchTerms(userId, customerId, startDate?, endDate?)
  //
  // loginCustomerId is NOT used by Nest, but you included it in your FE URL.
  // We forward ALL params — fully transparent passthrough.

  const fetchUrl = `${API_URL}/google-ads/search-terms/stored?${url.searchParams.toString()}`;

  const res = await fetch(fetchUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
