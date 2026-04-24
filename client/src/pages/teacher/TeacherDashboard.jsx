import { useEffect, useState } from "react";
import http from "../../api/http";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import Skeleton from "../../components/Skeleton";
import StatCard from "../../components/StatCard";

const TeacherDashboard = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    http.get("/users", { params: { role: "STUDENT", limit: 100 } }).then((response) => {
      const students = response.data.items;
      const activeStudents = students.filter((student) => !student.isBlocked).length;
      const years = new Set(students.map((student) => student.year));

      setSummary({
        totalStudents: students.length,
        activeStudents,
        yearsCovered: years.size,
        students,
      });
    });
  }, []);

  if (!summary) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teacher dashboard"
        title="Student readiness at a glance"
        description="A faculty-first workspace focused on visibility, performance monitoring, and coordinated preparation support."
      />
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Students in scope" value={summary.totalStudents} />
        <StatCard label="Active students" value={summary.activeStudents} />
        <StatCard label="Years covered" value={summary.yearsCovered} />
      </section>
      <SectionCard title="Recently visible students">
        <div className="grid gap-4 lg:grid-cols-2">
          {summary.students.slice(0, 6).map((student) => (
            <div key={student._id} className="app-muted rounded-[1.75rem] p-5">
              <p className="font-semibold text-slate-900 dark:text-white">{student.name}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {student.department} • Year {student.year}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default TeacherDashboard;
