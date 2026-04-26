import { ArrowLeft, Play, Send, ChevronDown, Copy, Check, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import http from "../../api/http";
import CodeEditor from "../../components/CodeEditor";
import Modal from "../../components/Modal";
import Skeleton from "../../components/Skeleton";
import PageHeader from "../../components/PageHeader";

const tabs = ["Description", "Submissions"];

const PlacementProblemWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);

  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState("python");
  const [codeMap, setCodeMap] = useState({});
  const [customInput, setCustomInput] = useState("");
  const [activeTab, setActiveTab] = useState("Description");
  const [submissions, setSubmissions] = useState([]);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [expandedExample, setExpandedExample] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await http.get(`/placement/question/${id}`);
        setQuestion(data);
        setCodeMap({
          python: "",
          cpp: "",
          java: "",
        });
        if (data.examples && data.examples.length > 0) {
          setCustomInput(data.examples[0]?.input || "");
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load question."
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [id]);

  const currentCode = codeMap[language] || "";

  const handleCodeChange = (nextCode) => {
    setCodeMap((current) => ({ ...current, [language]: nextCode }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRun = async () => {
    if (!question) {
      return;
    }

    try {
      setRunning(true);
      const { data } = await http.post("/run-code", {
        code: currentCode,
        language,
        stdin: customInput,
      });
      setRunResult(data);
    } catch (requestError) {
      setRunResult({
        stderr: requestError.response?.data?.message || "Code run failed.",
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!question) {
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await http.post("/placement/submit-solution", {
        questionId: id,
        code: currentCode,
        language,
      });
      setSubmitResult(data);

      // Fetch submissions for this question
      try {
        const submissionsData = await http.get(`/placement/question/${id}/submissions`);
        setSubmissions(submissionsData.data);
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
      }
    } catch (requestError) {
      setSubmitResult({
        error: requestError.response?.data?.message || "Submission failed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle panel resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const container = resizeRef.current?.parentElement;
      if (!container) return;

      const newWidth = ((e.clientX - container.getBoundingClientRect().left) / container.clientWidth) * 100;
      if (newWidth > 20 && newWidth < 70) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Placement" title="Loading..." description="Loading problem details" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Placement" title="Error" description="Unable to load problem" />
        <div className="app-surface rounded-xl border p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow="Placement"
        title={question?.title || "Problem"}
        description={question?.topic && `Topic: ${question.topic}`}
        action={
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        }
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Problem Description */}
        <div className="lg:col-span-1">
          <div className="app-surface rounded-xl border p-5 space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {question?.difficulty && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    question.difficulty === "easy"
                      ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
                      : question.difficulty === "medium"
                      ? "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
                      : "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30"
                  }`}
                >
                  {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                </span>
              )}
              {question?.topic && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30">
                  {question.topic}
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700">
              <div className="flex gap-0">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                      activeTab === tab
                        ? "border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-5 max-h-[500px] overflow-y-auto">
              {activeTab === "Description" && (
                <div className="space-y-5">
                  {/* Description */}
                  {question?.description && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Description</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {question.description}
                      </p>
                    </div>
                  )}

                  {/* Constraints */}
                  {question?.constraints && question.constraints.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Constraints</h3>
                      <ul className="space-y-1.5">
                        {question.constraints.map((constraint, idx) => (
                          <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex gap-2">
                            <span className="text-brand-600 dark:text-brand-400 flex-shrink-0">•</span>
                            <span>{constraint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Examples */}
                  {question?.examples && question.examples.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Examples</h3>
                      <div className="space-y-2">
                        {question.examples.map((example, idx) => (
                          <div key={idx} className="app-muted rounded-lg border overflow-hidden">
                            <button
                              onClick={() =>
                                setExpandedExample(expandedExample === idx ? -1 : idx)
                              }
                              className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                            >
                              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                Example {idx + 1}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                                  expandedExample === idx ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            {expandedExample === idx && (
                              <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 space-y-3 bg-slate-50 dark:bg-slate-800/50">
                                <div>
                                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                                    Input
                                  </p>
                                  <pre className="bg-white dark:bg-slate-900 rounded px-3 py-2 text-xs text-slate-900 dark:text-slate-300 overflow-x-auto border border-slate-200 dark:border-slate-700 font-mono">
                                    {example.input}
                                  </pre>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                                    Output
                                  </p>
                                  <pre className="bg-white dark:bg-slate-900 rounded px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400 overflow-x-auto border border-slate-200 dark:border-slate-700 font-mono">
                                    {example.output}
                                  </pre>
                                </div>
                                {example.explanation && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                                      Explanation
                                    </p>
                                    <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed">
                                      {example.explanation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submissions Tab */}
              {activeTab === "Submissions" && (
                <div className="space-y-3">
                  {submitResult && (
                    <div
                      className={`rounded-lg p-3 border text-sm ${
                        submitResult.error
                          ? "bg-red-50 dark:bg-red-500/15 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300"
                          : "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {submitResult.error || "✓ Submitted successfully!"}
                    </div>
                  )}

                  {submissions.length > 0 ? (
                    <div className="space-y-2">
                      {submissions.map((submission, idx) => (
                        <div key={idx} className="app-muted rounded border p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {submission.language.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(submission.submittedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">No submissions yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor & Output */}
        <div className="lg:col-span-2 app-surface rounded-xl border p-5 flex flex-col space-y-4">
          {/* Editor Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 focus:border-brand-500 outline-none transition-colors cursor-pointer"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-medium transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Code Editor */}
          <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden min-h-64">
            <CodeEditor
              language={language}
              value={codeMap[language] || ""}
              onChange={handleCodeChange}
            />
          </div>

          {/* Input/Output Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Input */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">Input</label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter test input..."
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-500 outline-none focus:border-brand-500 transition-colors resize-none font-mono"
              />
            </div>

            {/* Output */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">Output</label>
              <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 font-mono text-xs overflow-y-auto">
                {runResult ? (
                  <pre className="whitespace-pre-wrap break-words">
                    {runResult.stderr ? (
                      <span className="text-red-700 dark:text-red-400">{runResult.stderr}</span>
                    ) : runResult.stdout ? (
                      <span className="text-emerald-700 dark:text-emerald-400">{runResult.stdout}</span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">No output</span>
                    )}
                  </pre>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">Run code to see output</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleRun}
              disabled={running}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              {running ? "Running..." : "Run"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementProblemWorkspacePage;
