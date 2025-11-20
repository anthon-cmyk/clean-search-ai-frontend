"use server";

import { Suspense } from "react";
import { redirect } from "next/navigation";

import { SuccessMessage } from "@/src/components/google-ads/success-message";
import { ConnectGoogleAdsButton } from "@/src/components/google-ads/connect-google-ads-button";

import { createSupabaseServerClient } from "@/src/lib/supabase/supabase-server";
import { GoogleAdsPanel } from "@/src/components/google-ads/google-ads-panel";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { connected?: string; accounts?: string };
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto p-6">
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <Suspense fallback={null}>
        <SuccessMessage searchParams={searchParams} />
      </Suspense>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl text-slate-900 font-semibold">
          Google Ads Integration
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Connect your Google Ads account to sync and analyze your search terms.
        </p>

        <ConnectGoogleAdsButton />
      </div>

      <GoogleAdsPanel />
    </div>
  );
}
