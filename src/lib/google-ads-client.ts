import {
  TFetchCampaignsInput,
  TFetchSearchTermsInput,
  TSyncSearchTermsInput,
  IGoogleAdsAccount,
  IGoogleAdsCampaign,
  IGoogleAdsSearchTerm,
  ISyncResult,
  TGoogleAdsCustomer,
  TSyncJob,
} from "../types/api/google-ads.types";
import { createSupabaseBrowserClient } from "./supabase/supabase-client";

async function authedFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}${input}`;

  const res = await fetch(fetchUrl, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const googleAdsApi = {
  accounts: () => authedFetch<IGoogleAdsAccount[]>("/api/google-ads/accounts"),

  customers: () =>
    authedFetch<TGoogleAdsCustomer[]>("/api/google-ads/customers"),

  campaigns: (dto: TFetchCampaignsInput) => {
    const params: Record<string, string> = {
      customerId: dto.customerId,
      loginCustomerId: dto.loginCustomerId,
    };

    if (dto.startDate) params.startDate = dto.startDate;
    if (dto.endDate) params.endDate = dto.endDate;
    if (dto.includeAdGroups !== undefined) {
      params.includeAdGroups = String(dto.includeAdGroups);
    }

    const qs = new URLSearchParams(params).toString();
    return authedFetch<IGoogleAdsCampaign[]>(`/api/google-ads/campaigns?${qs}`);
  },

  previewTerms: (dto: TFetchSearchTermsInput) => {
    const params = new URLSearchParams(
      Object.entries(dto)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {})
    ).toString();

    return authedFetch<IGoogleAdsSearchTerm[]>(
      `/api/google-ads/search-terms?${params}`
    );
  },

  syncTerms: (dto: TSyncSearchTermsInput) =>
    authedFetch<ISyncResult>("/api/google-ads/sync-search-terms", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  syncJobs: (customerId: string) =>
    authedFetch<TSyncJob[]>(
      `/api/google-ads/sync-jobs?customerId=${customerId}`
    ),

  storedTerms: (dto: TFetchSearchTermsInput) => {
    const params = new URLSearchParams(
      Object.entries(dto)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {})
    ).toString();

    return authedFetch<IGoogleAdsSearchTerm[]>(
      `/api/google-ads/search-terms/stored?${params}`
    );
  },
};
