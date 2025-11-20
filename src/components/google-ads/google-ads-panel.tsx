"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { googleAdsApi } from "@/src/lib/google-ads-client";
import {
  IGoogleAdsAccount,
  IGoogleAdsSearchTerm,
  TFetchSearchTermsInput,
  ISyncResult,
  TSyncSearchTermsInput,
} from "@/src/types/api/google-ads.types";

// ---- local UI-level types (DTO contracts you didn't show) ----
type TGoogleAdsCustomer = {
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
};

type TSyncJob = {
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

// ---- helpers ----
function toYmd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function lastNDaysRange(n: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - n);
  return { startDate: toYmd(start), endDate: toYmd(end) };
}

type TSelectableAccount = {
  customerId: string;
  label: string;
  loginCustomerId: string;
  isManagerAccount: boolean;
};

export function GoogleAdsPanel() {
  const qc = useQueryClient();

  const [selected, setSelected] = useState<TSelectableAccount | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // default date range 30d
  useEffect(() => {
    const r = lastNDaysRange(30);
    setStartDate(r.startDate);
    setEndDate(r.endDate);
  }, []);

  // DB customers (source of truth)
  const customersQ = useQuery<TGoogleAdsCustomer[]>({
    queryKey: ["googleAds", "customers"],
    queryFn: () => googleAdsApi.customers(),
  });

  // Accessible accounts (live from Google)
  const accountsQ = useQuery<IGoogleAdsAccount[]>({
    queryKey: ["googleAds", "accounts"],
    queryFn: () => googleAdsApi.accounts(),
  });

  const customers = customersQ.data ?? [];
  const accounts = accountsQ.data ?? [];

  // Build selection list: stored customers + unstored accessible accounts
  const selection = useMemo(() => {
    const storedIds = new Set(customers.map((c) => c.customerId));

    const storedSelectable: TSelectableAccount[] = customers.map((c) => ({
      customerId: c.customerId,
      loginCustomerId: c.loginCustomerId,
      isManagerAccount: c.isManagerAccount,
      label:
        c.customerDescriptiveName ||
        c.customerName ||
        `Customer ${c.customerId}`,
    }));

    const unstoredSelectable: TSelectableAccount[] = accounts
      .filter((a) => !storedIds.has(a.customerId))
      .map((a) => ({
        customerId: a.customerId,
        loginCustomerId: a.loginCustomerId ?? a.customerId,
        isManagerAccount: a.isManagerAccount,
        label:
          a.descriptiveName || a.customerName || `Customer ${a.customerId}`,
      }));

    return { storedSelectable, unstoredSelectable };
  }, [customers, accounts]);

  // Preview (live API terms)
  const previewM = useMutation<
    IGoogleAdsSearchTerm[],
    Error,
    TFetchSearchTermsInput
  >({
    mutationFn: (dto) => googleAdsApi.previewTerms(dto),
  });

  // Sync to DB
  const syncM = useMutation<ISyncResult, Error, TSyncSearchTermsInput>({
    mutationFn: (dto) => googleAdsApi.syncTerms(dto),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["googleAds", "customers"] });
      qc.invalidateQueries({
        queryKey: ["googleAds", "syncJobs", res.customerId],
      });
      qc.invalidateQueries({
        queryKey: [
          "googleAds",
          "storedTerms",
          res.customerId,
          startDate,
          endDate,
        ],
      });
    },
  });

  // Stored terms (optional; requires googleAdsApi.storedTerms)
  const storedTermsQ = useQuery<IGoogleAdsSearchTerm[]>({
    queryKey: [
      "googleAds",
      "storedTerms",
      selected?.customerId,
      startDate,
      endDate,
    ],
    queryFn: () =>
      googleAdsApi.storedTerms({
        customerId: selected!.customerId,
        loginCustomerId: selected!.loginCustomerId,
        startDate,
        endDate,
      }),
    enabled:
      !!selected &&
      !!startDate &&
      !!endDate &&
      typeof (googleAdsApi as any).storedTerms === "function",
  });

  // Sync jobs history
  const syncJobsQ = useQuery<TSyncJob[]>({
    queryKey: ["googleAds", "syncJobs", selected?.customerId],
    queryFn: () => googleAdsApi.syncJobs(selected!.customerId),
    enabled: !!selected,
    refetchInterval: (q) =>
      q.state.data?.some((j) => j.status === "running") ? 4000 : false,
  });

  const canRun =
    !!selected?.customerId && !!startDate && !!endDate && !previewM.isPending;

  const onPreview = () => {
    if (!selected) return;

    previewM.mutate({
      customerId: selected.customerId,
      loginCustomerId: selected.loginCustomerId,
      startDate,
      endDate,
    });
  };

  const onSync = () => {
    if (!selected) return;

    syncM.mutate({
      customerId: selected.customerId,
      startDate,
      endDate,
    });
  };

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Google Ads Search Terms</h1>
        <p className="text-sm text-neutral-500">
          Preview live search terms and sync them into Supabase.
        </p>
      </header>

      {/* Global loading/errors */}
      {(customersQ.isLoading || accountsQ.isLoading) && (
        <div className="text-sm text-neutral-500">Loading Google Ads…</div>
      )}
      {(customersQ.error || accountsQ.error) && (
        <div className="text-sm text-red-600">
          {(customersQ.error as Error)?.message ||
            (accountsQ.error as Error)?.message}
        </div>
      )}

      {/* Selection / Filters */}
      <section className="border rounded-lg p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Customer account</label>
          <select
            className="w-full border rounded p-2"
            value={selected?.customerId ?? ""}
            onChange={(e) => {
              const id = e.target.value;
              const all = [
                ...selection.storedSelectable,
                ...selection.unstoredSelectable,
              ];
              const sel = all.find((x) => x.customerId === id) ?? null;
              setSelected(sel);
              previewM.reset();
            }}
          >
            <option value="" disabled>
              Select account…
            </option>

            {selection.storedSelectable.length > 0 && (
              <optgroup label="Stored customers">
                {selection.storedSelectable.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.label} ({c.customerId})
                    {c.isManagerAccount ? " [MCC]" : ""}
                  </option>
                ))}
              </optgroup>
            )}

            {selection.unstoredSelectable.length > 0 && (
              <optgroup label="Accessible but not stored">
                {selection.unstoredSelectable.map((a) => (
                  <option key={a.customerId} value={a.customerId}>
                    {a.label} ({a.customerId})
                    {a.isManagerAccount ? " [MCC]" : ""}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Start date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">End date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="border rounded px-3 py-2 text-sm disabled:opacity-50"
            disabled={!canRun}
            onClick={onPreview}
          >
            Preview live terms
          </button>

          <button
            className="bg-black text-white rounded px-3 py-2 text-sm disabled:opacity-50"
            disabled={!selected?.customerId || syncM.isPending}
            onClick={onSync}
          >
            Sync to DB
          </button>

          <button
            className="ml-auto border rounded px-3 py-2 text-sm"
            onClick={() => {
              qc.invalidateQueries({ queryKey: ["googleAds", "accounts"] });
              qc.invalidateQueries({ queryKey: ["googleAds", "customers"] });
            }}
          >
            Refresh
          </button>
        </div>

        {previewM.error && (
          <div className="text-sm text-red-600">{previewM.error.message}</div>
        )}
        {syncM.error && (
          <div className="text-sm text-red-600">{syncM.error.message}</div>
        )}
        {syncM.data && (
          <div className="text-sm">
            Sync: <span className="font-medium">{syncM.data.status}</span> ·
            Stored {syncM.data.recordsStored}/{syncM.data.recordsFetched}
          </div>
        )}
      </section>

      {/* Live Preview */}
      <section className="border rounded-lg">
        <div className="p-3 border-b font-medium text-sm">
          Live preview ({previewM.data?.length ?? 0})
        </div>
        <div className="max-h-[360px] overflow-auto">
          {previewM.isPending && (
            <div className="p-3 text-sm text-neutral-500">
              Fetching preview…
            </div>
          )}
          {!previewM.isPending && (previewM.data?.length ?? 0) === 0 && (
            <div className="p-3 text-sm text-neutral-500">
              Run “Preview live terms” to see API results.
            </div>
          )}
          {previewM.data?.map((t, i) => (
            <div key={`${t.searchTerm}-${i}`} className="p-3 border-t text-sm">
              <div className="font-medium">{t.searchTerm}</div>
              <div className="text-neutral-600">
                Campaign: {t.campaignName} · AdGroup: {t.adGroupName}
              </div>
              <div className="text-neutral-600">Keyword: {t.keyword}</div>
              <div className="text-neutral-500">
                Impr {t.metrics.impressions} · Clicks {t.metrics.clicks} · Cost{" "}
                {t.metrics.cost.toFixed(2)} · Conv {t.metrics.conversions}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stored Terms (if api is present) */}
      <section className="border rounded-lg">
        <div className="p-3 border-b font-medium text-sm">
          Stored terms ({storedTermsQ.data?.length ?? 0})
        </div>
        <div className="max-h-[360px] overflow-auto">
          {!selected && (
            <div className="p-3 text-sm text-neutral-500">
              Select a customer to view stored terms.
            </div>
          )}
          {selected && storedTermsQ.isLoading && (
            <div className="p-3 text-sm text-neutral-500">
              Loading stored terms…
            </div>
          )}
          {storedTermsQ.error && (
            <div className="p-3 text-sm text-red-600">
              {(storedTermsQ.error as Error).message}
            </div>
          )}
          {selected &&
            !storedTermsQ.isLoading &&
            (storedTermsQ.data?.length ?? 0) === 0 && (
              <div className="p-3 text-sm text-neutral-500">
                No stored terms for this range.
              </div>
            )}
          {storedTermsQ.data?.map((t, i) => (
            <div key={`${t.searchTerm}-${i}`} className="p-3 border-t text-sm">
              <div className="font-medium">{t.searchTerm}</div>
              <div className="text-neutral-600">
                Campaign: {t.campaignName} · AdGroup: {t.adGroupName}
              </div>
              <div className="text-neutral-600">Keyword: {t.keyword}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sync Jobs */}
      <section className="border rounded-lg">
        <div className="p-3 border-b font-medium text-sm">Sync jobs</div>
        <div className="max-h-[260px] overflow-auto">
          {!selected && (
            <div className="p-3 text-sm text-neutral-500">
              Select a customer to view jobs.
            </div>
          )}
          {selected && syncJobsQ.isLoading && (
            <div className="p-3 text-sm text-neutral-500">Loading jobs…</div>
          )}
          {syncJobsQ.error && (
            <div className="p-3 text-sm text-red-600">
              {(syncJobsQ.error as Error).message}
            </div>
          )}
          {selected &&
            !syncJobsQ.isLoading &&
            (syncJobsQ.data?.length ?? 0) === 0 && (
              <div className="p-3 text-sm text-neutral-500">
                No sync jobs yet.
              </div>
            )}
          {syncJobsQ.data?.map((j) => (
            <div key={j.id} className="p-3 border-t text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{j.status}</span>
                <span className="text-neutral-500">
                  {j.syncStartDate} → {j.syncEndDate}
                </span>
              </div>
              <div className="text-neutral-500">
                Type: {j.syncType} · Records: {j.recordsProcessed ?? 0}
              </div>
              {j.errorMessage && (
                <div className="text-red-600 mt-1">{j.errorMessage}</div>
              )}
              <div className="text-neutral-400 text-xs mt-1">
                Created: {new Date(j.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
