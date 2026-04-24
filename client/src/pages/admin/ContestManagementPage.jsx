import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useToast } from "../../hooks/useToast";

const defaultContest = {
  title: "",
  startTime: "",
  endTime: "",
  selectedProblemIds: [],
  problemCodes: "",
};

const ContestManagementPage = () => {
  const toast = useToast();
  const [contestForm, setContestForm] = useState(defaultContest);
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const [{ data: problemData }, { data: contestData }] = await Promise.all([
      http.get("/problems"),
      http.get("/contests"),
    ]);
    setProblems(problemData);
    setContests(contestData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedProblems = useMemo(
    () =>
      problems.filter((problem) =>
        contestForm.selectedProblemIds.includes(problem._id)
      ),
    [contestForm.selectedProblemIds, problems]
  );

  const toggleProblem = (problemId) => {
    setContestForm((current) => ({
      ...current,
      selectedProblemIds: current.selectedProblemIds.includes(problemId)
        ? current.selectedProblemIds.filter((id) => id !== problemId)
        : [...current.selectedProblemIds, problemId],
    }));
  };

  const addProblemsByCode = () => {
    const requestedCodes = contestForm.problemCodes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!requestedCodes.length) {
      return;
    }

    const matchedProblemIds = problems
      .filter((problem) => requestedCodes.includes(problem.problemCode))
      .map((problem) => problem._id);

    setContestForm((current) => ({
      ...current,
      selectedProblemIds: Array.from(
        new Set([...current.selectedProblemIds, ...matchedProblemIds])
      ),
      problemCodes: "",
    }));

    if (matchedProblemIds.length !== requestedCodes.length) {
      toast.error(
        "Some IDs were not found",
        "Check the 6-digit problem IDs and try again."
      );
    }
  };

  const handleCreateContest = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await http.post("/contests", {
        title: contestForm.title,
        startTime: contestForm.startTime,
        endTime: contestForm.endTime,
        problems: contestForm.selectedProblemIds.map((problemId, index) => ({
          problemId,
          order: index + 1,
        })),
      });
      toast.success("Contest created", `${contestForm.title} has been scheduled.`);
      setContestForm(defaultContest);
      await loadData();
    } catch (error) {
      toast.error(
        "Contest creation failed",
        error.response?.data?.message || "Unable to create contest."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin contests"
        title="Contest management"
        description="Create and manage contests on a dedicated page with proper problem selection."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Create contest">
          <form className="space-y-4" onSubmit={handleCreateContest}>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-300"
                htmlFor="contest-title"
              >
                Contest title
              </label>
              <input
                id="contest-title"
                value={contestForm.title}
                onChange={(event) =>
                  setContestForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand-400"
                placeholder="Daily coding showdown"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-300"
                  htmlFor="contest-start"
                >
                  Start time
                </label>
                <input
                  id="contest-start"
                  type="datetime-local"
                  value={contestForm.startTime}
                  onChange={(event) =>
                    setContestForm((current) => ({
                      ...current,
                      startTime: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-400"
                  required
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-300"
                  htmlFor="contest-end"
                >
                  End time
                </label>
                <input
                  id="contest-end"
                  type="datetime-local"
                  value={contestForm.endTime}
                  onChange={(event) =>
                    setContestForm((current) => ({
                      ...current,
                      endTime: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-400"
                  required
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-300">
                Select problems
              </p>
              <div className="mb-4 flex gap-3">
                <input
                  value={contestForm.problemCodes}
                  onChange={(event) =>
                    setContestForm((current) => ({
                      ...current,
                      problemCodes: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand-400"
                  placeholder="Add by problem ID, comma separated"
                />
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white"
                  onClick={addProblemsByCode}
                >
                  Add IDs
                </button>
              </div>
              <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2">
                {problems.map((problem) => (
                  <label
                    key={problem._id}
                    className="app-muted flex cursor-pointer items-start gap-3 rounded-[1.5rem] p-4"
                  >
                    <input
                      type="checkbox"
                      checked={contestForm.selectedProblemIds.includes(problem._id)}
                      onChange={() => toggleProblem(problem._id)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-brand-500 focus:ring-brand-400"
                    />
                    <div>
                      <p className="font-semibold text-white">{problem.title}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        ID {problem.problemCode} • {problem.difficulty} • {problem.slug}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || contestForm.selectedProblemIds.length === 0}
              className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Creating..." : "Create contest"}
            </button>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Selected problems">
            {selectedProblems.length ? (
              <div className="space-y-3">
                {selectedProblems.map((problem, index) => (
                  <div
                    key={problem._id}
                    className="app-muted rounded-[1.5rem] p-4"
                  >
                    <p className="font-semibold text-white">
                      {index + 1}. {problem.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      ID {problem.problemCode} • {problem.difficulty}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No problems selected"
                description="Pick contest problems from the list to build the contest set."
              />
            )}
          </SectionCard>

          <SectionCard title="Existing contests">
            {contests.length ? (
              <div className="space-y-3">
                {contests.map((contest) => (
                  <div
                    key={contest._id}
                    className="app-muted rounded-[1.5rem] p-4"
                  >
                    <p className="font-semibold text-white">{contest.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {new Date(contest.startTime).toLocaleString()} to{" "}
                      {new Date(contest.endTime).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {contest.problems.length} problems
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No contests yet"
                description="Your created contests will appear here."
              />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default ContestManagementPage;
