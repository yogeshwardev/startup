import { useEffect, useState } from "react";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import Skeleton from "../../components/Skeleton";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../hooks/useAuth";

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [teacherMetrics, setTeacherMetrics] = useState(null);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      http.get("/analytics").then((response) => setAnalytics(response.data));
      return;
    }

    http.get("/users", { params: { limit: 100, role: "STUDENT" } }).then((response) => {
      const students = response.data.items;
      const departments = [...new Set(students.map((student) => student.department))];
      setTeacherMetrics({
        totalStudents: students.length,
        activeStudents: students.filter((student) => !student.isBlocked).length,
        departments,
      });
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Analytics" title="Live workspace analytics" description="Quick access to operational health, user activity, and department spread across the management panel." />
      {user?.role === "ADMIN" ? (
        analytics ? (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <StatCard label="Total users" value={analytics.totalUsers} />
              <StatCard label="Active students" value={analytics.activeStudents} />
              <StatCard label="Problems tracked" value={analytics.totalProblems} />
            </section>
            <SectionCard title="Department distribution">
              {analytics.departmentPerformance.length ? (
                <div className="space-y-4">
                  {analytics.departmentPerformance.map((entry) => (
                    <div key={entry._id}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{entry._id}</span>
                        <span className="text-slate-500 dark:text-slate-400">{entry.solved} solved</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-200 dark:bg-white/10">
                        <div className="h-3 rounded-full bg-brand-500" style={{ width: `${Math.min(entry.score, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No department analytics yet" description="Solve activity will appear here once submissions are recorded." />
              )}
            </SectionCard>
          </>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
        )
      ) : teacherMetrics ? (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Visible students" value={teacherMetrics.totalStudents} />
          <StatCard label="Active students" value={teacherMetrics.activeStudents} />
          <StatCard label="Departments in scope" value={teacherMetrics.departments.length} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
