const variants = {
  ADMIN: "bg-red-500/12 text-red-600 dark:text-red-200",
  TEACHER: "bg-brand-500/12 text-brand-700 dark:text-brand-100",
  STUDENT: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-200",
  active: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-200",
  blocked: "bg-amber-500/12 text-amber-700 dark:text-amber-200",
};

const Badge = ({ children, variant = "active" }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${variants[variant] || "bg-slate-500/10 text-slate-600 dark:text-slate-300"}`}>
    {children}
  </span>
);

export default Badge;
