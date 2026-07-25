export const DashboardSkeleton = () => {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-zinc-200" />
        <div className="h-4 w-80 max-w-full rounded bg-zinc-200" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-zinc-200 bg-white p-5"
          >
            <div className="mb-3 h-3 w-20 rounded bg-zinc-200" />
            <div className="h-8 w-12 rounded bg-zinc-200" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-xl border border-zinc-200 bg-white p-5"
          >
            <div className="mb-4 h-3 w-28 rounded bg-zinc-200" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-zinc-100" />
              <div className="h-4 w-3/4 rounded bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-64 rounded-xl border border-zinc-200 bg-white lg:col-span-2" />
        <div className="space-y-6">
          <div className="h-56 rounded-xl border border-zinc-200 bg-white" />
          <div className="h-40 rounded-xl border border-zinc-200 bg-white" />
        </div>
      </div>
    </div>
  );
};
