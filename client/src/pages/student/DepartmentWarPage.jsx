import { useEffect, useState } from "react";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";

const DepartmentWarPage = () => {
  const [departmentWar, setDepartmentWar] = useState(null);

  useEffect(() => {
    http.get("/department-war").then((response) => setDepartmentWar(response.data));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Department war"
        title="Weekly department ranking"
        description="Departments compete every week. Easy gives 10 points, Medium 20, and Hard 30."
      />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Department leaderboard">
          {departmentWar?.departments?.length ? (
            <div className="space-y-3">
              {departmentWar.departments.map((entry, index) => (
                <div key={entry._id} className="app-muted flex items-center justify-between rounded-[1.5rem] p-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      #{index + 1} {entry._id}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">Weekly ranking • {entry.solved} solved</p>
                  </div>
                  <p className="text-lg font-bold text-brand-500">{entry.points} pts</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No department rankings yet" description="Weekly accepted solves will appear here." />
          )}
        </SectionCard>
        <SectionCard title="Top contributors">
          {departmentWar?.topContributors?.length ? (
            <div className="space-y-3">
              {departmentWar.topContributors.map((entry, index) => (
                <div key={`${entry._id.userId}-${index}`} className="app-muted rounded-[1.5rem] p-4 text-sm">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    #{index + 1} {entry._id.name}
                  </p>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{entry._id.department}</p>
                  <p className="mt-2 text-brand-500">{entry.points} pts • {entry.solved} solved</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No top contributors yet" description="Top coders will appear here as departments earn points." />
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default DepartmentWarPage;
