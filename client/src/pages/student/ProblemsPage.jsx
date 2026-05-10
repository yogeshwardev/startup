import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import Skeleton from "../../components/Skeleton";
import { Search, Filter, ChevronRight } from "lucide-react";

const difficultyTabs = [
  { label: "ALL", value: "all" },
  { label: "EASY", value: "easy" },
  { label: "MEDIUM", value: "medium" },
  { label: "HARD", value: "hard" },
];

const difficultyStyles = {
  Easy: { bg: "bg-emerald-500/10", text: "text-emerald-400", accent: "#10b981" },
  Medium: { bg: "bg-amber-500/10", text: "text-amber-400", accent: "#f59e0b" },
  Hard: { bg: "bg-rose-500/10", text: "text-rose-400", accent: "#ef4444" },
};

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [activeDifficulty, setActiveDifficulty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};
        if (activeDifficulty !== "all") params.difficulty = activeDifficulty;
        if (searchQuery) params.search = searchQuery;

        const { data } = await http.get("/problems", { params });
        setProblems(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load problems.");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(loadProblems, 300);
    return () => clearTimeout(debounce);
  }, [activeDifficulty, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 animate-slide-up">
        <div>
          <p className="text-[10px] font-bold text-brand-400 tracking-[0.15em] uppercase mb-1.5 flex items-center gap-2">
            <span className="w-4 h-px bg-brand-500/50" />
            Problem Archive
          </p>
          <h1 className="text-2xl md:text-3xl font-bold font-display mb-1" style={{ color: "var(--text-primary)" }}>
            Sharpen Your <span className="gradient-text">Skills</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Explore {problems.length} challenges across various topics and difficulty levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full input-field pl-9 pr-4 py-2.5 text-sm"
            />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:bg-white/[0.04]"
            style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Difficulty Tabs */}
      <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: "100ms" }}>
        {difficultyTabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`rounded-lg px-4 py-2 text-[11px] font-bold tracking-widest transition-all ${
              activeDifficulty === tab.value
                ? "bg-brand-500 text-[var(--text-primary)]"
                : ""
            }`}
            style={activeDifficulty !== tab.value ? {
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
            } : {}}
            onClick={() => setActiveDifficulty(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Problem Grid */}
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : problems.length ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 stagger-children">
          {problems.map((problem) => {
            const style = difficultyStyles[problem.difficulty] || difficultyStyles.Easy;
            return (
              <article
                key={problem._id}
                className="group card-interactive p-4 flex items-center justify-between relative overflow-hidden"
              >
                {/* Difficulty accent line */}
                <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full" style={{ background: style.accent }} />

                <div className="flex items-center gap-3.5 pl-3">
                  <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-sm ${style.bg} ${style.text}`}>
                    {problem.difficulty.charAt(0)}
                  </div>

                  <div>
                    <h3 className="text-[14px] font-bold group-hover:text-brand-400 transition-colors line-clamp-1"
                      style={{ color: "var(--text-primary)" }}>{problem.title}</h3>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                      {problem.problemCode}
                    </p>

                    {problem.tags && problem.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {problem.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-md px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-semibold tracking-[0.12em] uppercase mb-0.5" style={{ color: "var(--text-muted)" }}>Solved by</p>
                    <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                      {problem.totalSolved > 1000
                        ? `${(problem.totalSolved / 1000).toFixed(1)}k+`
                        : problem.totalSolved} Students
                    </p>
                  </div>

                  <Link
                    to={`/problems/${problem.slug}`}
                    className="w-9 h-9 rounded-lg flex items-center justify-center group-hover:bg-brand-500 transition-all"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}
                  >
                    <ChevronRight className="w-4 h-4 group-hover:text-[var(--text-primary)] transition-colors" style={{ color: "var(--text-muted)" }} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No problems found" description="You have solved all the problems or none match your search." />
      )}
    </div>
  );
};

export default ProblemsPage;



