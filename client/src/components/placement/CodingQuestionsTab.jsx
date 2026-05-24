import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import http from "../../api/http";
import EmptyState from "../EmptyState";
import Skeleton from "../Skeleton";

const difficulties = [
  { label: "ALL", value: "all" },
  { label: "EASY", value: "Easy" },
  { label: "MEDIUM", value: "Medium" },
  { label: "HARD", value: "Hard" },
];

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        accent: "#10b981",
      };
    case "Medium":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        badge: "border-amber-500/20 bg-amber-500/10 text-amber-300",
        accent: "#f59e0b",
      };
    case "Hard":
      return {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        badge: "border-rose-500/20 bg-rose-500/10 text-rose-300",
        accent: "#ef4444",
      };
    default:
      return {
        bg: "bg-slate-500/10",
        text: "text-slate-400",
        badge: "border-slate-500/20 bg-slate-500/10 text-slate-300",
        accent: "#64748b",
      };
  }
};

const CodingQuestionsTab = ({ companyName }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [search, setSearch] = useState("");
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await http.get(`/placement/companies/${encodeURIComponent(companyName)}/problems`);
        setProblems(data.problems || []);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load company problems.");
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    if (companyName) {
      fetchProblems();
    }
  }, [companyName]);

  const counts = useMemo(
    () =>
      problems.reduce(
        (acc, problem) => {
          acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
          return acc;
        },
        { Easy: 0, Medium: 0, Hard: 0 }
      ),
    [problems]
  );

  const filteredProblems = useMemo(() => {
    const value = search.trim().toLowerCase();

    return problems.filter((problem) => {
      const matchesDifficulty =
        selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;

      const searchable = [
        problem.title,
        problem.problemCode,
        problem.slug,
        problem.category,
        ...(problem.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesDifficulty && (!value || searchable.includes(value));
    });
  }, [problems, search, selectedDifficulty]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-400">
            Coding practice
          </p>
          <h2 className="mt-1 text-xl font-bold font-display" style={{ color: "var(--text-primary)" }}>
            Assigned Problems
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {problems.length} company-specific challenges selected by your placement team.
          </p>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input-field w-full py-2.5 pl-9 pr-4 text-sm"
            placeholder="Search by ID, name, or tag"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {difficulties.map((difficulty) => {
          const count = difficulty.value === "all" ? problems.length : counts[difficulty.value] || 0;

          return (
            <button
              key={difficulty.value}
              type="button"
              onClick={() => setSelectedDifficulty(difficulty.value)}
              className={`rounded-lg px-4 py-2 text-[11px] font-bold tracking-widest transition-all ${
                selectedDifficulty === difficulty.value
                  ? "bg-brand-600 text-white shadow-lg dark:bg-brand-500"
                  : "btn-secondary"
              }`}
            >
              {difficulty.label} ({count})
            </button>
          );
        })}
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filteredProblems.length ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 stagger-children">
          {filteredProblems.map((problem) => (
            <article
              key={problem._id}
              className="group card-interactive relative flex items-center justify-between overflow-hidden p-4"
            >
              <div
                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                style={{ background: getDifficultyColor(problem.difficulty).accent }}
              />

              <div className="flex min-w-0 items-center gap-3.5 pl-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${
                    getDifficultyColor(problem.difficulty).bg
                  } ${getDifficultyColor(problem.difficulty).text}`}
                >
                  {problem.difficulty?.charAt(0) || "P"}
                </div>

                <div className="min-w-0">
                  <h3
                    className="line-clamp-1 text-[14px] font-bold transition-colors group-hover:text-brand-400"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {problem.title}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(problem.difficulty).badge}`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                      {problem.problemCode || "No ID"}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(problem.tags || []).slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                to={`/problems/${problem.slug}`}
                className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all group-hover:bg-brand-500"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}
                aria-label={`Solve ${problem.title}`}
              >
                <ChevronRight
                  className="h-4 w-4 transition-colors group-hover:text-[var(--text-primary)]"
                  style={{ color: "var(--text-muted)" }}
                />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={problems.length ? "No matching problems" : "No coding problems assigned"}
          description={
            problems.length
              ? "Try a different search or difficulty."
              : "Assigned company problems will appear here for students."
          }
        />
      )}
    </div>
  );
};

export default CodingQuestionsTab;
