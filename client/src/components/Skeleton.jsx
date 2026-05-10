const Skeleton = ({ className = "" }) => (
  <div
    className={`rounded-xl animate-shimmer ${className}`}
    style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-subtle)",
    }}
  />
);

export default Skeleton;
