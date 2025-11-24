"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { googleAdsApi } from "@/src/lib/google-ads-client";
import { IGoogleAdsAdGroup } from "@/src/types/api/google-ads.types";
import { IGoogleAdsKeyword } from "@/src/types/api/google-ads-client.types";
import {
  getKeywordMatchTypeLabel,
  getKeywordStatusLabel,
} from "@/src/utils/google-ads";

type TKeywordsListProps = {
  adGroup: IGoogleAdsAdGroup;
  customerId: string;
  loginCustomerId: string;
  currencyCode: string;
};

export function KeywordsList({
  adGroup,
  customerId,
  loginCustomerId,
  currencyCode,
}: TKeywordsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const keywordsQ = useQuery<IGoogleAdsKeyword[]>({
    queryKey: [
      "googleAds",
      "keywords",
      customerId,
      adGroup.campaignId,
      adGroup.adGroupId,
    ],
    queryFn: () =>
      googleAdsApi.keywords({
        customerId,
        loginCustomerId,
        adGroupId: adGroup.adGroupId,
        campaignId: adGroup.campaignId,
      }),
    enabled: isExpanded,
  });

  const keywords = keywordsQ.data ?? [];

  return (
    <div className="bg-neutral-100 border-t">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full cursor-pointer px-6 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200 transition-colors flex items-center gap-2"
      >
        <span className="text-[10px]">{isExpanded ? "▼" : "▶"}</span>
        Keywords
        {isExpanded && keywordsQ.isLoading && (
          <span className="text-neutral-500 ml-1">Loading...</span>
        )}
        {isExpanded && !keywordsQ.isLoading && (
          <span className="text-neutral-500">({keywords.length})</span>
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-neutral-200">
          {keywordsQ.isLoading && (
            <div className="px-8 py-3 text-xs text-neutral-500">
              Loading keywords...
            </div>
          )}

          {keywordsQ.error && (
            <div className="px-8 py-3 text-xs text-red-600">
              {(keywordsQ.error as Error).message}
            </div>
          )}

          {!keywordsQ.isLoading && keywords.length === 0 && (
            <div className="px-8 py-3 text-xs text-neutral-500">
              No keywords found in this ad group
            </div>
          )}

          {keywords.map((keyword) => (
            <div
              key={keyword.keywordId}
              className="px-8 py-2 text-xs border-t border-neutral-200 bg-white"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-neutral-900">
                  {keyword.keywordText}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px]">
                    {getKeywordMatchTypeLabel(keyword.matchType)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 text-[10px]">
                    {getKeywordStatusLabel(keyword.status)}
                  </span>
                </div>
              </div>

              <div className="text-neutral-600">
                CPC Bid: {keyword.cpcBid.toFixed(2)} {currencyCode}
                {keyword.qualityScore && (
                  <>
                    {" "}
                    · Quality Score:{" "}
                    <span
                      className={
                        keyword.qualityScore >= 7
                          ? "text-green-600 font-medium"
                          : keyword.qualityScore >= 5
                          ? "text-yellow-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {keyword.qualityScore}/10
                    </span>
                  </>
                )}
              </div>

              {keyword.finalUrls.length > 0 && (
                <div className="text-neutral-500 mt-1 truncate">
                  URL: {keyword.finalUrls[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
