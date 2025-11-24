// "use client";

// import { useMemo, useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { googleAdsApi } from "@/src/lib/google-ads-client";
// import {
//   IGoogleAdsAccount,
//   IGoogleAdsSearchTerm,
//   ISyncResult,
//   TSyncSearchTermsInput,
//   IGoogleAdsCampaign,
//   TGoogleAdsCustomer,
//   TSyncJob,
//   TFetchSearchTermsInput,
//   IFullSyncResult,
//   TFullSyncInput,
// } from "@/src/types/api/google-ads.types";

// import { CampaignsSection } from "./campaigns-section";
// import { SearchTermsSection } from "./search-terms-section";
// import { SyncJobsSection } from "./sync-jobs-section";
// import { lastNDaysRange } from "@/src/utils/google-ads";

// type TSelectableAccount = {
//   customerId: string;
//   label: string;
//   loginCustomerId: string;
//   isManagerAccount: boolean;
// };

// export function GoogleAdsPanel() {
//   const qc = useQueryClient();

//   const [selected, setSelected] = useState<TSelectableAccount | null>(null);
//   const [includeAdGroups, setIncludeAdGroups] = useState(true);

//   const initialRange = useMemo(() => lastNDaysRange(30), []);

//   const [startDate, setStartDate] = useState(initialRange.startDate);
//   const [endDate, setEndDate] = useState(initialRange.endDate);

//   const customersQ = useQuery<TGoogleAdsCustomer[]>({
//     queryKey: ["googleAds", "customers"],
//     queryFn: () => googleAdsApi.customers(),
//   });

//   const accountsQ = useQuery<IGoogleAdsAccount[]>({
//     queryKey: ["googleAds", "accounts"],
//     queryFn: () => googleAdsApi.accounts(),
//   });

//   const campaignsQ = useQuery<IGoogleAdsCampaign[]>({
//     queryKey: [
//       "googleAds",
//       "campaigns",
//       selected?.customerId,
//       selected?.loginCustomerId,
//       startDate,
//       endDate,
//       includeAdGroups,
//     ],
//     queryFn: () =>
//       googleAdsApi.campaigns({
//         customerId: selected!.customerId,
//         loginCustomerId: selected!.loginCustomerId,
//         startDate,
//         endDate,
//         includeAdGroups,
//       }),
//     enabled: !!selected?.customerId && !!selected?.loginCustomerId,
//   });

//   const previewM = useMutation<
//     IGoogleAdsSearchTerm[],
//     Error,
//     TFetchSearchTermsInput
//   >({
//     mutationFn: (dto) => googleAdsApi.previewTerms(dto),
//   });

//   const fullSyncM = useMutation<IFullSyncResult, Error, TFullSyncInput>({
//     mutationFn: (dto) => googleAdsApi.syncAccountStructure(dto),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["googleAds", "customers"] });
//       qc.invalidateQueries({ queryKey: ["googleAds", "campaigns"] });
//       if (selected) {
//         qc.invalidateQueries({
//           queryKey: ["googleAds", "syncJobs", selected.customerId],
//         });
//       }
//     },
//   });

//   const storedTermsQ = useQuery<IGoogleAdsSearchTerm[]>({
//     queryKey: [
//       "googleAds",
//       "storedTerms",
//       selected?.customerId,
//       startDate,
//       endDate,
//     ],
//     queryFn: () =>
//       googleAdsApi.storedTerms({
//         customerId: selected!.customerId,
//         loginCustomerId: selected!.loginCustomerId,
//         startDate,
//         endDate,
//       }),
//     enabled: !!selected && !!startDate && !!endDate,
//   });

//   const syncJobsQ = useQuery<TSyncJob[]>({
//     queryKey: ["googleAds", "syncJobs", selected?.customerId],
//     queryFn: () => googleAdsApi.syncJobs(selected!.customerId),
//     enabled: !!selected,
//     refetchInterval: (query) =>
//       query.state.data?.some((j) => j.status === "running") ? 4000 : false,
//   });

//   const customers = customersQ.data ?? [];
//   const accounts = accountsQ.data ?? [];
//   const campaigns = campaignsQ.data ?? [];

//   const selection = useMemo(() => {
//     const storedIds = new Set(customers.map((c) => c.customerId));

