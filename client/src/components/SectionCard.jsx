const SectionCard = ({ title, action, children, className = "" }) => (
  <section className={`app-surface rounded-[2rem] p-6 ${className}`}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

export default SectionCard;
