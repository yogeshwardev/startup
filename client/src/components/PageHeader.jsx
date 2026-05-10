const PageHeader = ({ eyebrow, title, description, action }) => (
  <div className="mb-6 animate-slide-up flex items-start justify-between gap-4">
    <div>
      {eyebrow && (
        <p className="text-[10px] font-bold text-brand-400 tracking-[0.15em] uppercase mb-1.5 flex items-center gap-2">
          <span className="w-4 h-px bg-brand-500/50" />
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl md:text-3xl font-bold font-display leading-tight" style={{ color: "var(--text-primary)" }}>
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 text-sm max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default PageHeader;
