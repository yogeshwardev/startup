const StatCard = ({ label, value, hint }) => (
  <div className="app-surface rounded-[2rem] p-5">
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    <h3 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
    {hint ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
  </div>
);

export default StatCard;
