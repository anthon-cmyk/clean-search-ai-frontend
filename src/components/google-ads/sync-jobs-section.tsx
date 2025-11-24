"use client";

import { TSyncJob } from "@/src/types/api/google-ads.types";

type TSyncJobsSectionProps = {
  jobs: TSyncJob[];
  isLoading: boolean;
  error: Error | null;
  isSelected: boolean;
};

export function SyncJobsSection({
  jobs,
  isLoading,
  error,
  isSelected,
}: TSyncJobsSectionProps) {
  return (
    <section className="border rounded-lg">
      <div className="p-3 border-b font-medium text-sm">Sync Jobs</div>
      <div className="max-h-[260px] overflow-auto">
        {!isSelected && (
          <div className="p-3 text-sm text-neutral-500">
            Select a customer to view jobs.
          </div>
        )}
        {isSelected && isLoading && (
          <div className="p-3 text-sm text-neutral-500">Loading jobs…</div>
        )}
        {error && (
          <div className="p-3 text-sm text-red-600">{error.message}</div>
        )}
        {isSelected && !isLoading && jobs.length === 0 && (
          <div className="p-3 text-sm text-neutral-500">No sync jobs yet.</div>
        )}
        {jobs.map((job) => (
          <div key={job.id} className="p-3 border-t text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`font-medium ${
                  job.status === "failed"
                    ? "text-red-600"
                    : job.status === "completed"
                    ? "text-green-600"
                    : job.status === "running"
                    ? "text-blue-600"
                    : "text-neutral-600"
                }`}
              >
                {job.status.toUpperCase()}
              </span>
              <span className="text-neutral-500">
                {job.syncStartDate} → {job.syncEndDate}
              </span>
            </div>
            <div className="text-neutral-500 text-xs">
              Type: {job.syncType} · Records: {job.recordsProcessed ?? 0}
            </div>
            {job.errorMessage && (
              <div className="text-red-600 text-xs mt-1">
                {job.errorMessage}
              </div>
            )}
            <div className="text-neutral-400 text-xs mt-1">
              Created: {new Date(job.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
