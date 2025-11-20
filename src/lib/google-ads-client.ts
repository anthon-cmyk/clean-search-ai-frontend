import {
  TFetchSearchTermsInput,
  TSyncSearchTermsInput,
} from "../types/api/google-ads.types";
import { createSupabaseBrowserClient } from "./supabase/supabase-client";

async function authedFetch(input: RequestInfo, init?: RequestInit) {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${input}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const googleAdsApi = {
  accounts: () => authedFetch("/google-ads/accounts"),
  customers: () => authedFetch("/google-ads/customers"),
  previewTerms: (dto: TFetchSearchTermsInput) => {
    const qs = new URLSearchParams(dto).toString();
    return authedFetch(`/google-ads/search-terms?${qs}`);
  },
  syncTerms: (dto: TSyncSearchTermsInput) =>
    authedFetch("/google-ads/sync-search-terms", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  syncJobs: (customerId: string) =>
    authedFetch(`/google-ads/sync-jobs?customerId=${customerId}`),
};
