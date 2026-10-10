export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse space-y-6">
      <div className="h-8 w-64 rounded bg-muted" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-muted" />
    </div>
  );
}
