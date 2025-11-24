import { enums } from "google-ads-api";
import { z } from "zod";

export interface IGoogleAdsAccount {
  customerId: string;
  customerName: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  isManagerAccount: boolean;
  canManageClients: boolean;
  loginCustomerId: string;
  managerCustomerId?: string | null;
}

export interface IGoogleAdsSearchTerm {
  campaignId: string;
  campaignName: string;
  adGroupId: string;
  adGroupName: string;
  searchTerm: string;
  metrics: {
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
    conversionsValue: number;
  };
}

export interface IGoogleAdsAdGroup {
  adGroupId: string;
  adGroupName: string;
  campaignId: string;
  campaignName: string;
  status: string;
  type: string;
  cpcBidMicros: number;
  cpcBid: number;
  targetCpaMicros?: number;
  targetCpa?: number;
}

export interface IGoogleAdsCampaign {
  campaignId: string;
  campaignName: string;
  status: enums.CampaignStatus | string;
  biddingStrategyType: enums.BiddingStrategyType | string;
  advertisingChannelType: enums.AdvertisingChannelType | string;
  budgetAmountMicros: number;
  budgetAmount: number;
  currencyCode: string;
  startDate: string;
  endDate?: string;
  metrics: {
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
    conversionsValue: number;
    ctr: number;
    averageCpc: number;
    averageCpm: number;
  };
  adGroups?: IGoogleAdsAdGroup[];
}

export interface ISyncResult {
  jobId: string;
  customerId: string;
  customerName: string;
  status: "completed" | "failed";
  recordsFetched: number;
  recordsStored: number;
  startDate: string;
  endDate: string;
  errorMessage?: string;
}

export type TGoogleAdsCustomer = {
  id: string;
  customerId: string;
  customerName?: string | null;
  customerDescriptiveName?: string | null;
  loginCustomerId: string;
  isManagerAccount: boolean;
  managerCustomerId?: string | null;
  currencyCode?: string | null;
  timeZone?: string | null;
  lastSyncedAt?: string | null;
  isActive: boolean;
};

export type TSyncJob = {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  syncStartDate: string;
  syncEndDate: string;
  syncType: string;
  recordsProcessed?: number | null;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
};

export const fetchSearchTermsSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  loginCustomerId: z.string().min(1, "Login customer ID is required"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  campaignId: z.string().optional(),
  adGroupId: z.string().optional(),
});

export type TFetchSearchTermsInput = z.infer<typeof fetchSearchTermsSchema>;

export const syncSearchTermsSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  loginCustomerId: z.string().min(1, "Customer ID is required"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
});

export type TSyncSearchTermsInput = z.infer<typeof syncSearchTermsSchema>;

export const fetchCampaignsSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  loginCustomerId: z.string().min(1, "Login customer ID is required"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
    .optional(),
  includeAdGroups: z.boolean().optional().default(true),
});

export type TFetchCampaignsInput = z.infer<typeof fetchCampaignsSchema>;

export const fetchAdGroupsSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  loginCustomerId: z.string().min(1, "Login customer ID is required"),
  campaignId: z.string().optional(),
});

export type TFetchAdGroupsInput = z.infer<typeof fetchAdGroupsSchema>;

export const fetchKeywordsSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  loginCustomerId: z.string().min(1, "Login customer ID is required"),
  adGroupId: z.string().min(1, "Ad group ID is required"),
  campaignId: z.string().optional(),
});

export type TFetchKeywordsInput = z.infer<typeof fetchKeywordsSchema>;

export interface IFullSyncResult {
  totalCampaigns: number;
  totalAdGroups: number;
  totalKeywords: number;
}

export type TFullSyncInput = {
  customerId: string;
  loginCustomerId: string;
  startDate?: string;
  endDate?: string;
};
