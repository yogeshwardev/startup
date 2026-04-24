import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useContestTimer } from "../../hooks/useContestTimer";

const ContestListItem = ({ contest }) => {
  const contestTimer = useContestTimer(contest.startTime, contest.endTime);

  return (
    <div className="app-muted flex flex-col gap-4 rounded-[1.75rem] p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">{contest.title}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {new Date(contest.startTime).toLocaleString()} to{" "}
          {new Date(contest.endTime).toLocaleString()}
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {contest.problems?.length || 0} problems • {contestTimer.label}: {contestTimer.timeText}
        </p>
      </div>

      <Link
        to={`/contest/${contest._id}`}
        className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
      >
        View details
      </Link>
    </div>
  );
};

const ContestListPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http
      .get("/contests")
      .then((response) => setContests(response.data))
      .finally(() => setLoading(false));
  }, []);

  const visibleContests = useMemo(
    () => contests.filter((contest) => contest.problems?.length),
    [contests]
  );

  const todaysContest = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (
      visibleContests.find((contest) => contest.startTime?.slice(0, 10) === today) ||
      visibleContests[0] ||
      null
    );
  }, [visibleContests]);

  const timer = useContestTimer(todaysContest?.startTime, todaysContest?.endTime);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contests"
        title="Contest arena"
        description="All students can browse every contest, view contest details, and join when the timer goes live."
      />

      <SectionCard title="Today's contest">
        {loading ? (
          <p className="text-sm text-slate-400">Loading contest...</p>
        ) : todaysContest ? (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="app-muted rounded-[1.75rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-500">{timer.label}</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{timer.timeText}</h2>
              <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{todaysContest.title}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {new Date(todaysContest.startTime).toLocaleString()} to {new Date(todaysContest.endTime).toLocaleString()}
              </p>
              <Link
                to={`/contest/${todaysContest._id}`}
                className="mt-5 inline-flex rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
              >
                {timer.state === "live" ? "Start contest" : "View contest details"}
              </Link>
            </div>
            <div className="space-y-3">
              {todaysContest.problems?.length ? (
                todaysContest.problems.map((item, index) => (
                  <div key={item.problemId?._id || index} className="app-muted rounded-[1.5rem] p-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{item.problemId?.title || "Problem unavailable"}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ID {item.problemId?.problemCode || "------"} • {item.problemId?.difficulty || "Unknown difficulty"}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No contest problems yet"
                  description="This contest does not have any visible problems configured."
                />
              )}
            </div>
          </div>
        ) : (
          <EmptyState title="No contest scheduled" description="Create a contest to power the daily arena." />
        )}
      </SectionCard>

      <SectionCard title="All contests">
        {loading ? (
          <p className="text-sm text-slate-400">Loading contests...</p>
        ) : visibleContests.length ? (
          <div className="space-y-3">
            {visibleContests.map((contest) => (
              <ContestListItem key={contest._id} contest={contest} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No contests available"
            description="All created contests will appear here for every student."
          />
        )}
      </SectionCard>
    </div>
  );
};

export default ContestListPage;
