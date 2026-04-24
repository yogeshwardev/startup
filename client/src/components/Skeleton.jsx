const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-200/70 dark:bg-white/10 ${className}`} />
);

export default Skeleton;
