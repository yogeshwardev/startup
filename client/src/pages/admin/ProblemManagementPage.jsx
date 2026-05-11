import { useState } from "react";
import { Sparkles, Code2, ChevronDown, ChevronUp, Upload, FileDown } from "lucide-react";
import http from "../../api/http";
import { useToast } from "../../hooks/useToast";

const defaultProblem = {
  title: "",
  slug: "",
  description: "",
  difficulty: "easy",
  category: "General",
  companyId: "",
  tags: "",
  constraints: "",
  inputFormat: "",
  outputFormat: "",
  visibleInput: "",
  visibleOutput: "",
  hiddenInput: "",
  hiddenOutput: "",
  python: "",
  cpp: "",
  java: "",
  javascript: "",
  c: "",
  timeLimitMs: 2000,
  memoryLimitMb: 256,
};

const toProblemPayload = (form, generatedAssets) => {
  const payload = {
    title: form.title,
    slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    description: form.description,
    difficulty: form.difficulty.charAt(0).toUpperCase() + form.difficulty.slice(1),
    category: form.category,
    companyId: form.companyId,
    tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
    constraints: form.constraints.split("\n").map((item) => item.trim()).filter(Boolean),
    inputFormat: form.inputFormat,
    outputFormat: form.outputFormat,
    starterCode: {
      python: form.python,
      cpp: form.cpp,
      java: form.java,
      javascript: form.javascript,
      c: form.c,
    },
    timeLimitMs: Number(form.timeLimitMs),
    memoryLimitMb: Number(form.memoryLimitMb),
  };

  if (generatedAssets) {
    const examples = [...generatedAssets.examples];
    if (examples.length > 0) {
      examples[0].input = form.visibleInput || examples[0].input;
      examples[0].output = form.visibleOutput || examples[0].output;
    }

    const hiddenTestCases = [...generatedAssets.hiddenTestCases];
    if (hiddenTestCases.length > 0) {
      hiddenTestCases[0].input = form.hiddenInput || hiddenTestCases[0].input;
      hiddenTestCases[0].output = form.hiddenOutput || hiddenTestCases[0].output;
    }

    const safeStringify = (val) => (typeof val === "string" ? val : JSON.stringify(val));

    payload.examples = examples.map((ex) => ({
      ...ex,
      input: safeStringify(ex.input),
      output: safeStringify(ex.output),
    }));
    
    payload.visibleTestCases = [
      { 
        input: safeStringify(form.visibleInput || examples[0]?.input || ""), 
        expectedOutput: safeStringify(form.visibleOutput || examples[0]?.output || "") 
      },
    ];
    
    payload.hiddenTestCases = hiddenTestCases.map((tc) => ({
      input: safeStringify(tc.input),
      expectedOutput: safeStringify(tc.expectedOutput || tc.output),
      isHidden: true,
    }));
    
    payload.skeletonConfig = generatedAssets.skeletonConfig;
    payload.driverCode = generatedAssets.driverCode || {};
    payload.hint = generatedAssets.hint || "";
  } else {
    payload.examples = [{ input: form.visibleInput, output: form.visibleOutput }];
    payload.visibleTestCases = [
      { input: form.visibleInput, expectedOutput: form.visibleOutput },
    ];
    payload.hiddenTestCases = [
      {
        input: form.hiddenInput,
        expectedOutput: form.hiddenOutput,
        isHidden: true,
      },
    ];
  }

  return payload;
};

const parseCsv = (text) => {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current);
  if (row.some((cell) => cell.trim())) rows.push(row);

  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((cells) =>
    headers.reduce((entry, header, index) => {
      entry[header] = (cells[index] || "").trim();
      return entry;
    }, {})
  );
};

