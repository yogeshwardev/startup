import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useToast } from "../../hooks/useToast";

const defaultProblem = {
  title: "",
  slug: "",
  description: "",
  difficulty: "Easy",
  tags: "Array, Hash Map",
  constraints: "1 <= n <= 1000",
  inputFormat: "",
  outputFormat: "",
  visibleInput: "",
  visibleOutput: "",
  hiddenInput: "",
  hiddenOutput: "",
  python: "",
  cpp: "",
  java: "",
  timeLimitMs: 2000,
  memoryLimitMb: 256,
};

const defaultContest = {
  title: "",
  startTime: "",
  endTime: "",
  problemCodes: "",
};

const toProblemPayload = (form) => ({
  title: form.title,
  slug: form.slug,
  description: form.description,
  difficulty: form.difficulty,
  tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
  constraints: form.constraints
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean),
  inputFormat: form.inputFormat,
  outputFormat: form.outputFormat,
  examples: [{ input: form.visibleInput, output: form.visibleOutput }],
  visibleTestCases: [
    { input: form.visibleInput, expectedOutput: form.visibleOutput },
  ],
  hiddenTestCases: [
    {
      input: form.hiddenInput,
      expectedOutput: form.hiddenOutput,
      isHidden: true,
    },
  ],
  starterCode: {
    python: form.python,
    cpp: form.cpp,
    java: form.java,
  },
  timeLimitMs: Number(form.timeLimitMs),
  memoryLimitMb: Number(form.memoryLimitMb),
});

