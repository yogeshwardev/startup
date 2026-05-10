import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import http from "../../api/http";
import Skeleton from "../../components/Skeleton";
import { Flame, Zap, Trophy, Target, ArrowRight, Code, GraduationCap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const StatCardItem = ({ icon: Icon, iconColor, iconBg, label, value }) => (
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-4 py-3 text-sm">
        <p className="font-bold" style={{ color: "var(--text-primary)" }}>{label}</p>
        <p className="text-brand-400 font-semibold">{payload[0].value} problems</p>
      </div>
    );
  }
  return null;
};

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const dashboardRes = await http.get("/dashboard");
        setDashboard(dashboardRes.data);
      } catch (err) {
        setDashboard({
          streak: 0,
          solvedCount: 0,
          rank: 1,
          accuracy: 0,
          todaysProblem: null,
          recentSubmissions: [],
          activityData: []
        });
      }
      setLoading(false);
    };

    load();
  }, []);

  if (loading || !dashboard) {
    return (
      <div className="space-y-5 max-w-7xl mx-auto">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-22 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.8fr_1fr]">
          <Skeleton className="h-[360px] rounded-xl" />
          <div className="space-y-5">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Stat Cards Row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCardItem
          icon={Flame} iconColor="text-orange-400" iconBg="bg-orange-500/10"
          label="Current Streak" value={`${dashboard.streak || 0} Days`}
        />
        <StatCardItem
          icon={Zap} iconColor="text-yellow-400" iconBg="bg-yellow-500/10"
          label="Problems Solved" value={dashboard.solvedCount || 0}
        />
        <StatCardItem
          icon={Trophy} iconColor="text-brand-400" iconBg="bg-brand-500/10"
          label="Weekly Rank" value={`#${dashboard.rank || 1}`}
        />
        <StatCardItem
          icon={Target} iconColor="text-emerald-400" iconBg="bg-emerald-500/10"
          label="Accuracy" value={`${dashboard.accuracy || 0}%`}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.8fr_1fr]">
        {/* Activity Chart */}
        <div className="card p-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-bold font-display" style={{ color: "var(--text-primary)" }}>Activity Overview</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Problems solved this week</p>
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
              <button className="px-3 py-1.5 text-xs font-semibold bg-brand-500/10 text-brand-400">Weekly</button>
              <button className="px-3 py-1.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Monthly</button>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.activityData || []} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProblems" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="problems" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorProblems)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Daily Challenge Card */}
          <div className="card relative overflow-hidden p-5 animate-slide-up" style={{
            animationDelay: "300ms",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, var(--bg-card) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.15)",
          }}>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-[10px] font-bold text-brand-300 tracking-[0.12em] uppercase">Daily Challenge</span>
            </div>

            <h3 className="text-lg font-bold font-display mb-1.5 line-clamp-1" style={{ color: "var(--text-primary)" }}>
              {dashboard.todaysProblem?.title || "Hostel Room Maximum"}
            </h3>
            <p className="text-xs mb-4 leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>
              {dashboard.todaysProblem?.description || "A daily challenge to keep your coding skills sharp. Solve it to maintain your streak!"}
            </p>

            <div className="flex items-center justify-between">
              <span className="badge badge-info text-[10px] tracking-wider">
                {dashboard.todaysProblem?.difficulty || "Easy"}
              </span>

              <Link
                to={dashboard.todaysProblem ? `/problems/${dashboard.todaysProblem.slug}` : "/problems"}
                className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-[var(--text-primary)] hover:bg-brand-600 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="card p-5 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-display" style={{ color: "var(--text-primary)" }}>Recent Submissions</h3>
              </div>
              <Link to="/submissions" className="text-[10px] font-bold hover:text-brand-400 transition-all flex items-center gap-1 uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}>
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {dashboard.recentSubmissions?.length > 0 ? dashboard.recentSubmissions.slice(0, 5).map((sub) => (
                <div key={sub._id} className="rounded-lg p-3 flex items-center justify-between hover:bg-white/[0.02] transition-all"
                  style={{ border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${sub.status === "Accepted" ? "bg-emerald-400" : "bg-rose-400"}`} />
                    <div>
                      <p className="text-sm font-semibold line-clamp-1" style={{ color: "var(--text-primary)" }}>{sub.problemId?.title || "Unknown Problem"}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${sub.status === "Accepted" ? "text-emerald-400" : "text-rose-400"}`}>
                    {sub.status}
                  </span>
                </div>
              )) : (
                <div className="text-center p-5 text-sm" style={{ color: "var(--text-muted)" }}>No recent submissions</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;



