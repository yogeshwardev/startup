import { ArrowLeft, Play, Send, ChevronDown, RotateCcw, Lightbulb, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import http from "../../api/http";
import CodeEditor from "../../components/CodeEditor";
import Modal from "../../components/Modal";
import Skeleton from "../../components/Skeleton";

const tabs = ["Description", "Submissions"];

const PlacementProblemWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [consoleExpanded, setConsoleExpanded] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await http.get(`/placement/question/${id}`);
        setQuestion(data);
        const parseBody = (code, lang) => {
          const m = lang === "python" ? "# __INSERT_BODY_HERE__" : "// __INSERT_BODY_HERE__";
          const replacement = lang === "python" ? "    # Write your logic here" : "  // Write your logic here";
          if (code && code.includes(m)) {
            return code.replace(m, replacement);
          }
          return code || "";
        };

        setCodeMap({
          python: parseBody(data.starterCode?.python, "python"),
          cpp: parseBody(data.starterCode?.cpp, "cpp"),
          java: parseBody(data.starterCode?.java, "java"),
          javascript: parseBody(data.starterCode?.javascript, "javascript"),
          c: parseBody(data.starterCode?.c, "c"),
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

  const handleReset = () => {
    const parseBody = (code, lang) => {
      const m = lang === "python" ? "# __INSERT_BODY_HERE__" : "// __INSERT_BODY_HERE__";
      const replacement = lang === "python" ? "    # Write your logic here" : "  // Write your logic here";
      if (code && code.includes(m)) {
        return code.replace(m, replacement);
      }
      return code || "";
    };
    setCodeMap((current) => ({
      ...current,
      [language]: parseBody(question?.starterCode?.[language], language)
    }));
  };

  const handleRun = async () => {
    if (!question) return;

    try {
      setRunning(true);
      const { data } = await http.post("/run-code", {
        problemId: question._id,
        code: currentCode,
        language,
        stdin: customInput,
      });
      setRunResult(data);
      setConsoleExpanded(true);
    } catch (requestError) {
      setRunResult({
        stderr: requestError.response?.data?.message || "Code run failed.",
      });
      setConsoleExpanded(true);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!question) return;

    try {
      setSubmitting(true);
      const { data } = await http.post("/submit", {
        problemId: question._id,
        code: currentCode,
        language,
      });
      setSubmitResult(data);

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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="card p-6 text-center">
          <p className="text-rose-400 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="btn-primary px-4 py-2 text-sm">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px - 2.5rem)" }}>
      {/* Header */}
      <div className="shrink-0 mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-brand-400 tracking-[0.15em] uppercase mb-1 flex items-center gap-2">
            <span className="w-4 h-px bg-brand-500/50" />
            Placement
          </p>
          <h1 className="text-xl font-bold font-display" style={{ color: "var(--text-primary)" }}>
            {question?.title || "Problem"}
          </h1>
          {question?.topic && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Topic: {question.topic}</p>
          )}
        </div>
        <button onClick={() => navigate(-1)}
          className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs shrink-0">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 min-h-0 grid gap-4 lg:grid-cols-3">
        {/* Left Panel */}
        <div className="lg:col-span-1 card flex flex-col min-h-0 overflow-hidden">
          {/* Badges */}
          <div className="shrink-0 px-4 pt-4 pb-3 flex flex-wrap gap-2">
            {question?.difficulty && (
              <span className={`badge text-xs ${
                question.difficulty === "easy" ? "badge-success" :
                question.difficulty === "medium" ? "badge-warning" : "badge-danger"
              }`}>
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </span>
            )}
            {question?.topic && (
              <span className="badge badge-info text-xs">{question.topic}</span>
            )}
          </div>

          {/* Tabs */}
          <div className="shrink-0 px-4 flex gap-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2.5 text-sm font-medium border-b-2 transition ${
                  activeTab === tab
                    ? "border-brand-500 text-brand-400"
                    : "border-transparent"
                }`}
                style={activeTab !== tab ? { color: "var(--text-muted)" } : {}}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === "Description" && (
              <>
                {question?.description && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-primary)" }}>Description</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                      {question.description}
                    </p>
                  </div>
                )}

                {question?.constraints && question.constraints.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-primary)" }}>Constraints</h3>
                    <ul className="space-y-1">
                      {question.constraints.map((constraint, idx) => (
                        <li key={idx} className="text-sm flex gap-2" style={{ color: "var(--text-secondary)" }}>
                          <span className="text-brand-400 shrink-0">•</span>
                          <span>{constraint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {question?.examples && question.examples.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-primary)" }}>Examples</h3>
                    <div className="space-y-2">
                      {question.examples.map((example, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden"
                          style={{ border: "1px solid var(--border-subtle)" }}>
                          <button
                            onClick={() => setExpandedExample(expandedExample === idx ? -1 : idx)}
                            className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left"
                          >
                            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                              Example {idx + 1}
                            </span>
                            <ChevronDown
                              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                expandedExample === idx ? "rotate-180" : ""
                              }`}
                              style={{ color: "var(--text-muted)" }}
                            />
                          </button>

                          {expandedExample === idx && (
                            <div className="px-3 py-2.5 space-y-2" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}>
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Input</p>
                                <pre className="rounded px-2.5 py-1.5 text-xs overflow-x-auto font-mono"
                                  style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                                  {example.input}
                                </pre>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Output</p>
                                <pre className="rounded px-2.5 py-1.5 text-xs overflow-x-auto font-mono text-emerald-400"
                                  style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
                                  {example.output}
                                </pre>
                              </div>
                              {example.explanation && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Explanation</p>
                                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
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
              </>
            )}

            {activeTab === "Submissions" && (
              <div className="space-y-2">
                {submitResult && (
                  <div className={`rounded-lg p-3 text-sm ${
                    submitResult.error ? "text-rose-400" : "text-emerald-400"
                  }`} style={{
                    background: submitResult.error ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
                    border: `1px solid ${submitResult.error ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"}`,
                  }}>
                    {submitResult.error || "✓ Submitted successfully!"}
                  </div>
                )}

                {submissions.length > 0 ? (
                  <div className="space-y-2">
                    {submissions.map((submission, idx) => (
                      <div key={idx} className="rounded-lg p-3"
                        style={{ border: "1px solid var(--border-subtle)" }}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                            {submission.language.toUpperCase()}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {new Date(submission.submittedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>No submissions yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Code Editor & Console */}
        <div className="lg:col-span-2 rounded-xl flex flex-col overflow-hidden min-h-0"
          style={{ background: "#1e1e1e", border: "1px solid var(--border-default)" }}>
          {/* Editor Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Editor</span>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-md px-2.5 py-1.5 text-sm font-medium outline-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e5e7eb" }}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
              <button onClick={handleReset} title="Reset Code"
                className="p-1.5 rounded-md transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              {question?.hint && (
                <button onClick={() => setHintOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", color: "#818cf8" }}>
                  <Lightbulb className="w-3.5 h-3.5" />
                  Hint
                </button>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor language={language} value={codeMap[language] || ""} onChange={handleCodeChange} />
          </div>

          {/* Bottom Panel */}
          <div className="shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#1e1e1e" }}>
            <button
              onClick={() => setConsoleExpanded(!consoleExpanded)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-white/[0.03] transition-colors"
              style={{ color: "#9ca3af" }}
            >
              Console Output
              {consoleExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            {consoleExpanded && (
              <div className="px-4 pb-3 grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Input</label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter test input..."
                    className="flex-1 rounded-md px-3 py-2 text-xs placeholder-gray-600 outline-none resize-none font-mono min-h-[80px]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#d1d5db" }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Output</label>
                  <div className="flex-1 rounded-md p-3 font-mono text-xs overflow-y-auto min-h-[80px]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {runResult ? (
                      <pre className="whitespace-pre-wrap break-words">
                        {runResult.stderr ? (
                          <span className="text-rose-400">{runResult.stderr}</span>
                        ) : runResult.stdout ? (
                          <span className="text-emerald-400">{runResult.stdout}</span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>No output</span>
                        )}
                      </pre>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>Run code to see output</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-3">
                {submitResult?.error && <span className="text-xs text-rose-400">{submitResult.error}</span>}
                {submitResult && !submitResult.error && <span className="text-xs text-emerald-400">Submitted successfully</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleRun} disabled={running}
                  className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e5e7eb" }}>
                  <Play className="h-3.5 w-3.5" />
                  {running ? "Running..." : "Run Code"}
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-1.5 rounded-md bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="h-3.5 w-3.5" />
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={hintOpen} onClose={() => setHintOpen(false)} title="Problem Hint">
        <div className="p-4 rounded-lg text-sm leading-relaxed"
          style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)", color: "#c7d2fe" }}>
          <Lightbulb className="w-5 h-5 mb-2 text-brand-400" />
          {question?.hint || "No hint available for this problem."}
        </div>
      </Modal>
    </div>
  );
};

export default PlacementProblemWorkspacePage;



