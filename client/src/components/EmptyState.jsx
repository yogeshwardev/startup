const EmptyState = ({ title, description }) => (
  <div className="rounded-3xl border border-dashed border-slate-300/70 p-8 text-center dark:border-white/10">
    <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
  </div>
);

export default EmptyState;
