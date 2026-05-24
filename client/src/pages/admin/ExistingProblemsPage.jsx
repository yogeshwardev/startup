import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import Skeleton from "../../components/Skeleton";
import { useToast } from "../../hooks/useToast";

const ExistingProblemsPage = () => {
  const toast = useToast();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [problemIdSearch, setProblemIdSearch] = useState("");

  const loadProblems = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/problems?status=all");
      setProblems(data);
    } catch (error) {
      toast.error(
        "Unable to load problems",
        error.response?.data?.message || "Please refresh and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const filteredProblems = useMemo(() => {
    const keywordValue = keyword.trim().toLowerCase();
    const idValue = problemIdSearch.trim().toLowerCase();

    return problems.filter((problem) => {
      const searchableValues = [
        problem.title,
        problem.slug,
        problem.difficulty,
        ...(problem.tags || []),
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      const matchesKeyword = keywordValue
        ? searchableValues.some((value) => value.includes(keywordValue))
        : true;

      const matchesId = idValue
        ? String(problem.problemCode || "").toLowerCase().includes(idValue)
        : true;

      return matchesKeyword && matchesId;
    });
  }, [keyword, problemIdSearch, problems]);

  const handleDeleteProblem = async (problemId) => {
    try {
      await http.delete(`/admin/problems/${problemId}`);
      toast.success("Problem deleted", "The problem has been removed.");
      await loadProblems();
    } catch (error) {
      toast.error(
        "Delete failed",
        error.response?.data?.message || "Unable to delete problem."
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin panel"
        title="Existing problems"
        description="Review the full problem bank, verify 6-digit IDs, and remove outdated challenges from a dedicated page."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/problems"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10"
            >
              Back to problem creation
            </Link>
            <button
              type="button"
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--text-primary)] dark:bg-white"
              onClick={loadProblems}
            >
              Refresh
            </button>
          </div>
        }
      />

      <SectionCard title="Problem bank">
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <label className="card-surface flex items-center gap-3 rounded-2xl px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Search by keyword"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </label>
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
            placeholder="Search by problem ID"
            value={problemIdSearch}
            onChange={(event) => setProblemIdSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : filteredProblems.length ? (
          <div className="space-y-3">
            {filteredProblems.map((problem) => (
              <div
                key={problem._id}
                className="card-surface flex flex-wrap items-start justify-between gap-4 rounded-[1.5rem] p-4"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">
                    {problem.title}
                  </p>
                  <p className="text-sm text-slate-500">
                    ID {problem.problemCode} · {problem.slug} · {problem.difficulty}
                  </p>
                  <p className="text-sm text-slate-500">
                    {problem.tags?.join(", ") || "No tags"}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-2xl bg-red-500 px-3 py-2 text-xs font-semibold text-[var(--text-primary)]"
                  onClick={() => handleDeleteProblem(problem._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={problems.length ? "No matching problems" : "No problems yet"}
            description={
              problems.length
                ? "Try a different keyword or problem ID."
                : "Create your first challenge to start populating the platform."
            }
          />
        )}
      </SectionCard>
    </div>
  );
};

export default ExistingProblemsPage;



