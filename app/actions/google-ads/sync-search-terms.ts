"use server";

import { getAuthToken } from "@/src/utils/get-auth-token";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ISyncSearchTermsInput {
  customerId: string;
  startDate: string;
  endDate: string;
}

interface ISyncResult {
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

export async function syncSearchTerms(input: ISyncSearchTermsInput) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return { error: "Not authenticated" };
    }

    const response = await fetch(`${API_URL}/google-ads/sync-search-terms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Failed to sync search terms",
      }));
      return { error: error.message || "Failed to sync search terms" };
    }

    const data: ISyncResult = await response.json();

    revalidatePath("/dashboard");

    return { data };
  } catch (error) {
    console.error("Sync failed:", error);
    return { error: "Failed to sync search terms" };
  }
}
