import { useEffect, useState } from "react";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import { Swords, Shield, Trophy, TrendingUp, Flame } from "lucide-react";

const DepartmentWarPage = () => {
  const [departmentWar, setDepartmentWar] = useState(null);

  useEffect(() => {
    http.get("/department-war").then((response) => setDepartmentWar(response.data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-2 mb-2">
          <Swords className="w-4 h-4 text-rose-400" />
          <span className="text-[10px] font-bold text-rose-400 tracking-[0.2em] uppercase">Department War</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-[var(--text-primary)] mb-2">
          Weekly <span style={{
            background: "linear-gradient(135deg, #ef4444, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Battle</span>
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">Departments compete every week. Easy = 10pts, Medium = 20pts, Hard = 30pts.</p>
      </div>

      {/* Score Info Banner */}
      <div className="rounded-3xl p-6 animate-slide-up relative overflow-hidden" style={{
        animationDelay: "100ms",
        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(245, 158, 11, 0.04) 100%)",
        border: "1px solid rgba(239, 68, 68, 0.1)",
      }}>
        <Shield className="absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 text-rose-500/5" strokeWidth={0.8} />
        <div className="flex flex-wrap gap-8 relative z-10">
          {[
            { label: "Easy", pts: "10 pts", color: "text-emerald-400" },
            { label: "Medium", pts: "20 pts", color: "text-amber-400" },
            { label: "Hard", pts: "30 pts", color: "text-rose-400" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`text-xs font-bold ${item.color}`}>{item.label}</span>
              <span className="text-xs text-[var(--text-muted)]">→</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">{item.pts}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Department Leaderboard */}
        <div className="card rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold font-display text-[var(--text-primary)]">Department Leaderboard</h3>
          </div>
          {departmentWar?.departments?.length ? (
            <div className="space-y-3">
              {departmentWar.departments.map((entry, index) => {
                const maxPts = departmentWar.departments[0]?.points || 1;
                const pct = Math.round((entry.points / maxPts) * 100);
                const isFirst = index === 0;
                return (
                  <div key={entry._id} className="rounded-xl p-4 transition-all hover:bg-white/[0.02]"
                    style={{ border: `1px solid ${isFirst ? "rgba(245, 158, 11, 0.12)" : "rgba(100, 120, 200, 0.04)"}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${isFirst ? "text-amber-400" : "text-[var(--text-muted)]"}`}>#{index + 1}</span>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{entry._id}</p>
                      </div>
                      <p className={`text-lg font-bold ${isFirst ? "text-amber-400" : "text-brand-400"}`}>{entry.points} pts</p>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${pct}%`,
                          background: isFirst
                            ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                            : "linear-gradient(90deg, #6366f1, #06b6d4)",
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1.5">{entry.solved} problems solved this week</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No department rankings yet" description="Weekly accepted solves will appear here." />
          )}
        </div>

        {/* Top Contributors */}
        <div className="card rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center gap-2 mb-5">
            <Flame className="w-4 h-4 text-orange-400" />
            <h3 className="text-base font-bold font-display text-[var(--text-primary)]">Top Contributors</h3>
          </div>
          {departmentWar?.topContributors?.length ? (
            <div className="space-y-2.5">
              {departmentWar.topContributors.map((entry, index) => (
                <div key={`${entry._id.userId}-${index}`} className="rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.02] transition-all"
                  style={{ border: "1px solid rgba(100, 120, 200, 0.04)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[var(--text-muted)] w-7 text-center">#{index + 1}</span>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500/20 to-accent/10 flex items-center justify-center text-xs font-bold text-brand-400">
                      {entry._id.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{entry._id.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{entry._id.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-400">{entry.points} pts</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{entry.solved} solved</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No top contributors yet" description="Top coders will appear here as departments earn points." />
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentWarPage;



