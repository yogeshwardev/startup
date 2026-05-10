import { useEffect, useState } from "react";
import http from "../../api/http";
import CodeEditor from "../../components/CodeEditor";
import { Play, Send } from "lucide-react";

const EditorPage = () => {
  const [problems, setProblems] = useState([]);
  const [problemsError, setProblemsError] = useState("");
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState(null);
  const [queueResult, setQueueResult] = useState(null);
  const [actionError, setActionError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        setProblemsError("");
        const response = await http.get("/problems");
        setProblems(response.data);
        setSelectedProblemId(response.data[0]?._id || "");
      } catch (error) {
        setProblems([]);
        setProblemsError(error.response?.data?.message || "Unable to load problems right now.");
      }
    };

    loadProblems();
  }, []);

  const selectedProblem = problems.find((problem) => problem._id === selectedProblemId);

  useEffect(() => {
    if (selectedProblem?.sampleTestCases?.[0]?.input) {
      setStdin(selectedProblem.sampleTestCases[0].input);
    }
  }, [selectedProblemId, selectedProblem]);

  const handleRun = async () => {
    try {
      setIsRunning(true);
      setActionError("");
      const { data } = await http.post("/run-code", { code, language, stdin });
      setResult(data);
    } catch (error) {
      setResult(null);
      setActionError(error.response?.data?.message || "Code execution failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setActionError("");
      const { data } = await http.post("/submit", {
        code,
        language,
        problemId: selectedProblemId,
      });
      setQueueResult(data);
    } catch (error) {
      setQueueResult(null);
      setActionError(error.response?.data?.message || "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px - 2.5rem)" }}>
      <div className="flex-1 min-h-0 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left Panel — Problem Brief */}
        <div className="card flex flex-col min-h-0 overflow-hidden">
          <div className="shrink-0 p-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <h3 className="text-base font-bold font-display" style={{ color: "var(--text-primary)" }}>Problem Brief</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {problemsError ? <p className="text-sm text-rose-400">{problemsError}</p> : null}
            {!problemsError && problems.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No coding problems are available yet. Add one from the admin panel to enable guided runs and submissions.
              </p>
            ) : null}
            {selectedProblem ? (
              <>
                <select
                  className="w-full input-field px-3 py-2.5 text-sm"
                  value={selectedProblemId}
                  onChange={(event) => setSelectedProblemId(event.target.value)}
                >
                  {problems.map((problem) => (
                    <option key={problem._id} value={problem._id}>
                      {problem.title}
                    </option>
                  ))}
                </select>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{selectedProblem.difficulty}</p>
                  <p className="whitespace-pre-line text-sm" style={{ color: "var(--text-secondary)" }}>{selectedProblem.description}</p>
                </div>
                <div className="rounded-lg p-3 text-sm font-mono"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)" }}>
                  <p className="font-semibold text-xs mb-1.5 font-sans" style={{ color: "var(--text-primary)" }}>Sample Input</p>
                  <pre className="whitespace-pre-wrap text-xs" style={{ color: "var(--text-secondary)" }}>{selectedProblem.sampleTestCases?.[0]?.input}</pre>
                  <p className="font-semibold text-xs mt-3 mb-1.5 font-sans" style={{ color: "var(--text-primary)" }}>Sample Output</p>
                  <pre className="whitespace-pre-wrap text-xs text-emerald-400">{selectedProblem.sampleTestCases?.[0]?.expectedOutput}</pre>
                </div>
                <textarea
                  className="min-h-24 w-full input-field px-3 py-2.5 text-sm font-mono resize-none"
                  placeholder="Custom stdin for dry runs"
                  value={stdin}
                  onChange={(event) => setStdin(event.target.value)}
                />
              </>
            ) : null}
          </div>
        </div>

        {/* Right Panel — Code Editor */}
        <div className="rounded-xl flex flex-col overflow-hidden min-h-0"
          style={{ background: "#1e1e1e", border: "1px solid var(--border-default)" }}>
          {/* Editor Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Monaco Editor</span>
            <select
              className="rounded-md px-2.5 py-1.5 text-sm font-medium outline-none cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e5e7eb" }}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="python">Python</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Code Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor language={language} value={code} onChange={setCode} />
          </div>

          {/* Actions + Output */}
          <div className="shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 px-4 py-2.5">
              <button type="button" onClick={handleRun} disabled={isRunning}
                className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e5e7eb" }}>
                <Play className="w-3.5 h-3.5" />
                {isRunning ? "Running..." : "Run Code"}
              </button>
              <button type="button" onClick={handleSubmit} disabled={isSubmitting || !selectedProblemId}
                className="flex items-center gap-1.5 rounded-md bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors disabled:opacity-50">
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
            {actionError ? <p className="px-4 pb-3 text-sm text-rose-400">{actionError}</p> : null}
            {result ? (
              <div className="mx-4 mb-3 rounded-lg p-3 text-sm font-mono"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="font-semibold text-xs font-sans mb-1.5" style={{ color: "var(--text-primary)" }}>Run Result</p>
                <pre className="whitespace-pre-wrap text-xs" style={{ color: "#d1d5db" }}>{result.stdout || result.stderr || "No output"}</pre>
              </div>
            ) : null}
            {queueResult ? (
              <div className="mx-4 mb-3 rounded-lg p-3 text-sm"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="font-semibold text-xs mb-1" style={{ color: "var(--text-primary)" }}>Submission queued</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Submission ID: {queueResult.submissionId}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;



