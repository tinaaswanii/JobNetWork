export default function Pagination({
  offset,
  limit,
  total,
  onChange,
}: {
  offset: number;
  limit: number;
  total: number;
  onChange: (newOffset: number) => void;
}) {
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex items-center justify-between pt-4 text-sm">
      <button
        disabled={offset === 0}
        onClick={() => onChange(Math.max(0, offset - limit))}
        className="px-3 py-1.5 border border-ink/20 disabled:opacity-30 hover:border-mustard"
      >
        Previous
      </button>
      <span className="text-ink/60">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={offset + limit >= total}
        onClick={() => onChange(offset + limit)}
        className="px-3 py-1.5 border border-ink/20 disabled:opacity-30 hover:border-mustard"
      >
        Next
      </button>
    </div>
  );
}
