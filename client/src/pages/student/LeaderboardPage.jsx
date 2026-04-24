import { useEffect, useState } from "react";
import http from "../../api/http";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";

const LeaderboardPage = () => {
  const [leaderboards, setLeaderboards] = useState({ global: [], department: [] });

  useEffect(() => {
    http.get("/leaderboards").then((response) => setLeaderboards(response.data));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Leaderboard"
        title="Top users and departments"
        description="Rankings are based on problems solved for users and total department war points for departments."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Top users by solved problems">
          <div className="space-y-3">
            {leaderboards.global.map((row, index) => (
              <div key={row.userId} className="app-muted flex items-center justify-between rounded-[1.5rem] p-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    #{index + 1} {row.name}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">{row.department}</p>
                </div>
                <p className="font-semibold text-brand-500">{row.solved} solved</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Top departments">
          <div className="space-y-3">
            {leaderboards.department.map((row, index) => (
              <div key={row._id} className="app-muted flex items-center justify-between rounded-[1.5rem] p-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    #{index + 1} {row._id}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">{row.solved} solved</p>
                </div>
                <p className="font-semibold text-brand-500">{row.points} pts</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default LeaderboardPage;