//     const storedSelectable: TSelectableAccount[] = customers.map((c) => ({
//       customerId: c.customerId,
//       loginCustomerId: c.loginCustomerId,
//       isManagerAccount: c.isManagerAccount,
//       label:
//         c.customerDescriptiveName ||
//         c.customerName ||
//         `Customer ${c.customerId}`,
//     }));

//     const unstoredSelectable: TSelectableAccount[] = accounts
//       .filter((a) => !storedIds.has(a.customerId))
//       .map((a) => ({
//         customerId: a.customerId,
//         loginCustomerId: a.loginCustomerId ?? a.customerId,
//         isManagerAccount: a.isManagerAccount,
//         label:
//           a.descriptiveName || a.customerName || `Customer ${a.customerId}`,
//       }));

//     return { storedSelectable, unstoredSelectable };
//   }, [customers, accounts]);

//   // const canRun =
//   //   !!selected?.customerId && !!startDate && !!endDate && !previewM.isPending;

//   // const onPreview = () => {
//   //   if (!selected) return;

//   //   previewM.mutate({
//   //     customerId: selected.customerId,
//   //     loginCustomerId: selected.loginCustomerId,
//   //     startDate,
//   //     endDate,
//   //   });
//   // };

//   const onFullSync = () => {
//     if (!selected) return;

//     fullSyncM.mutate({
//       customerId: selected.customerId,
//       loginCustomerId: selected.loginCustomerId,
//       startDate,
//       endDate,
//     });
//   };

//   const handleRefresh = () => {
//     qc.invalidateQueries({ queryKey: ["googleAds", "accounts"] });
//     qc.invalidateQueries({ queryKey: ["googleAds", "customers"] });
//     if (selected) {
//       qc.invalidateQueries({
//         queryKey: [
//           "googleAds",
//           "campaigns",
//           selected.customerId,
//           selected.loginCustomerId,
//         ],
//       });
//     }
//   };

//   const hasMetrics = !!startDate && !!endDate;

//   return (
//     <div className="space-y-6 p-6">
//       <header className="space-y-1">
//         <h1 className="text-xl font-semibold">Google Ads Search Terms</h1>
//         <p className="text-sm text-neutral-500">
//           Preview live search terms and sync them into Supabase.
//         </p>
//       </header>

//       {(customersQ.isLoading || accountsQ.isLoading) && (
//         <div className="text-sm text-neutral-500">Loading Google Ads…</div>
//       )}
//       {(customersQ.error || accountsQ.error) && (
//         <div className="text-sm text-red-600">
//           {(customersQ.error as Error)?.message ||
//             (accountsQ.error as Error)?.message}
//         </div>
//       )}

//       <section className="border rounded-lg p-4 space-y-4">
//         <div className="space-y-2">
//           <label htmlFor="customer-select" className="text-sm font-medium">
//             Customer account
//           </label>
//           <select
//             id="customer-select"
//             className="w-full border rounded p-2"
//             value={selected?.customerId ?? ""}
//             onChange={(e) => {
//               const id = e.target.value;
//               const all = [
//                 ...selection.storedSelectable,
//                 ...selection.unstoredSelectable,
//               ];
//               const sel = all.find((x) => x.customerId === id) ?? null;
//               setSelected(sel);
//               previewM.reset();
//             }}
//             aria-label="Select Google Ads customer account"
//           >
//             <option value="" disabled>
//               Select account…
//             </option>

//             {selection.storedSelectable.length > 0 && (
//               <optgroup label="Stored customers">
//                 {selection.storedSelectable.map((c) => (
//                   <option key={c.customerId} value={c.customerId}>
//                     {c.label} ({c.customerId})
//                     {c.isManagerAccount ? " [MCC]" : ""}
//                   </option>
//                 ))}
//               </optgroup>
//             )}

//             {selection.unstoredSelectable.length > 0 && (
//               <optgroup label="Accessible but not stored">
//                 {selection.unstoredSelectable.map((a) => (
//                   <option key={a.customerId} value={a.customerId}>
//                     {a.label} ({a.customerId})
//                     {a.isManagerAccount ? " [MCC]" : ""}
//                   </option>
//                 ))}
//               </optgroup>
//             )}
//           </select>
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           <div className="space-y-1">
//             <label htmlFor="start-date" className="text-sm font-medium">
//               Start date
//             </label>
//             <input
//               id="start-date"
//               type="date"
//               className="w-full border rounded p-2"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               aria-label="Select start date"
//             />
//           </div>
//           <div className="space-y-1">
//             <label htmlFor="end-date" className="text-sm font-medium">
//               End date
//             </label>
//             <input
//               id="end-date"
//               type="date"
//               className="w-full border rounded p-2"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               aria-label="Select end date"
//             />
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <input
//             id="include-ad-groups"
//             type="checkbox"
//             checked={includeAdGroups}
//             onChange={(e) => setIncludeAdGroups(e.target.checked)}
//             className="rounded border-neutral-300"
//           />
//           <label
//             htmlFor="include-ad-groups"
//             className="text-sm font-medium cursor-pointer"
//           >
//             Include ad groups in campaigns
//           </label>
//         </div>

