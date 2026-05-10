const StatCard = ({ icon: Icon, label, value, iconColor = "text-brand-400", iconBg = "bg-brand-500/10" }) => (
  <div className="card-interactive p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.8} />
    </div>
    <div>
      <p className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-xl font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  </div>
);

export default StatCard;
