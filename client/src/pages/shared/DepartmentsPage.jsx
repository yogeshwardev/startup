import { useEffect, useState } from "react";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import Skeleton from "../../components/Skeleton";
import { useAuth } from "../../hooks/useAuth";

const DepartmentsPage = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http
      .get("/departments")
      .then((response) => setDepartments(response.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Departments"
        title="Department workspace"
        description="Organize academic units, keep user allocations tidy, and give managers a quick overview of campus-wide distribution."
      />
      <SectionCard title="Department Directory">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-36" />
            ))}
          </div>
        ) : departments.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {departments.map((department) => (
              <article key={department._id} className="card-surface rounded-[1.75rem] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Department</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{department.name}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {user?.role === "ADMIN" ? "Ready for user provisioning and leaderboard segmentation." : "Visible to faculty for class coordination and student filtering."}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No departments found" description="Create or sync departments to start structuring users." />
        )}
      </SectionCard>
    </div>
  );
};

export default DepartmentsPage;



