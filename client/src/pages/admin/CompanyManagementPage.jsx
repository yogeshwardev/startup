import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Building2, BookOpen, Search, X, CheckCircle2, Loader2 } from "lucide-react";
import http from "../../api/http";
import Skeleton from "../../components/Skeleton";
import Modal from "../../components/Modal";
import { useToast } from "../../hooks/useToast";

const AdminCompanyManagementPage = () => {
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  
  const [wizardStep, setWizardStep] = useState(1);
  const [numSteps, setNumSteps] = useState(0);
  
  // Question Modal state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [problemSearch, setProblemSearch] = useState("");
  const [problemResults, setProblemResults] = useState([]);
  const [assignedProblems, setAssignedProblems] = useState([]);
  const [selectedProblemIds, setSelectedProblemIds] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [questionModalMode, setQuestionModalMode] = useState("list");
  const [companyQuestions, setCompanyQuestions] = useState([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    title: "",
    description: "",
    type: "coding",
    difficulty: "easy",
    topic: "",
    // Aptitude fields
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    // Coding fields (simplified for now, full IDE needs more, but we can capture basics)
    constraints: [""],
    examples: [{ input: "", output: "", explanation: "" }],
    tags: [""],
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "Mass Hiring",
    focusAreas: "",
    description: "",
    website: "",
    logo: "",
    interviewProcess: []
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompany) return;

    const timer = setTimeout(() => {
      fetchAssignmentProblems(selectedCompany.name, problemSearch);
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedCompany, problemSearch]);

  useEffect(() => {
    if (showQuestionModal && selectedCompany) {
      fetchCompanyQuestions(selectedCompany.name);
    }
  }, [showQuestionModal, selectedCompany]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/placement/companies");
      setCompanies(data);
    } catch (error) {
      console.error("Failed to load companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (wizardStep === 2) {
      const targetSteps = parseInt(numSteps) || 0;
      let process = [...(formData.interviewProcess || [])];
      if (process.length < targetSteps) {
        for (let i = process.length; i < targetSteps; i++) {
          process.push({ stage: "", description: "", duration: "", selectionRate: "", tags: "" });
        }
      } else if (process.length > targetSteps) {
        process = process.slice(0, targetSteps);
      }
      setFormData({ ...formData, interviewProcess: process });
    }
    setWizardStep(wizardStep + 1);
  };

  const handleProcessChange = (index, field, value) => {
    const process = [...formData.interviewProcess];
    process[index][field] = value;
    setFormData({ ...formData, interviewProcess: process });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (wizardStep < 3) {
      handleNextStep();
      return;
    }
    
    try {
      const payload = {
        ...formData,
        focusAreas: typeof formData.focusAreas === 'string' 
          ? formData.focusAreas.split(",").map((area) => area.trim()).filter(Boolean)
          : [],
        interviewProcess: (formData.interviewProcess || []).map(step => ({
          ...step,
          tags: typeof step.tags === 'string' 
            ? step.tags.split(",").map(t => t.trim()).filter(Boolean) 
            : Array.isArray(step.tags) ? step.tags : []
        }))
      };
      
      console.log("Submitting payload:", payload);

      if (editingCompany) {
        await http.patch(`/placement/admin/companies/${editingCompany.name}`, payload);
      } else {
        await http.post("/placement/admin/companies", payload);
      }

      setShowModal(false);
      setWizardStep(1);
      setNumSteps(0);
      setFormData({ name: "", type: "Mass Hiring", focusAreas: "", description: "", website: "", logo: "", interviewProcess: [] });
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error("Failed", error.response?.data?.message || "Failed to save company");
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete company "${name}"?`)) return;
    try {
      await http.delete(`/placement/admin/companies/${name}`);
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      type: company.type,
      focusAreas: company.focusAreas.join(", "),
      description: company.description,
      website: company.website,
      logo: company.logo || "",
      interviewProcess: (company.interviewProcess || []).map(step => ({
        ...step,
        tags: Array.isArray(step.tags) ? step.tags.join(", ") : step.tags || ""
      }))
    });
    setNumSteps((company.interviewProcess || []).length);
    setWizardStep(1);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCompany(null);
    setWizardStep(1);
    setNumSteps(0);
    setFormData({ name: "", type: "Mass Hiring", focusAreas: "", description: "", website: "", logo: "", interviewProcess: [] });
    setShowModal(true);
  };

  const handleManageQuestions = (company) => {
    setSelectedCompany(company);
    setProblemSearch("");
    setSelectedProblemIds([]);
    fetchAssignmentProblems(company.name, "");
    window.requestAnimationFrame(() => {
      document.getElementById("company-problem-assignment")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const fetchAssignmentProblems = async (companyName, search = "") => {
    try {
      setAssignmentLoading(true);
      const encodedName = encodeURIComponent(companyName);
      const [{ data: searchData }, { data: assignedData }] = await Promise.all([
        http.get(`/placement/admin/companies/${encodedName}/problems`, {
          params: { search, limit: 50 },
        }),
        http.get(`/placement/admin/companies/${encodedName}/problems`, {
          params: { assigned: "true", limit: 100 },
        }),
      ]);
      setProblemResults(searchData.problems || []);
      setAssignedProblems(assignedData.problems || []);
    } catch (error) {
      console.error("Failed to load assignable problems", error);
      toast.error("Unable to load problems", error.response?.data?.message || "Please try again.");
    } finally {
      setAssignmentLoading(false);
    }
  };

  const toggleProblemSelection = (problemId) => {
    setSelectedProblemIds((current) =>
      current.includes(problemId)
        ? current.filter((id) => id !== problemId)
        : [...current, problemId]
    );
  };

  const assignSelectedProblems = async () => {
    if (!selectedCompany || selectedProblemIds.length === 0) return;

    try {
      setAssignmentSaving(true);
      const { data } = await http.patch(
        `/placement/admin/companies/${encodeURIComponent(selectedCompany.name)}/problems`,
        { problemIds: selectedProblemIds, action: "add" }
      );
      setAssignedProblems(data.problems || []);
      setSelectedProblemIds([]);
      await fetchAssignmentProblems(selectedCompany.name, problemSearch);
      await fetchCompanies();
      toast.success("Problems assigned", `${selectedProblemIds.length} problem(s) added to ${selectedCompany.name}.`);
    } catch (error) {
      toast.error("Assignment failed", error.response?.data?.message || "Unable to assign selected problems.");
    } finally {
      setAssignmentSaving(false);
    }
  };

  const removeAssignedProblem = async (problemId) => {
    if (!selectedCompany) return;

    try {
      setAssignmentSaving(true);
      const { data } = await http.patch(
        `/placement/admin/companies/${encodeURIComponent(selectedCompany.name)}/problems`,
        { problemIds: [problemId], action: "remove" }
      );
      setAssignedProblems(data.problems || []);
      await fetchAssignmentProblems(selectedCompany.name, problemSearch);
      await fetchCompanies();
      toast.success("Problem removed", `The problem was removed from ${selectedCompany.name}.`);
    } catch (error) {
      toast.error("Remove failed", error.response?.data?.message || "Unable to remove this problem.");
    } finally {
      setAssignmentSaving(false);
    }
  };

  const isProblemAssigned = (problem) => problem.assigned || assignedProblems.some((item) => item._id === problem._id);

  const fetchCompanyQuestions = async (companyName) => {
    try {
      setQuestionLoading(true);
      const { data } = await http.get(`/placement/admin/companies/${encodeURIComponent(companyName)}/questions`);
      setCompanyQuestions(data.questions || []);
    } catch (error) {
      console.error("Failed to load questions", error);
      toast.error("Failed to load company questions");
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await http.delete(`/placement/admin/questions/${questionId}`);
      toast.success("Question deleted");
      fetchCompanyQuestions(selectedCompany.name);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete question");
    }
  };

  const openAddQuestionForm = () => {
    setQuestionForm({
      title: "",
      description: "",
      type: "coding",
      difficulty: "medium",
      topic: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      constraints: [""],
      examples: [{ input: "", output: "", explanation: "" }],
      tags: [""],
    });
    setQuestionModalMode("add");
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        companyName: selectedCompany.name,
        ...questionForm,
        options: questionForm.type === "aptitude" ? questionForm.options.filter(Boolean) : [],
        correctOptionIndex: questionForm.type === "aptitude" ? Number(questionForm.correctOptionIndex) : undefined,
        constraints: questionForm.type === "coding" ? questionForm.constraints.filter(Boolean) : [],
        tags: questionForm.tags.filter(Boolean),
        examples: questionForm.type === "coding" ? questionForm.examples.filter(ex => ex.input && ex.output) : []
      };

      await http.post("/placement/admin/questions", payload);
      toast.success("Success", "Question assigned successfully");
      setQuestionModalMode("list");
      fetchCompanyQuestions(selectedCompany.name);
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed", error.response?.data?.message || "Failed to add question");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-brand-500" />
            Manage Companies
          </h1>
          <p className="mt-1 text-slate-400">Add, edit, or delete companies for placement prep</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-brand-600 transition"
        >
          <Plus className="h-5 w-5" />
          Add Company
        </button>
      </div>

      {selectedCompany && (
        <div
          id="company-problem-assignment"
          className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10 sm:p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">Problem assignment</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                Add problems to {selectedCompany.name}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-400">
                Search by problem ID, database ID, keyword, problem name, slug, category, or tag. Select matches and assign them directly on this page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCompany(null);
                setProblemSearch("");
                setProblemResults([]);
                setAssignedProblems([]);
                setSelectedProblemIds([]);
              }}
              className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <label className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    value={problemSearch}
                    onChange={(event) => setProblemSearch(event.target.value)}
                    className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-slate-500"
                    placeholder="Search CC123456, Mongo ID, arrays, two sum, dynamic programming..."
                  />
                </label>
                <button
                  type="button"
                  onClick={assignSelectedProblems}
                  disabled={assignmentSaving || selectedProblemIds.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {assignmentSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Assign selected ({selectedProblemIds.length})
                </button>
              </div>

              <div className="mt-4 max-h-[430px] space-y-2 overflow-y-auto pr-1">
                {assignmentLoading ? (
                  Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-lg" />)
                ) : problemResults.length ? (
                  problemResults.map((problem) => {
                    const assigned = isProblemAssigned(problem);
                    const checked = selectedProblemIds.includes(problem._id);

                    return (
                      <label
                        key={problem._id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                          assigned
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : checked
                              ? "border-brand-400/50 bg-brand-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked || assigned}
                          disabled={assigned}
                          onChange={() => toggleProblemSelection(problem._id)}
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-brand-500 focus:ring-brand-400 disabled:opacity-50"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-[var(--text-primary)]">{problem.title}</p>
                            {assigned && (
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                                Assigned
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            ID {problem.problemCode || "Unassigned"} &middot; {problem.difficulty} &middot; {problem.slug}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {(problem.tags || []).slice(0, 5).map((tag) => (
                              <span key={tag} className="rounded bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
                    No matching problems found. Try a problem ID, keyword, title, or tag.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-[var(--text-primary)]">Assigned problems</h3>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {assignedProblems.length}
                </span>
              </div>

              <div className="mt-4 max-h-[430px] space-y-2 overflow-y-auto pr-1">
                {assignedProblems.length ? (
                  assignedProblems.map((problem) => (
                    <div key={problem._id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--text-primary)]">{problem.title}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            ID {problem.problemCode || "Unassigned"} &middot; {problem.difficulty}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={assignmentSaving}
                          onClick={() => removeAssignedProblem(problem._id)}
                          className="rounded-lg p-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                          title="Remove from company"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
                    No coding problems assigned to this company yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {companies.map((company) => (
          <div
            key={company._id}
            className="rounded-lg bg-white/5 border border-white/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{company.name}</h3>
              <div className="mt-2 flex items-center gap-4">
                <span className="inline-block rounded-full bg-brand-500/20 px-3 py-1 text-xs font-medium text-brand-300">
                  {company.type}
                </span>
                <span className="text-sm text-slate-400">
                  {company.focusAreas?.length || 0} focus areas
                </span>
                <span className="text-sm text-slate-400">
                  {company.assignedProblemCount || 0} assigned problems
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleManageQuestions(company)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-white/10 transition"
              >
                <BookOpen className="h-4 w-4" />
                Assign Problems
              </button>
              <button
                onClick={() => handleEdit(company)}
                className="rounded-lg p-2 hover:bg-white/10 transition"
              >
                <Edit2 className="h-5 w-5 text-blue-400" />
              </button>
              <button
                onClick={() => handleDelete(company.name)}
                className="rounded-lg p-2 hover:bg-white/10 transition"
              >
                <Trash2 className="h-5 w-5 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          title={editingCompany ? "Edit Company" : "Add New Company"}
          onClose={() => {
            setShowModal(false);
            setEditingCompany(null);
          }}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!!editingCompany}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition disabled:opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Logo URL</label>
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                      placeholder="https://logo.clearbit.com/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                    >
                      <option value="Mass Hiring">Mass Hiring</option>
                      <option value="Product Based">Product Based</option>
                      <option value="Startup">Startup</option>
                      <option value="Consulting">Consulting</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Focus Areas (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.focusAreas}
                    onChange={(e) => setFormData({ ...formData, focusAreas: e.target.value })}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                    placeholder="DSA, Database, API Design"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition h-24 resize-none"
                  />
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4 py-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Interview Process</h3>
                  <p className="text-sm text-slate-400 mb-6">How many interview rounds/steps does this company conduct?</p>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={numSteps === 0 ? "" : numSteps}
                    onChange={(e) => setNumSteps(e.target.value === "" ? 0 : parseInt(e.target.value))}
                    className="w-32 mx-auto text-center rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-2xl text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                    required
                  />
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-8">
                {formData.interviewProcess.map((step, index) => (
                  <div key={index} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-4 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                      {index + 1}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Round Name / Stage</label>
                        <input
                          type="text"
                          value={step.stage || ""}
                          onChange={(e) => handleProcessChange(index, "stage", e.target.value)}
                          className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-brand-500"
                          placeholder="e.g. Online Assessment"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Duration</label>
                          <input
                            type="text"
                            value={step.duration || ""}
                            onChange={(e) => handleProcessChange(index, "duration", e.target.value)}
                            className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-brand-500"
                            placeholder="e.g. 90 mins"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Selection Rate</label>
                          <input
                            type="text"
                            value={step.selectionRate || ""}
                            onChange={(e) => handleProcessChange(index, "selectionRate", e.target.value)}
                            className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-brand-500"
                            placeholder="e.g. ~20%"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Topics / Tags (comma separated)</label>
                      <input
                        type="text"
                        value={step.tags || ""}
                        onChange={(e) => handleProcessChange(index, "tags", e.target.value)}
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-brand-500"
                        placeholder="e.g. Aptitude, Coding, CS Fundamentals"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                      <textarea
                        value={step.description || ""}
                        onChange={(e) => handleProcessChange(index, "description", e.target.value)}
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-brand-500 h-16 resize-none"
                        placeholder="Details about this round..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-white/10 mt-4">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="rounded-lg border border-white/20 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-white/10 transition"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCompany(null);
                  }}
                  className="rounded-lg border border-white/20 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              )}
              
              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleNextStep(); }}
                  className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-brand-600 transition"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white hover:bg-emerald-600 transition"
                >
                  {editingCompany ? "Update Company" : "Save Company"}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {showQuestionModal && (
        <Modal
          isOpen={showQuestionModal}
          title={`Manage Questions for ${selectedCompany?.name}`}
          onClose={() => setShowQuestionModal(false)}
        >
          {questionModalMode === "list" ? (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-slate-300">Existing Questions ({companyQuestions.length})</h3>
                <button
                  onClick={openAddQuestionForm}
                  className="flex items-center gap-2 bg-brand-500/20 text-brand-500 px-3 py-1.5 rounded-lg hover:bg-brand-500/30 transition text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>

              {questionLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : companyQuestions.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <p>No questions assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companyQuestions.map((q) => (
                    <div key={q._id} className="flex justify-between items-center p-3 rounded-lg border border-white/10 bg-white/5">
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">{q.title}</div>
                        <div className="text-xs text-slate-400 mt-1 capitalize flex items-center gap-2">
                          <span className="bg-white/10 px-2 py-0.5 rounded">{q.type}</span>
                          <span className="bg-white/10 px-2 py-0.5 rounded">{q.difficulty}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-slate-300">Add New Question</h3>
                <button
                  onClick={() => setQuestionModalMode("list")}
                  className="text-sm text-brand-500 hover:underline"
                >
                  Back to List
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Problem Title</label>
                  <input
                    type="text"
                    value={questionForm.title}
                    onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                    <select
                      value={questionForm.type}
                      onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                    >
                      <option value="coding">Coding</option>
                      <option value="aptitude">Aptitude</option>
                      <option value="interview">Interview</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Level (Difficulty)</label>
                    <select
                      value={questionForm.difficulty}
                      onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                    >
                      <option value="easy">Fundamentals</option>
                      <option value="medium">Advanced Problems</option>
                      <option value="hard">Hardcore Algorithms</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Topic</label>
                  <input
                    type="text"
                    value={questionForm.topic}
                    onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                    placeholder="e.g., Arrays, Dynamic Programming"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    value={questionForm.description}
                    onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition h-32 resize-none"
                    required
                  />
                </div>

                {/* Aptitude specific fields */}
                {questionForm.type === "aptitude" && (
                  <div className="space-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
                    <h4 className="text-sm font-medium text-brand-500">Aptitude Options</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {questionForm.options.map((opt, i) => (
                        <div key={i}>
                          <label className="block text-xs text-slate-400 mb-1">Option {i + 1}</label>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...questionForm.options];
                              newOpts[i] = e.target.value;
                              setQuestionForm({ ...questionForm, options: newOpts });
                            }}
                            className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500"
                            placeholder={`Option ${i + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Correct Answer</label>
                      <select
                        value={questionForm.correctOptionIndex}
                        onChange={(e) => setQuestionForm({ ...questionForm, correctOptionIndex: parseInt(e.target.value) })}
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500"
                      >
                        {questionForm.options.map((_, i) => (
                          <option key={i} value={i}>Option {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Coding specific fields (simplified) */}
                {questionForm.type === "coding" && (
                  <div className="space-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
                    <h4 className="text-sm font-medium text-brand-500">Coding Details</h4>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={(questionForm.tags || [""]).join(", ")}
                        onChange={(e) => setQuestionForm({ ...questionForm, tags: e.target.value.split(",").map(s => s.trim()) })}
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Example Input</label>
                      <input
                        type="text"
                        value={(questionForm.examples || [{}])[0]?.input || ""}
                        onChange={(e) => setQuestionForm({
                          ...questionForm,
                          examples: [{ ...(questionForm.examples || [{}])[0], input: e.target.value }]
                        })}
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 mb-2"
                      />
                      <label className="block text-xs text-slate-400 mb-1">Example Output</label>
                      <input
                        type="text"
                        value={(questionForm.examples || [{}])[0]?.output || ""}
                        onChange={(e) => setQuestionForm({
                          ...questionForm,
                          examples: [{ ...(questionForm.examples || [{}])[0], output: e.target.value }]
                        })}
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setQuestionModalMode("list")}
                    className="rounded-lg border border-white/20 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-brand-600 transition"
                  >
                    Save Question
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default AdminCompanyManagementPage;



