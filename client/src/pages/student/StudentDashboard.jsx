import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import http from "../../api/http";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import Skeleton from "../../components/Skeleton";
import StatCard from "../../components/StatCard";

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [leaderboards, setLeaderboards] = useState({ global: [] });
  const [departmentWar, setDepartmentWar] = useState({ departments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [dashboardRes, leaderboardsRes, warRes] = await Promise.all([
        http.get("/dashboard"),
        http.get("/leaderboards"),
        http.get("/department-war"),
      ]);
      setDashboard(dashboardRes.data);
      setLeaderboards(leaderboardsRes.data);
      setDepartmentWar(warRes.data);
      setLoading(false);
    };

    load();
  }, []);

  if (loading || !dashboard) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Competitive coding home"
        description="A focused student dashboard for practice, contests, and department competition."
        action={
          dashboard.todaysProblem ? (
            <Link to={`/problems/${dashboard.todaysProblem.slug}`} className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white">
              Solve now
            </Link>
          ) : null
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Problems solved" value={dashboard.solvedCount} />
        <StatCard label="Accuracy" value={`${dashboard.accuracy}%`} />
        <StatCard label="Streak" value={dashboard.streak} />
        <StatCard label="Rank" value={dashboard.rank || "-"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Today's problem">
          {dashboard.todaysProblem ? (
            <div className="app-muted rounded-[1.75rem] p-5">
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{dashboard.todaysProblem.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{dashboard.todaysProblem.difficulty} • Keep your streak alive.</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No daily problem selected.</p>
          )}
        </SectionCard>

        <SectionCard title="Department war snapshot">
          <div className="space-y-3">
            {departmentWar.departments.slice(0, 4).map((entry, index) => (
              <div key={entry._id} className="app-muted flex items-center justify-between rounded-[1.5rem] p-4">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    #{index + 1} {entry._id}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Weekly ranking</p>
                </div>
                <p className="text-lg font-bold text-brand-500">{entry.points} pts</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Recent submissions">
          <div className="space-y-3">
            {dashboard.recentSubmissions.map((submission) => (
              <div key={submission._id} className="app-muted rounded-[1.5rem] p-4 text-sm">
                <p className="font-semibold text-slate-900 dark:text-white">{submission.problemId?.title}</p>
                <p className="mt-2 text-slate-500 dark:text-slate-400">{submission.status} • {submission.language.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Top users">
          <div className="space-y-3">
            {leaderboards.global.slice(0, 5).map((entry, index) => (
              <div key={entry.userId} className="app-muted flex items-center justify-between rounded-[1.5rem] p-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    #{index + 1} {entry.name}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">{entry.department}</p>
                </div>
                <p className="font-semibold text-brand-500">{entry.solved} solved</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
};

export default StudentDashboard;
