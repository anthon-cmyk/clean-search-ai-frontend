"use client";

import { useState } from "react";
import { IGoogleAdsCampaign } from "@/src/types/api/google-ads.types";
import { AdGroupsList } from "./ad-groups-list";

type TCampaignCardProps = {
  campaign: IGoogleAdsCampaign;
  hasMetrics: boolean;
};

export function CampaignCard({ campaign, hasMetrics }: TCampaignCardProps) {
  console.log("🚀 ~ CampaignCard ~ campaign:", campaign);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasAdGroups = campaign.adGroups && campaign.adGroups.length > 0;

  return (
    <div className="border-t">
      <div className="p-3 text-sm space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasAdGroups && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-neutral-100 rounded p-1 transition-colors"
                aria-label={
                  isExpanded ? "Collapse ad groups" : "Expand ad groups"
                }
              >
                {isExpanded ? "▲" : "▼"}
              </button>
            )}
            <div className="font-medium">{campaign.campaignName}</div>
            {hasAdGroups && (
              <span className="text-xs text-neutral-500">
                ({campaign.adGroups?.length} ad groups)
              </span>
            )}
          </div>
          <div className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
            {campaign.status}
          </div>
        </div>

        <div className="text-neutral-600 text-xs">
          ID: {campaign.campaignId} · Type: {campaign.advertisingChannelType} ·
          Budget: {campaign.budgetAmount.toFixed(2)} {campaign.currencyCode}
        </div>

        {hasMetrics && campaign.metrics && (
          <div className="text-neutral-500 text-xs">
            Impressions: {campaign.metrics.impressions.toLocaleString()} ·
            Clicks: {campaign.metrics.clicks.toLocaleString()} · Cost:{" "}
            {campaign.metrics.cost.toFixed(2)} {campaign.currencyCode} ·
            Conversions: {campaign.metrics.conversions.toFixed(2)} · CTR:{" "}
            {(campaign.metrics.ctr * 100).toFixed(2)}%
          </div>
        )}
      </div>

      {isExpanded && hasAdGroups && (
        <AdGroupsList
          adGroups={campaign.adGroups || []}
          currencyCode={campaign.currencyCode}
        />
      )}
    </div>
  );
}
