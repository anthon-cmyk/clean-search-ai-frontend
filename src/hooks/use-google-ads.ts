import { useQuery } from "@tanstack/react-query";
import {
  IGoogleAdsAdGroup,
  IGoogleAdsKeyword,
} from "../types/api/google-ads-client.types";

export function useAdGroups(
  customerId?: string,
  loginCustomerId?: string,
  campaignId?: string
) {
  return useQuery({
    queryKey: [
      "google-ads",
      "ad-groups",
      customerId,
      loginCustomerId,
      campaignId,
    ],
    queryFn: async () => {
      if (!customerId || !loginCustomerId) return null;

      const params = new URLSearchParams({
        customerId,
        loginCustomerId,
        ...(campaignId && { campaignId }),
      });

      const response = await fetch(`/api/google-ads/ad-groups?${params}`);
      if (!response.ok) throw new Error("Failed to fetch ad groups");
      return response.json() as Promise<IGoogleAdsAdGroup[]>;
    },
    enabled: Boolean(customerId && loginCustomerId),
  });
}

export function useKeywords(
  customerId?: string,
  loginCustomerId?: string,
  adGroupId?: string,
  campaignId?: string
) {
  return useQuery({
    queryKey: [
      "google-ads",
      "keywords",
      customerId,
      loginCustomerId,
      adGroupId,
      campaignId,
    ],
    queryFn: async () => {
      if (!customerId || !loginCustomerId || !adGroupId) return null;

      const params = new URLSearchParams({
        customerId,
        loginCustomerId,
        adGroupId,
        ...(campaignId && { campaignId }),
      });

      const response = await fetch(`/api/google-ads/keywords?${params}`);
      if (!response.ok) throw new Error("Failed to fetch keywords");
      return response.json() as Promise<IGoogleAdsKeyword[]>;
    },
    enabled: Boolean(customerId && loginCustomerId && adGroupId),
  });
}
