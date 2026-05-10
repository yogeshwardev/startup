import { useEffect, useState } from "react";
import http from "../../api/http";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import Skeleton from "../../components/Skeleton";
import { Users, UserCheck, GraduationCap } from "lucide-react";
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
          <Skeleton key={index} className="h-28" />
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
        <StatCard icon={Users} label="Students in scope" value={summary.totalStudents} />
        <StatCard icon={UserCheck} label="Active students" value={summary.activeStudents} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
        <StatCard icon={GraduationCap} label="Years covered" value={summary.yearsCovered} iconColor="text-cyan-400" iconBg="bg-cyan-500/10" />
      </section>
      <SectionCard title="Recently visible students">
        <div className="grid gap-3 lg:grid-cols-2">
          {summary.students.slice(0, 6).map((student) => (
            <div key={student._id} className="rounded-lg p-4"
              style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)" }}>
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{student.name}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
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

