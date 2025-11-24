"use client";

import { IGoogleAdsCampaign } from "@/src/types/api/google-ads.types";
import { CampaignCard } from "./campaign-card";

type TCampaignsSectionProps = {
  campaigns: IGoogleAdsCampaign[];
  isLoading: boolean;
  error: Error | null;
  hasMetrics: boolean;
  isSelected: boolean;
};

export function CampaignsSection({
  campaigns,
  isLoading,
  error,
  hasMetrics,
  isSelected,
}: TCampaignsSectionProps) {
  return (
    <section className="border rounded-lg">
      <div className="p-3 border-b font-medium text-sm">
        Campaigns ({campaigns.length})
      </div>
      <div className="max-h-[600px] overflow-auto">
        {!isSelected && (
          <div className="p-3 text-sm text-neutral-500">
            Select a customer to view campaigns.
          </div>
        )}
        {isSelected && isLoading && (
          <div className="p-3 text-sm text-neutral-500">Loading campaigns…</div>
        )}
        {error && (
          <div className="p-3 text-sm text-red-600">{error.message}</div>
        )}
        {isSelected && !isLoading && campaigns.length === 0 && (
          <div className="p-3 text-sm text-neutral-500">
            No campaigns found for this account.
          </div>
        )}
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.campaignId}
            campaign={campaign}
            hasMetrics={hasMetrics}
          />
        ))}
      </div>
    </section>
  );
}
