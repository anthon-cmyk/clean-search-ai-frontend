export const AdGroupCriterionStatus = {
  UNSPECIFIED: 0,
  UNKNOWN: 1,
  ENABLED: 2,
  PAUSED: 3,
  REMOVED: 4,
} as const;

export const CampaignStatus = {
  UNSPECIFIED: 0,
  UNKNOWN: 1,
  ENABLED: 2,
  PAUSED: 3,
  REMOVED: 4,
} as const;

export const AdGroupStatus = {
  UNSPECIFIED: 0,
  UNKNOWN: 1,
  ENABLED: 2,
  PAUSED: 3,
  REMOVED: 4,
} as const;

/**
 * Gets the string label for a numeric enum value
 */
const getEnumLabel = (
  enumObj: Record<string, number | string>,
  value: number
): string => {
  const entry = Object.entries(enumObj).find(([_, val]) => val === value);
  return entry ? entry[0] : "UNKNOWN";
};

export const getKeywordStatusLabel = (status: number): string => {
  return getEnumLabel(AdGroupCriterionStatus, status);
};

export const getCampaignStatusLabel = (status: number): string => {
  return getEnumLabel(CampaignStatus, status);
};

export const getAdGroupStatusLabel = (status: number): string => {
  return getEnumLabel(AdGroupStatus, status);
};

export function getKeywordMatchTypeLabel(matchType: number | string): string {
  const matchTypeMap: Record<number, string> = {
    0: "Unspecified",
    1: "Unknown",
    2: "Exact",
    3: "Phrase",
    4: "Broad",
  };

  const numericType =
    typeof matchType === "string" ? parseInt(matchType, 10) : matchType;

  return matchTypeMap[numericType] || "Unknown";
}

export function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function lastNDaysRange(n: number) {
  const end = new Date();
  end.setDate(end.getDate() - 1); // Set to yesterday
  const start = new Date(end);
  start.setDate(end.getDate() - n);
  return { startDate: toYmd(start), endDate: toYmd(end) };
}