//         <div className="flex gap-2">
//           {/* <button
//             className="border rounded px-3 py-2 text-sm disabled:opacity-50 hover:bg-neutral-50 transition-colors"
//             disabled={!canRun}
//             onClick={onPreview}
//             aria-label="Preview live search terms"
//           >
//             {previewM.isPending ? "Loading…" : "Preview live terms"}
//           </button> */}

//           <button
//             className="bg-black text-white rounded px-3 py-2 text-sm disabled:opacity-50 hover:bg-neutral-800 transition-colors"
//             disabled={!selected?.customerId || fullSyncM.isPending}
//             onClick={onFullSync}
//             aria-label="Sync search terms to database"
//           >
//             {fullSyncM.isPending ? "Syncing…" : "Sync to DB"}
//           </button>

//           <button
//             className="ml-auto cursor-pointer border rounded px-3 py-2 text-sm hover:bg-neutral-50 transition-colors"
//             onClick={handleRefresh}
//             aria-label="Refresh all data"
//           >
//             Refresh
//           </button>
//         </div>

//         {previewM.error && (
//           <div
//             className="text-sm text-red-600 p-3 bg-red-50 rounded border border-red-200"
//             role="alert"
//           >
//             {previewM.error.message}
//           </div>
//         )}

//         {fullSyncM.error && (
//           <div
//             className="text-sm text-red-600 p-3 bg-red-50 rounded border border-red-200"
//             role="alert"
//           >
//             {fullSyncM.error.message}
//           </div>
//         )}
//         {fullSyncM.data && (
//           <div className="text-sm p-3 bg-blue-50 rounded border border-blue-200">
//             <span className="font-medium">✓ Account structure synced</span>
//             <div className="mt-1 text-neutral-600">
//               {fullSyncM.data.totalCampaigns} campaigns ·{" "}
//               {fullSyncM.data.totalAdGroups} ad groups ·{" "}
//               {fullSyncM.data.totalKeywords} keywords
//             </div>
//           </div>
//         )}
//       </section>

//       <CampaignsSection
//         campaigns={campaigns}
//         isLoading={campaignsQ.isLoading}
//         error={campaignsQ.error}
//         hasMetrics={hasMetrics}
//         isSelected={!!selected}
//         customerId={selected?.customerId ?? ""}
//         loginCustomerId={selected?.loginCustomerId ?? ""}
//       />

//       {/* <SearchTermsSection
//         title="Live preview"
//         terms={previewM.data ?? []}
//         isLoading={previewM.isPending}
//         error={previewM.error}
//         emptyMessage="Run 'Preview live terms' to see API results."
//         showMetrics
//       /> */}

//       <SearchTermsSection
//         title="Stored Search terms"
//         terms={storedTermsQ.data ?? []}
//         isLoading={storedTermsQ.isLoading}
//         error={storedTermsQ.error}
//         emptyMessage={
//           selected
//             ? "No stored terms for this range."
//             : "Select a customer to view stored terms."
//         }
//         showMetrics={false}
//       />

//       <SyncJobsSection
//         jobs={syncJobsQ.data ?? []}
//         isLoading={syncJobsQ.isLoading}
//         error={syncJobsQ.error}
//         isSelected={!!selected}
//       />
//     </div>
//   );
// }

"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { googleAdsApi } from "@/src/lib/google-ads-client";
import {
  IGoogleAdsAccount,
  IGoogleAdsSearchTerm,
  ISyncResult,
  TSyncSearchTermsInput,
  IGoogleAdsCampaign,
  TGoogleAdsCustomer,
  TSyncJob,
  TFetchSearchTermsInput,
  IFullSyncResult,
  TFullSyncInput,
} from "@/src/types/api/google-ads.types";

