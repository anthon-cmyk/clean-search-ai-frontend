import { z } from "zod";
export interface IGoogleAdsAccount {
  customerId: string;
  customerName: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  isManagerAccount: boolean;
  canManageClients: boolean;

  loginCustomerId: string; // must use in Customer() for auth
  managerCustomerId?: string | null; // manager that owns this client
}

export interface IGoogleAdsSearchTerm {
  campaignId: string;
  campaignName: string;
  adGroupId: string;
  adGroupName: string;
  searchTerm: string;
  // keyword: string;
  metrics: {
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
  };
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

export const fetchSearchTermsSchema = z.object({
  customerId: z.string().min(1),
  loginCustomerId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type TFetchSearchTermsInput = z.infer<typeof fetchSearchTermsSchema>;

export const syncSearchTermsSchema = z.object({
  customerId: z.string().min(1),

  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be in YYYY-MM-DD format"),

  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be in YYYY-MM-DD format"),
});

export type TSyncSearchTermsInput = z.infer<typeof syncSearchTermsSchema>;
