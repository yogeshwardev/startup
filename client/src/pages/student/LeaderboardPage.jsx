import { useEffect, useState } from "react";
import http from "../../api/http";
import { Trophy, Medal, Crown, TrendingUp, Building2 } from "lucide-react";

const podiumColors = [
  { bg: "from-amber-500/20 to-amber-500/5", border: "rgba(245, 158, 11, 0.2)", text: "text-amber-400", icon: Crown, glow: "rgba(245, 158, 11, 0.08)" },
  { bg: "from-slate-400/15 to-slate-400/5", border: "rgba(148, 163, 184, 0.15)", text: "text-slate-300", icon: Medal, glow: "rgba(148, 163, 184, 0.06)" },
  { bg: "from-amber-700/15 to-amber-700/5", border: "rgba(180, 83, 9, 0.15)", text: "text-amber-600", icon: Medal, glow: "rgba(180, 83, 9, 0.06)" },
];

const LeaderboardPage = () => {
  const [leaderboards, setLeaderboards] = useState({ global: [], department: [] });

  useEffect(() => {
    http.get("/leaderboards").then((response) => setLeaderboards(response.data));
  }, []);

  const topThree = leaderboards.global.slice(0, 3);
  const rest = leaderboards.global.slice(3);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400 tracking-[0.2em] uppercase">Leaderboard</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-[var(--text-primary)] mb-2">
          Top <span className="gradient-text-warm">Performers</span>
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">Rankings based on problems solved and department war points.</p>
      </div>

      {/* Podium - Top 3 */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
          {topThree.map((row, index) => {
            const style = podiumColors[index];
            const PodiumIcon = style.icon;
            return (
              <div
                key={row.userId}
                className={`rounded-3xl p-6 text-center transition-all relative overflow-hidden ${index === 0 ? "sm:order-2 sm:-mt-4" : index === 1 ? "sm:order-1" : "sm:order-3"}`}
                style={{
                  background: `linear-gradient(135deg, ${style.glow}, transparent)`,
                  border: `1px solid ${style.border}`,
                }}
              >
                <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${style.bg}`}>
                  <PodiumIcon className={`w-6 h-6 ${style.text}`} />
                </div>
                <p className={`text-2xl font-bold font-display ${style.text} mb-1`}>#{index + 1}</p>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 line-clamp-1">{row.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-3">{row.department}</p>
                <p className="text-brand-400 font-bold text-lg">{row.solved} solved</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Remaining Users */}
        <div className="card rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            <h3 className="text-base font-bold font-display text-[var(--text-primary)]">All Rankings</h3>
          </div>
          <div className="space-y-2">
            {rest.map((row, index) => (
              <div key={row.userId} className="flex items-center justify-between rounded-xl p-3.5 hover:bg-white/[0.02] transition-all"
                style={{ border: "1px solid rgba(100, 120, 200, 0.04)" }}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--text-muted)] w-8 text-center">#{index + 4}</span>
                  <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-400">
                    {row.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{row.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{row.department}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-brand-400">{row.solved} solved</p>
              </div>
            ))}
            {rest.length === 0 && topThree.length <= 3 && (
              <p className="text-center text-[var(--text-muted)] text-sm py-6">No additional rankings yet</p>
            )}
          </div>
        </div>

        {/* Department Rankings */}
        <div className="card rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-4 h-4 text-accent" />
            <h3 className="text-base font-bold font-display text-[var(--text-primary)]">Department Rankings</h3>
          </div>
          <div className="space-y-3">
            {leaderboards.department.map((row, index) => {
              const maxPoints = leaderboards.department[0]?.points || 1;
              const percentage = Math.round((row.points / maxPoints) * 100);
              return (
                <div key={row._id} className="rounded-xl p-4" style={{ border: "1px solid rgba(100, 120, 200, 0.04)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--text-muted)]">#{index + 1}</span>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{row._id}</p>
                    </div>
                    <p className="text-sm font-bold text-accent">{row.points} pts</p>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percentage}%`,
                        background: "linear-gradient(90deg, #6366f1, #06b6d4)",
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5">{row.solved} problems solved</p>
                </div>
              );
            })}
            {leaderboards.department.length === 0 && (
              <p className="text-center text-[var(--text-muted)] text-sm py-6">No department rankings yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;



