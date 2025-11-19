export function SuccessMessage({
  searchParams,
}: {
  searchParams: { connected?: string; accounts?: string };
}) {
  if (!searchParams.connected) return null;

  return (
    <div className="mb-6 rounded-md bg-green-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-green-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            Successfully connected!
          </h3>
          <div className="mt-2 text-sm text-green-700">
            <p>
              {searchParams.accounts
                ? `Connected ${searchParams.accounts} Google Ads account${
                    Number(searchParams.accounts) > 1 ? "s" : ""
                  }.`
                : "Your Google Ads account has been connected."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
