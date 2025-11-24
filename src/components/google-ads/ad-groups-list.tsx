"use client";

import { IGoogleAdsAdGroup } from "@/src/types/api/google-ads.types";
import { KeywordsList } from "./keywords-list";
import { getAdGroupStatusLabel } from "@/src/utils/google-ads";

type TAdGroupsListProps = {
  adGroups: IGoogleAdsAdGroup[];
  currencyCode: string;
  customerId: string;
  loginCustomerId: string;
};

export function AdGroupsList({
  adGroups,
  currencyCode,
  customerId,
  loginCustomerId,
}: TAdGroupsListProps) {
  return (
    <div className="bg-neutral-50 border-t">
      <div className="px-6 py-2 text-xs font-medium text-neutral-600">
        Ad Groups ({adGroups.length})
      </div>
      {adGroups.map((adGroup) => (
        <div key={adGroup.adGroupId} className="border-t border-neutral-200">
          <div className="px-6 py-2 text-xs bg-neutral-50">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-neutral-900">
                {adGroup.adGroupName}
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 text-[10px]">
                {getAdGroupStatusLabel(+adGroup.status)}
              </span>
            </div>
            <div className="text-neutral-600">
              ID: {adGroup.adGroupId} · Type: {adGroup.type}
            </div>
            <div className="text-neutral-500 mt-1">
              CPC Bid: {adGroup.cpcBid.toFixed(2)} {currencyCode}
              {adGroup.targetCpa && (
                <>
                  {" "}
                  · Target CPA: {adGroup.targetCpa.toFixed(2)} {currencyCode}
                </>
              )}
            </div>
          </div>

          <KeywordsList
            adGroup={adGroup}
            customerId={customerId}
            loginCustomerId={loginCustomerId}
            currencyCode={currencyCode}
          />
        </div>
      ))}
    </div>
  );
}
