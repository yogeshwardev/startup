import {
  AlertTriangle,
  Clock3,
  Play,
  Send,
  ShieldAlert,
  RotateCcw,
  Lightbulb,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import http from "../../api/http";
import CodeEditor from "../../components/CodeEditor";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import Skeleton from "../../components/Skeleton";

const tabs = ["Description", "Testcases", "Submissions"];
const MAX_WARNINGS = 3;

const formatOutput = (result) => {
  if (!result) {
    return "Run code to view output.";
  }

  if (result.stdout) {
    return result.stdout;
  }

  if (result.stderr) {
    return result.stderr;
  }

  if (result.status) {
    return `Submission status: ${result.status}`;
  }

  return "No output.";
};

const ProblemWorkspacePage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get("contestId");
  const isPracticeMode = !contestId;

  const [problem, setProblem] = useState(null);
  const [contest, setContest] = useState(null);
  const [language, setLanguage] = useState("python");
  const [codeMap, setCodeMap] = useState({});
  const [stdin, setStdin] = useState("");
  const [activeTab, setActiveTab] = useState("Description");
  const [submissions, setSubmissions] = useState([]);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [consoleExpanded, setConsoleExpanded] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    const loadProblem = async () => {
      try {
        setLoading(true);
        setError("");
        const problemResponse = await http.get(`/problems/${slug}`, {
          params: contestId ? { contestId } : {},
        });
        const data = problemResponse.data;
        let contestResponse = null;
        let sessionResponse = null;

        if (contestId) {
          contestResponse = await http.get(`/contests/${contestId}`);
        } else if (data?._id) {
          sessionResponse = await http
            .get(`/practice-sessions/problem/${data._id}`)
            .catch(() => ({ data: null }));
        }

        setProblem(data);
        setContest(contestResponse?.data || null);
        const parseBody = (code, lang) => {
          const m = lang === "python" ? "# __INSERT_BODY_HERE__" : "// __INSERT_BODY_HERE__";
          const replacement = lang === "python" ? "    # Write your logic here" : "  // Write your logic here";
          if (code && code.includes(m)) {
            return code.replace(m, replacement);
          }
          return code || "";
        };

        const baseCodeMap = {
          python: parseBody(data.starterCode?.python, "python"),
          cpp: parseBody(data.starterCode?.cpp, "cpp"),
          java: parseBody(data.starterCode?.java, "java"),
          javascript: parseBody(data.starterCode?.javascript, "javascript"),
          c: parseBody(data.starterCode?.c, "c"),
        };

        const subs = data.submissions || [];
        const submissionId = searchParams.get("submissionId");
        
        let targetSubmission = null;
        if (submissionId) {
          targetSubmission = subs.find(s => s._id === submissionId);
        } else if (subs.length > 0) {
          // If no specific submission requested, load the most recent one to prevent progress loss
          targetSubmission = subs[0];
        }

        if (targetSubmission && targetSubmission.code) {
          baseCodeMap[targetSubmission.language] = targetSubmission.code;
          setLanguage(targetSubmission.language);
        }

        setCodeMap(baseCodeMap);
        setStdin(data.visibleTestCases?.[0]?.input || "");
        setSubmissions(data.submissions || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load problem."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [contestId, slug]);

  const currentCode = codeMap[language] || "";
  const alreadySubmitted = submissions.some(sub => sub.status === "Accepted");
  const workspaceLocked = false;

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
      [language]: parseBody(problem?.starterCode?.[language], language)
    }));
  };

  const handleRun = async () => {
    if (!problem || workspaceLocked) {
      return;
    }

    try {
      setRunning(true);
      const { data } = await http.post("/run-code", {
        problemId: problem._id,
        code: currentCode,
        language,
        stdin,
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
    if (!problem || workspaceLocked) {
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await http.post("/submit", {
        problemId: problem._id,
        code: currentCode,
        language,
        contestId: contestId || undefined,
      });
      setSubmitResult(data);
      const refreshed = await http.get(`/submissions/problem/${problem._id}`, {
        params: contestId ? { contestId } : {},
      });
      setSubmissions(refreshed.data);
      setActiveTab("Submissions");
    } catch (requestError) {
      setSubmitResult({
        error: requestError.response?.data?.message || "Submission failed.",
      });
      setActiveTab("Submissions");
    } finally {
      setSubmitting(false);
    }
  };

  const tabContent = useMemo(() => {
    if (!problem) {
      return null;
    }

    if (activeTab === "Description") {
      return (
        <div className="space-y-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          <p className="whitespace-pre-line">{problem.description}</p>
          <div>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Tags</h3>
            <div className="flex flex-wrap gap-2">
              {problem.tags.map((tag) => (
                <span key={tag} className="rounded-md px-2.5 py-1 text-xs font-medium"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Visible test cases</h3>
            <div className="space-y-2">
              {problem.visibleTestCases.map((testCase, index) => (
                <div key={index} className="rounded-lg p-3 font-mono text-xs"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)" }}>
                  <pre className="whitespace-pre-wrap">Input: {testCase.input}</pre>
                  <pre className="mt-1.5 whitespace-pre-wrap text-emerald-400">Output: {testCase.expectedOutput}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "Testcases") {
      return (
        <div className="space-y-3">
          <textarea
            className="min-h-28 w-full input-field px-3 py-2.5 text-sm font-mono resize-none"
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            placeholder="Custom input"
            disabled={workspaceLocked}
          />
          <div className="rounded-lg p-3 text-sm"
            style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)" }}>
            <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Output console</p>
            <pre className="whitespace-pre-wrap font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
              {formatOutput(runResult)}
            </pre>
          </div>
        </div>
      );
    }

    return submissions.length ? (
      <div className="space-y-2">
        {submissions.map((submission) => (
          <div
            key={submission._id}
            className="rounded-lg p-3 text-sm cursor-pointer hover:bg-white/[0.02] transition"
            style={{ border: "1px solid var(--border-subtle)" }}
            onClick={() => {
              if (submission.code) {
                setCodeMap((prev) => ({ ...prev, [submission.language]: submission.code }));
                setLanguage(submission.language);
              }
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className={`font-semibold ${submission.status === "Accepted" ? "text-emerald-400" : "text-rose-400"}`}>
                {submission.status}
              </span>
              <span style={{ color: "var(--text-muted)" }}>
                {submission.language.toUpperCase()}
              </span>
            </div>
            <p className="mt-1.5" style={{ color: "var(--text-muted)" }}>
              {new Date(submission.createdAt).toLocaleString()}
            </p>
            
            {submission.status !== "Accepted" && submission.testResults?.length > 0 && (
              <div className="mt-3 space-y-2 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Failed Test Cases (Hidden)</p>
                {submission.testResults.filter(t => t.status !== "Accepted").slice(0, 2).map((test, idx) => (
                  <div key={idx} className="bg-rose-500/8 rounded-lg p-3 text-xs font-mono space-y-1.5"
                    style={{ border: "1px solid rgba(239, 68, 68, 0.1)" }}>
                    <div>
                      <span className="font-bold block mb-0.5" style={{ color: "var(--text-muted)" }}>INPUT:</span>
                      <span style={{ color: "var(--text-secondary)" }}>{test.input}</span>
                    </div>
                    <div>
                      <span className="font-bold block mb-0.5" style={{ color: "var(--text-muted)" }}>EXPECTED:</span>
                      <span className="text-emerald-400">{test.expectedOutput}</span>
                    </div>
                    <div>
                      <span className="font-bold block mb-0.5" style={{ color: "var(--text-muted)" }}>YOUR OUTPUT:</span>
                      <span className="text-rose-400">{test.actualOutput || "No output"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        title="No submissions yet"
        description="Submit a solution to populate submission history."
      />
    );
  }, [activeTab, problem, runResult, stdin, submissions, workspaceLocked]);

  if (loading) {
    return <Skeleton className="h-[720px]" />;
  }

  if (!problem) {
    return <EmptyState title="Problem not found" description={error} />;
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px - 2.5rem)" }}>
      {/* Header */}
      <div className="shrink-0 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-brand-400 tracking-[0.15em] uppercase mb-1 flex items-center gap-2">
              <span className="w-4 h-px bg-brand-500/50" />
              Code Arena
            </p>
            <h1 className="text-xl font-bold font-display" style={{ color: "var(--text-primary)" }}>{problem.title}</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {problem.problemCode} · {problem.difficulty} · {problem.tags.join(", ")}
            </p>
          </div>
          {contest && (
            <Link to={`/contest/${contest._id}`} className="btn-secondary px-3 py-1.5 text-xs shrink-0">
              Back to Contest
            </Link>
          )}
        </div>
      </div>

      {/* Main Grid — fills remaining height */}
      <div className="flex-1 min-h-0 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        {/* Left Panel — Problem Description */}
        <div className="card flex flex-col min-h-0 overflow-hidden">
          {/* Tabs */}
          <div className="shrink-0 flex gap-0 px-4 pt-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`px-3 py-2.5 text-sm font-medium border-b-2 transition ${
                  activeTab === tab
                    ? "border-brand-500 text-brand-400"
                    : "border-transparent"
                }`}
                style={activeTab !== tab ? { color: "var(--text-muted)" } : {}}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4">
            {tabContent}
          </div>
        </div>

        {/* Right Panel — Code Editor & Console */}
        <div className="rounded-xl flex flex-col overflow-hidden min-h-0"
          style={{ background: "#1e1e1e", border: "1px solid var(--border-default)" }}>
          {/* Editor Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Editor</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
                {problem.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={workspaceLocked}
                className="rounded-md px-2.5 py-1.5 text-sm font-medium outline-none transition-colors cursor-pointer disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e5e7eb" }}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
              <button onClick={handleReset} title="Reset Code" disabled={workspaceLocked}
                className="p-1.5 rounded-md transition-colors disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              {problem?.hint && (
                <button onClick={() => setHintOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", color: "#818cf8" }}>
                  <Lightbulb className="w-3.5 h-3.5" />
                  Hint
                </button>
              )}
            </div>
          </div>

          {/* Code Editor — flex-1 so it fills available space */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              language={language}
              value={currentCode}
              onChange={handleCodeChange}
              options={{
                readOnly: alreadySubmitted || workspaceLocked,
              }}
            />
          </div>

          {/* Bottom Panel — Console + Actions */}
          <div className="shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#1e1e1e" }}>
            {/* Console Toggle */}
            <button
              onClick={() => setConsoleExpanded(!consoleExpanded)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-white/[0.03] transition-colors"
              style={{ color: "#9ca3af" }}
            >
              Console Output
              {consoleExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            {/* Console Content */}
            {consoleExpanded && (
              <div className="px-4 pb-3 grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Input</label>
                  <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Enter test input..."
                    disabled={workspaceLocked}
                    className="flex-1 rounded-md px-3 py-2 text-xs placeholder-gray-600 outline-none focus:border-brand-500 transition-colors resize-none font-mono min-h-[80px] disabled:opacity-50"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#d1d5db" }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Output</label>
                  <div className="flex-1 rounded-md p-3 font-mono text-xs overflow-y-auto min-h-[80px] flex flex-col gap-2"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {runResult ? (
                      <>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>YOUR OUTPUT</span>
                          <pre className="whitespace-pre-wrap break-words">
                            {runResult.stderr ? (
                              <span className="text-rose-400">{runResult.stderr}</span>
                            ) : runResult.stdout ? (
                              <span style={{ color: "#d1d5db" }}>{runResult.stdout}</span>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>No output</span>
                            )}
                          </pre>
                        </div>
                        {problem?.visibleTestCases?.find(t => t.input.trim() === stdin.trim()) && !runResult.stderr && (
                          <div className="flex flex-col pt-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            <span className="text-[10px] font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>EXPECTED OUTPUT</span>
                            <pre className="whitespace-pre-wrap break-words text-emerald-400">
                              {problem.visibleTestCases.find(t => t.input.trim() === stdin.trim()).expectedOutput}
                            </pre>
                          </div>
                        )}
                      </>
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
                 {submitResult?.submissionId && <span className="text-xs text-emerald-400">Submission queued: {submitResult.submissionId}</span>}
                 {submitResult?.error && <span className="text-xs text-rose-400">{submitResult.error}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRun}
                  disabled={running || workspaceLocked}
                  className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e5e7eb" }}
                >
                  <Play className="h-3.5 w-3.5" />
                  {running ? "Running..." : "Run Code"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || workspaceLocked || alreadySubmitted}
                  className="flex items-center gap-1.5 rounded-md bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-3.5 w-3.5" />
                  {alreadySubmitted ? "Solved" : submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={hintOpen}
        onClose={() => setHintOpen(false)}
        title="Problem Hint"
      >
        <div className="p-4 rounded-lg text-sm leading-relaxed"
          style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)", color: "#c7d2fe" }}>
           <Lightbulb className="w-5 h-5 mb-2 text-brand-400" />
           {problem?.hint || "No hint available for this problem."}
        </div>
      </Modal>

    </div>
  );
};

export default ProblemWorkspacePage;



