import { ArrowRight, CheckCircle2, Clock3, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useContestTimer } from "../../hooks/useContestTimer";

const ContestDetailPage = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadContest = async () => {
      try {
        setLoading(true);
        const { data } = await http.get(`/contests/${id}`);
        setContest(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load contest.");
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [id]);

  const timer = useContestTimer(contest?.startTime, contest?.endTime);
  const solvedCount = contest?.leaderboard?.reduce((sum, entry) => sum + entry.solved, 0) || 0;
  const problemCount = contest?.problems?.length || 0;
  const submittedSet = new Set((contest?.submittedProblemIds || []).map(String));

  if (loading) {
    return <p className="text-sm text-slate-400">Loading contest...</p>;
  }

  if (!contest) {
    return <EmptyState title="Contest unavailable" description={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contest"
        title={contest.title}
        description={`${timer.label}: ${timer.timeText}`}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="app-muted rounded-[1.5rem] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
            Status
          </p>
          <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
            {timer.state === "countdown"
              ? "Upcoming"
              : timer.state === "live"
                ? "Live now"
                : "Ended"}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {timer.state === "countdown"
              ? "Contest opens when the countdown reaches zero."
              : timer.state === "live"
                ? "Submissions are open during the live window."
                : "This contest is locked for new submissions."}
          </p>
        </div>

        <div className="app-muted rounded-[1.5rem] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
            Contest window
          </p>
          <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
            {new Date(contest.startTime).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            to {new Date(contest.endTime).toLocaleString()}
          </p>
        </div>

        <div className="app-muted rounded-[1.5rem] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
            Progress
          </p>
          <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
            {problemCount} problems
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {solvedCount} accepted contest solves recorded so far.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Problems in contest">
          {contest.problems?.length ? (
            <div className="space-y-3">
              {contest.problems.map((item, index) => {
                const problem = item.problemId;

                return (
                  <div
                    key={problem?._id || `${index}-${item.order || 0}`}
                    className="app-muted flex items-center justify-between rounded-[1.5rem] p-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {index + 1}. {problem?.title || "Problem unavailable"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        ID {problem?.problemCode || "------"} • {problem?.difficulty || "Unknown difficulty"}
                      </p>
                    </div>

                    {submittedSet.has(String(problem?._id)) ? (
                      <div className="flex items-center gap-2 text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-semibold">Solved</span>
                      </div>
                    ) : timer.isLocked || !problem?.slug ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm">
                          {timer.isLocked ? "Locked" : "Unavailable"}
                        </span>
                      </div>
                    ) : (
                      <Link
                        to={`/problems/${problem.slug}?contestId=${contest._id}`}
                        className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
                      >
                        Solve
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No contest problems available"
              description="This contest was created without valid problem entries. Create a new contest from the admin contest page to show it correctly here."
            />
          )}

          <div className="mt-5 rounded-[1.5rem] bg-slate-900/80 p-4 text-sm text-white">
            Solved problems tracked during contest: {solvedCount}
          </div>
          {timer.state === "ended" ? (
            <div className="mt-4 rounded-[1.5rem] bg-rose-500/10 p-4 text-sm text-rose-300">
              Contest ended. Submissions are locked.
            </div>
          ) : timer.state === "countdown" ? (
            <div className="mt-4 flex items-center gap-2 rounded-[1.5rem] bg-amber-500/10 p-4 text-sm text-amber-300">
              <Clock3 className="h-4 w-4" />
              Contest has not started yet. Problems unlock when the timer goes live.
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Live leaderboard">
          {contest.leaderboard?.length ? (
            <div className="space-y-3">
              {contest.leaderboard.map((row, index) => (
                <div key={`${row._id}-${index}`} className="app-muted flex items-center justify-between rounded-[1.5rem] p-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      #{index + 1} {row.name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">{row.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">{row.solved} solved</p>
                    <p className="text-slate-500 dark:text-slate-400">Penalty {row.penaltyTime}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No contest submissions yet" description="Leaderboard will update when accepted contest submissions arrive." />
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default ContestDetailPage;
