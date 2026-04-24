import { useEffect, useState } from "react";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import Skeleton from "../../components/Skeleton";
import StatCard from "../../components/StatCard";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    http.get("/analytics").then((response) => setAnalytics(response.data));
  }, []);

  if (!analytics) {
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
        eyebrow="Admin dashboard"
        title="Campus operations overview"
        description="A polished control center for onboarding, oversight, and user-management health across the platform."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={analytics.totalUsers} hint="All accounts across roles" />
        <StatCard label="Active users" value={analytics.activeUsers} hint="Submission activity in the last 7 days" />
        <StatCard label="Active students" value={analytics.activeStudents} hint="Currently unblocked student accounts" />
        <StatCard label="Problem inventory" value={analytics.totalProblems} hint="Practice bank and daily sets" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Department Distribution Chart">
          {analytics.departmentPerformance.length ? (
            <div className="space-y-4">
              {analytics.departmentPerformance.map((entry) => (
                <div key={entry._id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">{entry._id}</span>
                    <span className="text-slate-500 dark:text-slate-400">{entry.solved} solved</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-white/10">
                    <div className="h-3 rounded-full bg-gradient-to-r from-brand-500 to-accent" style={{ width: `${Math.min(100, entry.score)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No analytics yet" description="Department performance will appear once submissions start coming in." />
          )}
        </SectionCard>

        <SectionCard title="Recent Audit Trail">
          {analytics.recentActivity.length ? (
            <div className="space-y-3">
              {analytics.recentActivity.map((entry) => (
                <div key={entry._id} className="app-muted rounded-[1.5rem] p-4">
                  <p className="font-medium text-slate-900 dark:text-white">{entry.message}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {entry.actorId?.name || "System"} • {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No audit events yet" description="User creation, edits, and deletions will surface here." />
          )}
        </SectionCard>
      </section>
    </div>
  );
};

export default AdminDashboard;