const ProblemManagementPage = () => {
  const toast = useToast();
  const [problemForm, setProblemForm] = useState(defaultProblem);
  const [savingProblem, setSavingProblem] = useState(false);
  const [generatingProblem, setGeneratingProblem] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);
  const [generatedAssets, setGeneratedAssets] = useState(null);
  const [showSkeletons, setShowSkeletons] = useState(false);

  const handleGenerate = async () => {
    if (!problemForm.title || !problemForm.description) {
      toast.error(
        "Missing input",
        "Please provide at least a title and a basic description."
      );
      return;
    }

    try {
      setGeneratingProblem(true);
      const { data } = await http.post("/generate-problem-assets", {
        title: problemForm.title,
        difficulty: problemForm.difficulty,
        tags: problemForm.tags,
        description: problemForm.description,
        constraints: problemForm.constraints,
      });

      const constraintsText = Array.isArray(data.constraints)
        ? data.constraints.join("\n")
        : data.constraints || problemForm.constraints;

      setProblemForm((prev) => ({
        ...prev,
        description: data.description || prev.description,
        constraints: constraintsText,
        python: data.templateCode?.python || prev.python,
        cpp: data.templateCode?.cpp || prev.cpp,
        java: data.templateCode?.java || prev.java,
        javascript: data.templateCode?.javascript || prev.javascript,
        c: data.templateCode?.c || prev.c,
        visibleInput: data.examples?.[0]?.input || prev.visibleInput,
        visibleOutput: data.examples?.[0]?.output || prev.visibleOutput,
        hiddenInput: data.hiddenTestCases?.[0]?.input || prev.hiddenInput,
        hiddenOutput: data.hiddenTestCases?.[0]?.output || prev.hiddenOutput,
      }));

      setGeneratedAssets({
        examples: data.examples || [],
        hiddenTestCases: data.hiddenTestCases || [],
        driverCode: data.driverCode || {},
        hint: data.hint || "",
        skeletonConfig: {
          functionName: data.functionName,
          parameters: data.parameters,
          parameterTypes: data.parameterTypes,
          returnType: data.returnType,
        },
      });

      setShowSkeletons(true);
      toast.success(
        "Assets Generated",
        "Please review the AI-generated description, constraints, and test cases."
      );
    } catch (error) {
      toast.error(
        "Generation failed",
        error.response?.data?.message || "Failed to generate assets."
      );
    } finally {
      setGeneratingProblem(false);
    }
  };

  const handleCreateProblem = async (event) => {
    event.preventDefault();
    try {
      setSavingProblem(true);
      const payload = toProblemPayload(problemForm, generatedAssets);
      const { data } = await http.post("/admin/problems", payload);
      toast.success(
        "Problem created",
        `${problemForm.title} is ready with ID ${data.problemCode}.`
      );
      setProblemForm(defaultProblem);
      setGeneratedAssets(null);
      setShowSkeletons(false);
    } catch (error) {
      toast.error(
        "Problem creation failed",
        error.response?.data?.message || "Unable to save problem."
      );
    } finally {
      setSavingProblem(false);
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setBulkUploading(true);
      setBulkResults([]);
      const text = await file.text();
      const rows = parseCsv(text);

      if (!rows.length) {
        toast.error("CSV is empty", "Please upload the sample format with at least one problem title.");
        return;
      }

      const { data } = await http.post("/admin/problems/bulk-generate", { rows });
      setBulkResults(data.results || []);
      toast.success(
        "Bulk generation finished",
        `${data.createdCount} created, ${data.failedCount} failed.`
      );
    } catch (error) {
      const message =
        error.response?.status === 404
          ? "Bulk route was not found. Please restart the backend server and try again."
          : error.response?.data?.message || "Unable to generate problems from CSV.";
      toast.error(
        "Bulk upload failed",
        message
      );
      setBulkResults(error.response?.data?.results || []);
    } finally {
      setBulkUploading(false);
    }
  };

  const inputClasses = "w-full rounded-xl border border-white/5 bg-transparent px-4 py-3 text-sm text-[var(--text-primary)] placeholder-slate-500 focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]";
  const labelClasses = "mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400";

  return (
    <div className="mx-auto max-w-[1400px] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <section className="mb-8 rounded-xl border border-white/5 bg-transparent p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Bulk Add Problems</h2>
              <p className="mt-1 text-sm text-slate-400">
                Upload a CSV with problem titles. Gemini generates descriptions, constraints, skeletons, drivers, and 10 hidden tests per row.
                Larger files run row-by-row and can take a few minutes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/samples/bulk-problems-template.csv"
                download
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/5"
              >
                <FileDown className="h-4 w-4" />
                Sample CSV
              </a>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition hover:bg-[#4338CA]">
                <Upload className="h-4 w-4" />
                {bulkUploading ? "Generating..." : "Upload CSV"}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  disabled={bulkUploading}
                  onChange={handleBulkUpload}
                />
              </label>
            </div>
          </div>

          {bulkUploading && (
            <div className="mt-5 rounded-xl border border-[#4F46E5]/30 bg-[#4F46E5]/10 px-4 py-3 text-sm font-semibold text-slate-200">
              Generating problems with Gemini. Keep this page open while each row is processed.
            </div>
          )}

          {bulkResults.length > 0 && (
            <div className="mt-5 overflow-hidden rounded-xl border border-white/5">
              {bulkResults.map((result) => (
                <div
                  key={`${result.row}-${result.title}`}
                  className="flex flex-col gap-1 border-b border-white/5 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Row {result.row}: {result.title || "Untitled"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {result.status === "created"
                        ? `${result.problemCode} created with ${result.hiddenTestCount} hidden tests`
                        : result.message}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                      result.status === "created"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
        
          <form className="space-y-6" onSubmit={handleCreateProblem}>
            <div>
              <label className={labelClasses}>TITLE</label>
              <input
                className={inputClasses}
                value={problemForm.title}
                onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>DIFFICULTY</label>
                <select
                  className={inputClasses}
                  value={problemForm.difficulty}
                  onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
                >
                  <option value="easy" className="bg-[var(--bg-base)]">easy</option>
                  <option value="medium" className="bg-[var(--bg-base)]">medium</option>
                  <option value="hard" className="bg-[var(--bg-base)]">hard</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>CATEGORY</label>
                <input
                  className={inputClasses}
                  value={problemForm.category}
                  onChange={(e) => setProblemForm({ ...problemForm, category: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>COMPANY ID</label>
              <input
                className={inputClasses}
                placeholder="Optional placement company id"
                value={problemForm.companyId}
                onChange={(e) => setProblemForm({ ...problemForm, companyId: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClasses}>TAGS</label>
              <input
                className={inputClasses}
                placeholder="array, hash map, dp"
                value={problemForm.tags}
                onChange={(e) => setProblemForm({ ...problemForm, tags: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClasses}>DESCRIPTION</label>
              <textarea
                className={`${inputClasses} min-h-32 resize-y`}
                value={problemForm.description}
                onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClasses}>CONSTRAINTS</label>
              <textarea
                className={`${inputClasses} min-h-24 resize-y`}
                value={problemForm.constraints}
                onChange={(e) => setProblemForm({ ...problemForm, constraints: e.target.value })}
              />
            </div>
            
            {/* Skeletons Toggle */}
            <div className="rounded-xl border border-white/5 bg-transparent overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSkeletons(!showSkeletons)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition hover:bg-white/5"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <Code2 className="h-4 w-4" />
                  REVIEW SKELETON CODE
                </div>
                {showSkeletons ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>
              
              {showSkeletons && (
                <div className="p-4 pt-0 space-y-4 border-t border-white/5 mt-2">
                  {[
                    { key: "javascript", label: "JAVASCRIPT SKELETON" },
                    { key: "java", label: "JAVA SKELETON" },
                    { key: "python", label: "PYTHON SKELETON" },
                    { key: "cpp", label: "C++ SKELETON" },
                    { key: "c", label: "C SKELETON" },
                  ].map((lang) => (
                    <div key={lang.key}>
                      <label className={labelClasses}>{lang.label}</label>
                      <textarea
                        className={`${inputClasses} min-h-24 resize-y font-mono text-[13px]`}
                        value={problemForm[lang.key]}
                        onChange={(e) => setProblemForm({ ...problemForm, [lang.key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Generation/Creation Controls */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#4F46E5]/50 bg-[#4F46E5]/10 px-4 py-3.5 text-sm font-bold text-[#4F46E5] transition hover:bg-[#4F46E5]/20 hover:border-[#4F46E5] disabled:opacity-50"
                disabled={generatingProblem}
              >
                <Sparkles className="h-4 w-4" />
                {generatingProblem ? "Generating Assets..." : "Generate Description & Test Cases"}
              </button>

              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-xl bg-[#4F46E5] px-4 py-3.5 text-sm font-bold text-[var(--text-primary)] transition hover:bg-[#4338CA] disabled:opacity-50 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                disabled={savingProblem}
              >
                + {savingProblem ? "Saving..." : "Create Problem"}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default ProblemManagementPage;