import { CampaignsSection } from "./campaigns-section";
import { SearchTermsSection } from "./search-terms-section";
import { SyncJobsSection } from "./sync-jobs-section";
import { lastNDaysRange } from "@/src/utils/google-ads";

type TSelectableAccount = {
  customerId: string;
  label: string;
  loginCustomerId: string;
  isManagerAccount: boolean;
};

export function GoogleAdsPanel() {
  const qc = useQueryClient();

  const [selected, setSelected] = useState<TSelectableAccount | null>(null);
  const [includeAdGroups, setIncludeAdGroups] = useState(true);

  const initialRange = useMemo(() => lastNDaysRange(30), []);

  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);

  const customersQ = useQuery<TGoogleAdsCustomer[]>({
    queryKey: ["googleAds", "customers"],
    queryFn: () => googleAdsApi.customers(),
  });

  const accountsQ = useQuery<IGoogleAdsAccount[]>({
    queryKey: ["googleAds", "accounts"],
    queryFn: () => googleAdsApi.accounts(),
  });

  const campaignsQ = useQuery<IGoogleAdsCampaign[]>({
    queryKey: [
      "googleAds",
      "campaigns",
      selected?.customerId,
      selected?.loginCustomerId,
      startDate,
      endDate,
      includeAdGroups,
    ],
    queryFn: () =>
      googleAdsApi.campaigns({
        customerId: selected!.customerId,
        loginCustomerId: selected!.loginCustomerId,
        startDate,
        endDate,
        includeAdGroups,
      }),
    enabled: !!selected?.customerId && !!selected?.loginCustomerId,
  });

  // ✅ Keep search terms sync mutation
  const syncSearchTermsM = useMutation<
    ISyncResult,
    Error,
    TSyncSearchTermsInput
  >({
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

  // ✅ Keep full structure sync mutation
  const fullSyncM = useMutation<IFullSyncResult, Error, TFullSyncInput>({
    mutationFn: (dto) => googleAdsApi.syncAccountStructure(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["googleAds", "customers"] });
      qc.invalidateQueries({ queryKey: ["googleAds", "campaigns"] });
      if (selected) {
        qc.invalidateQueries({
          queryKey: ["googleAds", "syncJobs", selected.customerId],
        });
      }
    },
  });

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
    enabled: !!selected && !!startDate && !!endDate,
  });

  const syncJobsQ = useQuery<TSyncJob[]>({
    queryKey: ["googleAds", "syncJobs", selected?.customerId],
    queryFn: () => googleAdsApi.syncJobs(selected!.customerId),
    enabled: !!selected,
    refetchInterval: (query) =>
      query.state.data?.some((j) => j.status === "running") ? 4000 : false,
  });

  const customers = customersQ.data ?? [];
  const accounts = accountsQ.data ?? [];
  const campaigns = campaignsQ.data ?? [];

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

  // ✅ Handler for search terms sync
  const onSyncSearchTerms = () => {
    if (!selected) return;

    syncSearchTermsM.mutate({
      customerId: selected.customerId,
      startDate,
      endDate,
      loginCustomerId: selected.loginCustomerId,
    });
  };

  // ✅ Handler for full structure sync
  const onFullSync = () => {
    if (!selected) return;

    fullSyncM.mutate({
      customerId: selected.customerId,
      loginCustomerId: selected.loginCustomerId,
      startDate,
      endDate,
    });
  };

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ["googleAds", "accounts"] });
    qc.invalidateQueries({ queryKey: ["googleAds", "customers"] });
    if (selected) {
      qc.invalidateQueries({
        queryKey: [
          "googleAds",
          "campaigns",
          selected.customerId,
          selected.loginCustomerId,
        ],
      });
    }
  };

  const hasMetrics = !!startDate && !!endDate;

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Google Ads Management</h1>
        <p className="text-sm text-neutral-500">
          Sync campaigns, ad groups, keywords, and search terms to your
          database.
        </p>
      </header>

      {(customersQ.isLoading || accountsQ.isLoading) && (
        <div className="text-sm text-neutral-500">Loading Google Ads…</div>
      )}
      {(customersQ.error || accountsQ.error) && (
        <div className="text-sm text-red-600">
          {(customersQ.error as Error)?.message ||
            (accountsQ.error as Error)?.message}
        </div>
      )}

      <section className="border rounded-lg p-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="customer-select" className="text-sm font-medium">
            Customer account
          </label>
          <select
            id="customer-select"
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
            }}
            aria-label="Select Google Ads customer account"
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
            <label htmlFor="start-date" className="text-sm font-medium">
              Start date
            </label>
            <input
              id="start-date"
              type="date"
              className="w-full border rounded p-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Select start date"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="end-date" className="text-sm font-medium">
              End date
            </label>
            <input
              id="end-date"
              type="date"
              className="w-full border rounded p-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="Select end date"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="include-ad-groups"
            type="checkbox"
            checked={includeAdGroups}
            onChange={(e) => setIncludeAdGroups(e.target.checked)}
            className="rounded border-neutral-300"
          />
          <label
            htmlFor="include-ad-groups"
            className="text-sm font-medium cursor-pointer"
          >
            Include ad groups in campaigns
          </label>
        </div>

        <div className="flex gap-2">
          {/* ✅ Full Structure Sync Button */}
          <button
            className="bg-blue-600 text-white rounded px-3 py-2 text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
            disabled={!selected?.customerId || fullSyncM.isPending}
            onClick={onFullSync}
            aria-label="Sync account structure"
          >
            {fullSyncM.isPending
              ? "Syncing Account Structure…"
              : "Sync Account Structure"}
          </button>

          {/* ✅ Search Terms Sync Button */}
          {/* <button
            className="bg-black text-white rounded px-3 py-2 text-sm disabled:opacity-50 hover:bg-neutral-800 transition-colors"
            disabled={!selected?.customerId || syncSearchTermsM.isPending}
            onClick={onSyncSearchTerms}
            aria-label="Sync search terms"
          >
            {syncSearchTermsM.isPending
              ? "Syncing Terms…"
              : "Sync Search Terms"}
          </button> */}

          <button
            className="ml-auto cursor-pointer border rounded px-3 py-2 text-sm hover:bg-neutral-50 transition-colors"
            onClick={handleRefresh}
            aria-label="Refresh all data"
          >
            Refresh
          </button>
        </div>

        {/* ✅ Full Sync Status */}
        {fullSyncM.error && (
          <div
            className="text-sm text-red-600 p-3 bg-red-50 rounded border border-red-200"
            role="alert"
          >
            {fullSyncM.error.message}
          </div>
        )}
        {fullSyncM.data && (
          <div className="text-sm p-3 bg-blue-50 rounded border border-blue-200">
            <span className="font-medium">✓ Account structure synced</span>
            <div className="mt-1 text-neutral-600">
              {fullSyncM.data.totalCampaigns} campaigns ·{" "}
              {fullSyncM.data.totalAdGroups} ad groups ·{" "}
              {fullSyncM.data.totalKeywords} keywords
            </div>
          </div>
        )}

        {/* ✅ Search Terms Sync Status */}
        {syncSearchTermsM.error && (
          <div
            className="text-sm text-red-600 p-3 bg-red-50 rounded border border-red-200"
            role="alert"
          >
            {syncSearchTermsM.error.message}
          </div>
        )}
        {syncSearchTermsM.data && (
          <div className="text-sm p-3 bg-green-50 rounded border border-green-200">
            <span className="font-medium">
              {syncSearchTermsM.data.status === "completed" ? "✓" : "✗"}{" "}
              {syncSearchTermsM.data.status}
            </span>{" "}
            · Stored {syncSearchTermsM.data.recordsStored}/
            {syncSearchTermsM.data.recordsFetched}
          </div>
        )}
      </section>

      <CampaignsSection
        campaigns={campaigns}
        isLoading={campaignsQ.isLoading}
        error={campaignsQ.error}
        hasMetrics={hasMetrics}
        isSelected={!!selected}
        customerId={selected?.customerId ?? ""}
        loginCustomerId={selected?.loginCustomerId ?? ""}
      />

      <SearchTermsSection
        title="Stored Search terms"
        terms={storedTermsQ.data ?? []}
        isLoading={storedTermsQ.isLoading}
        error={storedTermsQ.error}
        emptyMessage={
          selected
            ? "No stored terms for this range."
            : "Select a customer to view stored terms."
        }
        showMetrics={false}
      />

      <SyncJobsSection
        jobs={syncJobsQ.data ?? []}
        isLoading={syncJobsQ.isLoading}
        error={syncJobsQ.error}
        isSelected={!!selected}
      />
    </div>
  );
}
