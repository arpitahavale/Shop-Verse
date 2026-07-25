/** Shown by <Suspense> while a lazy route chunk is loading */
function ShimmerFallback() {
  return (
    <div className="shimmer-fallback" role="status" aria-label="Loading page">
      <div className="shimmer-bar shimmer-bar-lg" />
      <div className="shimmer-bar shimmer-bar-md" />
      <div className="shimmer-bar shimmer-bar-sm" />
      <div className="shimmer-grid">
        <div className="shimmer-card" />
        <div className="shimmer-card" />
        <div className="shimmer-card" />
      </div>
    </div>
  );
}

export default ShimmerFallback;
