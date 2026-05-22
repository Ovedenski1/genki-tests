export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
      <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
        {label}...
      </div>
    </div>
  );
}