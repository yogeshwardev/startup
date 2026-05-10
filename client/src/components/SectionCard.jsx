const SectionCard = ({ title, action, children, className = "" }) => (
  <div className={`card p-5 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h3 className="text-base font-bold font-display" style={{ color: "var(--text-primary)" }}>{title}</h3>
        )}
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export default SectionCard;
