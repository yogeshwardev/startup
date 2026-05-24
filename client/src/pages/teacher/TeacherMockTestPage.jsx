import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useToast } from "../../hooks/useToast";
import { BarChart3, Clock, Search, Trash2, X } from "lucide-react";

const LANGUAGE_OPTIONS = [
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" },
  { label: "C", value: "c" },
];

const defaultMockTest = {
  title: "",
  durationMinutes: 90,
  company: "",
  language: "python",
  scheduledFor: "",
  selectedProblemIds: [],
  problemCodes: "",
  searchQuery: "",
};

const TeacherMockTestPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [mockTestForm, setMockTestForm] = useState(defaultMockTest);
  const [problems, setProblems] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState(""); // ""|"Easy"|"Medium"|"Hard"

  const loadData = async () => {
    try {
      const [{ data: problemData }, { data: mockTestData }] = await Promise.all([
        http.get("/problems?status=all"),
        http.get("/admin/mock-tests"),
      ]);
      setProblems(problemData);
      setMockTests(mockTestData);
    } catch (error) {
      toast.error("Failed to load data", error.response?.data?.message || "Please try again.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedProblems = useMemo(
    () =>
      problems.filter((problem) =>
        mockTestForm.selectedProblemIds.includes(problem._id)
      ),
    [mockTestForm.selectedProblemIds, problems]
  );

  // Filter problems based on search query + difficulty filter
  const filteredProblems = useMemo(
    () =>
      problems.filter((problem) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          (problem.title || "").toLowerCase().includes(query) ||
          (problem.problemCode || "").toString().toLowerCase().includes(query) ||
          (problem.difficulty || "").toLowerCase().includes(query) ||
          (problem.slug || "").toLowerCase().includes(query) ||
          (problem.tags || []).some((tag) => tag.toLowerCase().includes(query)) ||
          (problem.category || "").toLowerCase().includes(query);
        const matchesDiff = !difficultyFilter || problem.difficulty === difficultyFilter;
        return matchesQuery && matchesDiff;
      }),
    [problems, searchQuery, difficultyFilter]
  );

  const toggleProblem = (problemId) => {
    setMockTestForm((current) => ({
      ...current,
      selectedProblemIds: current.selectedProblemIds.includes(problemId)
        ? current.selectedProblemIds.filter((id) => id !== problemId)
        : [...current.selectedProblemIds, problemId],
    }));
  };

  const addProblemsByCode = () => {
    const requestedCodes = mockTestForm.problemCodes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!requestedCodes.length) {
      return;
    }

    const matchedProblemIds = problems
      .filter((problem) => requestedCodes.includes(problem.problemCode.toString()))
      .map((problem) => problem._id);

    setMockTestForm((current) => ({
      ...current,
      selectedProblemIds: Array.from(
        new Set([...current.selectedProblemIds, ...matchedProblemIds])
      ),
      problemCodes: "",
    }));

    if (matchedProblemIds.length !== requestedCodes.length) {
      toast.error(
        "Some IDs were not found",
        "Check the problem IDs and try again."
      );
    }
  };

  const handleCreateMockTest = async (event) => {
    event.preventDefault();
    if (!mockTestForm.language) {
      toast.error("Language required", "Please select a language for this exam.");
      return;
    }
    try {
      setSaving(true);
      await http.post("/admin/mock-tests", {
        title: mockTestForm.title,
        durationMinutes: parseInt(mockTestForm.durationMinutes, 10),
        company: mockTestForm.company,
        language: mockTestForm.language,
        scheduledFor: mockTestForm.scheduledFor || null,
        problemIds: mockTestForm.selectedProblemIds,
      });
      toast.success("Exam created", `${mockTestForm.title} has been scheduled.`);
      setMockTestForm(defaultMockTest);
      setSearchQuery("");
      await loadData();
    } catch (error) {
      toast.error(
        "Creation failed",
        error.response?.data?.message || "Unable to create exam."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMockTest = async (mockTestId) => {
    try {
      setDeleting(mockTestId);
      await http.delete(`/admin/mock-tests/${mockTestId}`);
      toast.success("Mock test deleted", "The mock test has been removed.");
      await loadData();
    } catch (error) {
      toast.error(
        "Deletion failed",
        error.response?.data?.message || "Unable to delete mock test."
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teacher dashboard"
        title="Mock test management"
        description="Create and manage mock tests for your students with problem selection and timer."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Create mock test">
          <form className="space-y-4" onSubmit={handleCreateMockTest}>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-300"
                htmlFor="mock-test-title"
              >
                Mock test title
              </label>
              <input
                id="mock-test-title"
                value={mockTestForm.title}
                onChange={(event) =>
                  setMockTestForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-slate-500 focus:border-brand-400"
                placeholder="Weekly Challenge"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-300"
                  htmlFor="mock-test-duration"
                >
                  Duration (minutes)
                </label>
                <input
                  id="mock-test-duration"
                  type="number"
                  min="1"
                  max="480"
                  value={mockTestForm.durationMinutes}
                  onChange={(event) =>
                    setMockTestForm((current) => ({
                      ...current,
                      durationMinutes: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-brand-400"
                  required
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-300"
                  htmlFor="mock-test-company"
                >
                  Company/Topic (optional)
                </label>
                <input
                  id="mock-test-company"
                  value={mockTestForm.company}
                  onChange={(event) =>
                    setMockTestForm((current) => ({
                      ...current,
                      company: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-slate-500 focus:border-brand-400"
                  placeholder="e.g., Arrays & Strings"
                />
              </div>
            </div>

            {/* Language & Schedule */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="mock-test-language">
                  Language <span className="text-rose-400">*</span>
                </label>
                <select
                  id="mock-test-language"
                  value={mockTestForm.language}
                  onChange={(e) => setMockTestForm((c) => ({ ...c, language: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-brand-400"
                  required
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <p className="text-xs text-[var(--text-muted)] mt-1">Students can only code in this language.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="mock-test-scheduled">
                  Scheduled Date & Time
                </label>
                <input
                  id="mock-test-scheduled"
                  type="datetime-local"
                  value={mockTestForm.scheduledFor}
                  onChange={(e) => setMockTestForm((c) => ({ ...c, scheduledFor: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-brand-400"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">Leave blank to keep unscheduled.</p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-300">
                Select problems
              </p>

              {/* Search Bar + Difficulty Filter */}
              <div className="mb-3 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 pl-10 pr-10 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-slate-500 focus:border-brand-400"
                    placeholder="Search by title, code, tag, difficulty..."
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Difficulty pills */}
                <div className="flex gap-2 flex-wrap">
                  {["", "Easy", "Medium", "Hard"].map((d) => (
                    <button
                      key={d || "all"}
                      type="button"
                      onClick={() => setDifficultyFilter(d)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        difficultyFilter === d
                          ? d === "Easy"
                            ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                            : d === "Medium"
                            ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40"
                            : d === "Hard"
                            ? "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40"
                            : "bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/40"
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {d || "All"}
                    </button>
                  ))}
                  <span className="ml-auto text-xs text-slate-500 self-center">
                    {filteredProblems.length} / {problems.length} shown
                  </span>
                </div>
              </div>

              {/* Add by Code */}
              <div className="mb-4 flex gap-3">
                <input
                  value={mockTestForm.problemCodes}
                  onChange={(event) =>
                    setMockTestForm((current) => ({
                      ...current,
                      problemCodes: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-slate-500 focus:border-brand-400"
                  placeholder="Add by problem ID, comma separated"
                />
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-white/5"
                  onClick={addProblemsByCode}
                >
                  Add IDs
                </button>
              </div>

              {/* Problems List */}
              <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {filteredProblems.length > 0 ? (
                  filteredProblems.map((problem) => {
                    const isSelected = mockTestForm.selectedProblemIds.includes(problem._id);
                    return (
                      <label
                        key={problem._id}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl p-3.5 transition border ${
                          isSelected
                            ? "bg-brand-500/10 border-brand-500/30"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProblem(problem._id)}
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-brand-500 focus:ring-brand-400 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{problem.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {problem.problemCode && (
                              <span className="text-[10px] font-mono text-cyan-400">{problem.problemCode}</span>
                            )}
                            <span className={`text-[10px] font-bold ${
                              problem.difficulty === "Easy" ? "text-emerald-400"
                              : problem.difficulty === "Medium" ? "text-amber-400"
                              : "text-rose-400"
                            }`}>{problem.difficulty}</span>
                            {problem.tags?.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No problems match your search</p>
                    <button type="button" onClick={() => { setSearchQuery(""); setDifficultyFilter(""); }}
                      className="text-xs text-brand-400 hover:underline mt-1">
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || mockTestForm.selectedProblemIds.length === 0}
              className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Creating..." : "Create mock test"}
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
                    className="card-surface rounded-[1.5rem] p-4"
                  >
                    <p className="font-semibold text-[var(--text-primary)]">
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
                description="Pick problems from the list to build your mock test."
              />
            )}
          </SectionCard>

          <SectionCard title="Your mock tests">
            {mockTests.length ? (
              <div className="space-y-3">
                {mockTests.map((mockTest) => (
                  <div
                    key={mockTest._id}
                    className="card-surface rounded-[1.5rem] p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--text-primary)]">{mockTest.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {mockTest.durationMinutes} mins
                          </span>
                          <span>{mockTest.questions?.length || 0} problems</span>
                          {mockTest.company && <span>{mockTest.company}</span>}
                          {mockTest.language && (
                            <span className="text-brand-400 font-semibold">{mockTest.language.toUpperCase()}</span>
                          )}
                          {mockTest.scheduledFor && (
                            <span className="text-amber-400">{new Date(mockTest.scheduledFor).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => navigate(`/teacher/exams/${mockTest._id}/analytics`)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-brand-500/20 hover:text-brand-400 transition"
                          title="View Analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMockTest(mockTest._id)}
                          disabled={deleting === mockTest._id}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            ) : (
              <EmptyState
                title="No mock tests yet"
                description="Create your first mock test using the form on the left."
              />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default TeacherMockTestPage;



