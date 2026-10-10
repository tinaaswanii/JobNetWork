"use client";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <h2 className="font-semibold text-red-900">Couldn&apos;t load this page</h2>
      <p className="mt-1 text-sm text-red-800">
        Something went wrong fetching your data. Check your connection and try again.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
