import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import Skeleton from "../../components/Skeleton";

const difficultyTabs = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

const badgeClasses = {
  Easy: "bg-emerald-500/15 text-emerald-300",
  Medium: "bg-amber-500/15 text-amber-300",
  Hard: "bg-rose-500/15 text-rose-300",
};

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [activeDifficulty, setActiveDifficulty] = useState("easy");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await http.get("/problems", {
          params: activeDifficulty ? { difficulty: activeDifficulty } : {},
        });
        setProblems(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load problems.");
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, [activeDifficulty]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Problems"
        title="Solve coding challenges"
        description="Browse a focused set of problems and jump straight into the code arena."
      />

      <SectionCard
        title="Problem Library"
        action={
          <div className="flex flex-wrap gap-2">
            {difficultyTabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                  activeDifficulty === tab.value ? "bg-brand-500 text-white" : "app-muted text-slate-700 dark:text-slate-200"
                }`}
                onClick={() => setActiveDifficulty(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      >
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
        ) : problems.length ? (
          <div className="space-y-3">
            {problems.map((problem) => (
              <article key={problem._id} className="app-muted flex flex-col gap-4 rounded-[1.75rem] p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{problem.title}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">
                    Problem ID {problem.problemCode}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses[problem.difficulty] || "bg-white/10 text-slate-200"}`}>
                      {problem.difficulty}
                    </span>
                    {problem.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {problem.malpractice ? (
                  <span className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white">
                    Malpractice
                  </span>
                ) : problem.submitted ? (
                  <span className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white">
                    Solved
                  </span>
                ) : (
                  <Link to={`/problems/${problem.slug}`} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                    Solve
                  </Link>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No problems found" description="No problems match the current difficulty filter." />
        )}
      </SectionCard>
    </div>
  );
};

export default ProblemsPage;
