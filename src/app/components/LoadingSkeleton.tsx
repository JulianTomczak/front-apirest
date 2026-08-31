interface LoadingSkeletonProps {
  rows?: number;
  height?: number;
}

export default function LoadingSkeleton({ rows = 5, height = 72 }: LoadingSkeletonProps) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: `${height}px`, borderRadius: "12px" }} />
      ))}
    </div>
  );
}
