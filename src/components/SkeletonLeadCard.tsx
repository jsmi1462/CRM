export default function SkeletonLeadCard() {
  return (
    <div className="bg-white rounded-xl border border-cozy-border border-l-4 border-l-gray-200 shadow-[var(--shadow-cozy)] p-4 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-3 w-16 bg-gray-50 rounded" />
          </div>
        </div>
        <div className="w-4 h-4 bg-gray-50 rounded" />
      </div>

      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-50 rounded" />
        <div className="h-3 w-2/3 bg-gray-50 rounded" />
      </div>

      <div className="pt-2 flex gap-2 mt-auto">
        <div className="h-8 flex-1 bg-gray-50 rounded-lg" />
        <div className="h-8 flex-1 bg-gray-50 rounded-lg" />
      </div>
    </div>
  );
}
