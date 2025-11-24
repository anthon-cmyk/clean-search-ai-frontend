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

export interface IGoogleAdsKeyword {
  keywordId: string;
  adGroupId: string;
  adGroupName: string;
  campaignId: string;
  campaignName: string;
  keywordText: string;
  matchType: string;
  status: string;
  finalUrls: string[];
  cpcBidMicros: number;
  cpcBid: number;
  qualityScore?: number;
}
