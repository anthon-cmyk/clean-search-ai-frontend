"use client";

import { IGoogleAdsSearchTerm } from "@/src/types/api/google-ads.types";

type TSearchTermsSectionProps = {
  title: string;
  terms: IGoogleAdsSearchTerm[];
  isLoading: boolean;
  error: Error | null;
  emptyMessage: string;
  showMetrics?: boolean;
};

export function SearchTermsSection({
  title,
  terms,
  isLoading,
  error,
  emptyMessage,
  showMetrics = true,
}: TSearchTermsSectionProps) {
  return (
    <section className="border rounded-lg">
      <div className="p-3 border-b font-medium text-sm">
        {title} ({terms.length})
      </div>
      <div className="max-h-[360px] overflow-auto">
        {isLoading && (
          <div className="p-3 text-sm text-neutral-500">Loading…</div>
        )}
        {error && (
          <div className="p-3 text-sm text-red-600">{error.message}</div>
        )}
        {!isLoading && terms.length === 0 && (
          <div className="p-3 text-sm text-neutral-500">{emptyMessage}</div>
        )}
        {terms.map((term, i) => (
          <div key={`${term.searchTerm}-${i}`} className="p-3 border-t text-sm">
            <div className="font-medium">{term.searchTerm}</div>
            <div className="text-neutral-600 text-xs">
              Campaign: {term.campaignName} · Ad Group: {term.adGroupName}
            </div>
            {showMetrics && (
              <div className="text-neutral-500 text-xs">
                Impressions: {term.metrics.impressions} · Clicks:{" "}
                {term.metrics.clicks} · Cost: {term.metrics.cost.toFixed(2)} ·
                Conversions: {term.metrics.conversions}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
