import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useToast } from "../../hooks/useToast";
import { Clock, Trash2, Edit2 } from "lucide-react";

const defaultMockTest = {
  title: "",
  durationMinutes: 90,
  company: "",
  selectedProblemIds: [],
  problemCodes: "",
  searchQuery: "",
};

const MockTestManagementPage = () => {
  const toast = useToast();
  const [mockTestForm, setMockTestForm] = useState(defaultMockTest);
  const [problems, setProblems] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      const [{ data: problemData }, { data: mockTestData }] = await Promise.all([
        http.get("/problems"),
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

  // Filter problems based on search query
  const filteredProblems = useMemo(
    () =>
      problems.filter((problem) => {
        const query = searchQuery.toLowerCase();
        return (
          problem.title.toLowerCase().includes(query) ||
          problem.problemCode.toString().includes(query) ||
          problem.difficulty.toLowerCase().includes(query)
        );
      }),
    [problems, searchQuery]
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
    try {
      setSaving(true);
      await http.post("/admin/mock-tests", {
        title: mockTestForm.title,
        durationMinutes: parseInt(mockTestForm.durationMinutes, 10),
        company: mockTestForm.company,
        problemIds: mockTestForm.selectedProblemIds,
      });
      toast.success("Mock test created", `${mockTestForm.title} has been created.`);
      setMockTestForm(defaultMockTest);
      setSearchQuery("");
      await loadData();
    } catch (error) {
      toast.error(
        "Mock test creation failed",
        error.response?.data?.message || "Unable to create mock test."
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
        eyebrow="Admin dashboard"
        title="Mock test management"
        description="Create and manage mock tests with problem selection and timer configuration."
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
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand-400"
                placeholder="Placement Round 1"
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-400"
                  required
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-300"
                  htmlFor="mock-test-company"
                >
                  Company (optional)
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand-400"
                  placeholder="Google, Amazon, etc."
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-300">
                Select problems
              </p>

              {/* Search Bar */}
              <div className="mb-4 flex gap-3">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand-400"
                  placeholder="Search by title, ID, or difficulty..."
                />
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand-400"
                  placeholder="Add by problem ID, comma separated"
                />
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                  onClick={addProblemsByCode}
                >
                  Add IDs
                </button>
              </div>

              {/* Problems List */}
              <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2">
                {filteredProblems.length > 0 ? (
                  filteredProblems.map((problem) => (
                    <label
                      key={problem._id}
                      className="app-muted flex cursor-pointer items-start gap-3 rounded-[1.5rem] p-4 transition hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={mockTestForm.selectedProblemIds.includes(problem._id)}
                        onChange={() => toggleProblem(problem._id)}
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-brand-500 focus:ring-brand-400"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-white">{problem.title}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          ID {problem.problemCode} • {problem.difficulty} • {problem.slug}
                        </p>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-400">No problems found</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || mockTestForm.selectedProblemIds.length === 0}
              className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
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
                description="Pick problems from the list to build your mock test."
              />
            )}
          </SectionCard>

          <SectionCard title="Existing mock tests">
            {mockTests.length ? (
              <div className="space-y-3">
                {mockTests.map((mockTest) => (
                  <div
                    key={mockTest._id}
                    className="app-muted rounded-[1.5rem] p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{mockTest.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {mockTest.durationMinutes} mins
                          </span>
                          <span>{mockTest.questions?.length || 0} problems</span>
                          {mockTest.company && <span>{mockTest.company}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMockTest(mockTest._id)}
                        disabled={deleting === mockTest._id}
                        className="ml-2 rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

export default MockTestManagementPage;
