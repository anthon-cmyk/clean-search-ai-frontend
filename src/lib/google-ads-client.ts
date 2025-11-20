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

  const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}${input}`;
  console.log("🚀 ~ authedFetch ~ fetchUrl:", fetchUrl);

  const res = await fetch(fetchUrl, {
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
  accounts: () => authedFetch("/api/google-ads/accounts"),
  customers: () => authedFetch("/api/google-ads/customers"),
  previewTerms: (dto: TFetchSearchTermsInput) => {
    const qs = new URLSearchParams(dto).toString();
    return authedFetch(`/api/google-ads/search-terms?${qs}`);
  },
  syncTerms: (dto: TSyncSearchTermsInput) =>
    authedFetch("/api/google-ads/sync-search-terms", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  syncJobs: (customerId: string) =>
    authedFetch(`/api/google-ads/sync-jobs?customerId=${customerId}`),
  storedTerms: (dto: TFetchSearchTermsInput) => {
    const qs = new URLSearchParams(dto).toString();
    return authedFetch(`/api/google-ads/search-terms/stored?${qs}`);
  },
};
