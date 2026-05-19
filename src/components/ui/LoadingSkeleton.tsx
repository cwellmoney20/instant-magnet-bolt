interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-surface-container-high rounded-lg ${className}`} />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant shadow-sm">
      <SkeletonBlock className="w-full h-48 rounded-none" />
      <div className="p-5 space-y-3">
        <SkeletonBlock className="h-5 w-3/4" />
        <SkeletonBlock className="h-4 w-1/2" />
        <SkeletonBlock className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <SkeletonBlock className="h-6 w-16" />
          <SkeletonBlock className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

export function PolaroidSkeleton() {
  return (
    <div className="polaroid-card animate-pulse">
      <SkeletonBlock className="w-full aspect-square rounded-none" />
      <div className="mt-2 px-1">
        <SkeletonBlock className="h-3 w-20 mx-auto" />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ count = 1, className = '' }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className={className} />
      ))}
    </>
  );
}
