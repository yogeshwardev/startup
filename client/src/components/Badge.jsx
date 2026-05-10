const variants = {
  ADMIN: "bg-rose-500/12 text-rose-300 border border-rose-500/20",
  TEACHER: "bg-brand-500/12 text-brand-300 border border-brand-500/20",
  STUDENT: "bg-emerald-500/12 text-emerald-300 border border-emerald-500/20",
  active: "bg-emerald-500/12 text-emerald-300 border border-emerald-500/20",
  blocked: "bg-amber-500/12 text-amber-300 border border-amber-500/20",
};

const Badge = ({ children, variant = "active" }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${variants[variant] || "bg-white/5 text-gray-400 border border-white/10"}`}>
    {children}
  </span>
);

export default Badge;