const ProblemManagementPage = () => {
  const toast = useToast();
  const [problemForm, setProblemForm] = useState(defaultProblem);
  const [contestForm, setContestForm] = useState(defaultContest);
  const [contests, setContests] = useState([]);
  const [savingProblem, setSavingProblem] = useState(false);
  const [savingContest, setSavingContest] = useState(false);

  const loadData = async () => {
    const { data } = await http.get("/contests");
    setContests(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProblem = async (event) => {
    event.preventDefault();
    try {
      setSavingProblem(true);
      const { data } = await http.post(
        "/admin/problems",
        toProblemPayload(problemForm)
      );
      toast.success(
        "Problem created",
        `${problemForm.title} is ready with ID ${data.problemCode}.`
      );
      setProblemForm(defaultProblem);
    } catch (error) {
      toast.error(
        "Problem creation failed",
        error.response?.data?.message || "Unable to save problem."
      );
    } finally {
      setSavingProblem(false);
    }
  };

  const handleCreateContest = async (event) => {
    event.preventDefault();
    try {
      setSavingContest(true);
      await http.post("/contests", {
        title: contestForm.title,
        startTime: contestForm.startTime,
        endTime: contestForm.endTime,
        problems: contestForm.problemCodes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((problemCode, index) => ({ problemCode, order: index + 1 })),
      });
      toast.success(
        "Contest created",
        `${contestForm.title} is now on the calendar.`
      );
      setContestForm(defaultContest);
      await loadData();
    } catch (error) {
      toast.error(
        "Contest creation failed",
        error.response?.data?.message || "Unable to create contest."
      );
    } finally {
      setSavingContest(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin panel"
        title="Problem and contest operations"
        description="Create new coding challenges and build contests with 6-digit problem codes."
        action={
          <Link
            to="/admin/problems/existing"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
          >
            Existing problems
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Create problem">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateProblem}>
            {[
              ["title", "Title"],
              ["slug", "Slug"],
              ["difficulty", "Difficulty"],
              ["timeLimitMs", "Time limit (ms)"],
              ["memoryLimitMb", "Memory limit (MB)"],
              ["tags", "Tags (comma separated)"],
            ].map(([key, label]) =>
              key === "difficulty" ? (
                <select
                  key={key}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
                  value={problemForm.difficulty}
                  onChange={(event) =>
                    setProblemForm((current) => ({
                      ...current,
                      difficulty: event.target.value,
                    }))
                  }
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              ) : (
                <input
                  key={key}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
                  placeholder={label}
                  value={problemForm[key]}
                  onChange={(event) =>
                    setProblemForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              )
            )}
            <textarea
              className="min-h-36 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 md:col-span-2"
              placeholder="Description"
              value={problemForm.description}
              onChange={(event) =>
                setProblemForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
            <textarea
              className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              placeholder="Input format"
              value={problemForm.inputFormat}
              onChange={(event) =>
                setProblemForm((current) => ({
                  ...current,
                  inputFormat: event.target.value,
                }))
              }
            />
            <textarea
              className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              placeholder="Output format"
              value={problemForm.outputFormat}
              onChange={(event) =>
                setProblemForm((current) => ({
                  ...current,
                  outputFormat: event.target.value,
                }))
              }
            />
            <textarea
              className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              placeholder="Visible testcase input"
              value={problemForm.visibleInput}
              onChange={(event) =>
                setProblemForm((current) => ({
                  ...current,
                  visibleInput: event.target.value,
                }))
              }
            />
            <textarea
              className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              placeholder="Visible testcase output"
              value={problemForm.visibleOutput}
              onChange={(event) =>
                setProblemForm((current) => ({
                  ...current,
                  visibleOutput: event.target.value,
                }))
              }
            />
            <textarea
              className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              placeholder="Hidden testcase input"
              value={problemForm.hiddenInput}
              onChange={(event) =>
                setProblemForm((current) => ({
                  ...current,
                  hiddenInput: event.target.value,
                }))
              }
            />
            <textarea
              className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              placeholder="Hidden testcase output"
              value={problemForm.hiddenOutput}
              onChange={(event) =>
                setProblemForm((current) => ({
                  ...current,
                  hiddenOutput: event.target.value,
                }))
              }
            />
            <textarea
              className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 md:col-span-2"
              placeholder="Constraints (one per line)"
              value={problemForm.constraints}
              onChange={(event) =>
                setProblemForm((current) => ({
                  ...current,
                  constraints: event.target.value,
                }))
              }
            />
            <textarea
              className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              placeholder="Python starter code"
              value={problemForm.python}
              onChange={(event) =>
                setProblemForm((current) => ({
                  ...current,
                  python: event.target.value,
                }))
              }
            />
            <textarea
              className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              placeholder="C++ starter code"
              value={problemForm.cpp}
              onChange={(event) =>
                setProblemForm((current) => ({
                  ...current,
                  cpp: event.target.value,
                }))
              }
            />
            <textarea
              className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 md:col-span-2"
              placeholder="Java starter code"
              value={problemForm.java}
              onChange={(event) =>
                setProblemForm((current) => ({
                  ...current,
                  java: event.target.value,
                }))
              }
            />
            <button
              type="submit"
              className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white md:col-span-2"
              disabled={savingProblem}
            >
              {savingProblem ? "Saving..." : "Create problem"}
            </button>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Create contest">
            <form className="space-y-4" onSubmit={handleCreateContest}>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
                placeholder="Contest title"
                value={contestForm.title}
                onChange={(event) =>
                  setContestForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
                type="datetime-local"
                value={contestForm.startTime}
                onChange={(event) =>
                  setContestForm((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
                type="datetime-local"
                value={contestForm.endTime}
                onChange={(event) =>
                  setContestForm((current) => ({
                    ...current,
                    endTime: event.target.value,
                  }))
                }
              />
              <textarea
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
                placeholder="Problem IDs (6 digits), comma separated"
                value={contestForm.problemCodes}
                onChange={(event) =>
                  setContestForm((current) => ({
                    ...current,
                    problemCodes: event.target.value,
                  }))
                }
              />
              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
                disabled={savingContest}
              >
                {savingContest ? "Publishing..." : "Create contest"}
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Existing contests">
            {contests.length ? (
              <div className="space-y-3">
                {contests.map((contest) => (
                  <div
                    key={contest._id}
                    className="app-muted rounded-[1.5rem] p-4"
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {contest.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {contest.problems.length} problems
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No contests yet"
                description="Publish contests to power time-boxed coding competitions."
              />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default ProblemManagementPage;
