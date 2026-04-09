export function SkeletonCard() {
  return (
    <div className="glass-card rounded-[32px] overflow-hidden flex flex-col h-full border-white/5 shadow-2xl shadow-black/50">
      {/* Image skeleton */}
      <div className="relative h-72 overflow-hidden">
        <div className="w-full h-full skeleton-shimmer rounded-none" />
        {/* Category badge skeleton */}
        <div className="absolute top-6 left-6">
          <div className="h-6 w-24 rounded-full skeleton-shimmer" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-8 flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          {/* Title */}
          <div className="h-7 w-3/4 rounded-xl skeleton-shimmer" />
          <div className="h-5 w-1/2 rounded-xl skeleton-shimmer" />

          {/* Meta rows */}
          <div className="space-y-3 mt-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg skeleton-shimmer flex-shrink-0" />
              <div className="h-4 w-36 rounded-lg skeleton-shimmer" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg skeleton-shimmer flex-shrink-0" />
              <div className="h-4 w-48 rounded-lg skeleton-shimmer" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-8">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded skeleton-shimmer" />
            <div className="h-7 w-24 rounded-lg skeleton-shimmer" />
          </div>
          <div className="h-11 w-36 rounded-2xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
