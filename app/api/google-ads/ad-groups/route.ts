import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase/supabase-server";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const customerId = searchParams.get("customerId");
  const loginCustomerId = searchParams.get("loginCustomerId");
  const campaignId = searchParams.get("campaignId");

  if (!customerId || !loginCustomerId) {
    return NextResponse.json(
      { error: "customerId and loginCustomerId are required" },
      { status: 400 }
    );
  }

  const queryParams = new URLSearchParams({
    customerId,
    loginCustomerId,
    ...(campaignId && { campaignId }),
  });

  const res = await fetch(
    `${API_URL}/google-ads/ad-groups?${queryParams.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text }, { status: res.status });
  }

  return new NextResponse(text, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
