import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock, AlertCircle, X, ChevronLeft, ChevronRight,
  Play, Send, Check, Code2, FileText, Lock
} from "lucide-react";
import CodeEditor from "../../components/CodeEditor";
import http from "../../api/http";
import Skeleton from "../../components/Skeleton";

const LANG_LABELS = { python: "Python", cpp: "C++", java: "Java", javascript: "JavaScript", c: "C" };
const MAX_WARNINGS = 3;

const diffStyle = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-rose-400",
};

const formatTime = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const ExamWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [testStarted, setTestStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [codeMap, setCodeMap] = useState({});     // { problemId: code }
  const [submittedMap, setSubmittedMap] = useState({}); // { problemId: status }
  const [runResult, setRunResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [warningMsg, setWarningMsg] = useState("");
  const [malpracticeReason, setMalpracticeReason] = useState("");
  const [needsFullscreen, setNeedsFullscreen] = useState(false);

  const fullscreenRef = useRef(null);
  const warningsRef = useRef(0);
  const lastViolationAt = useRef(0);
  const restoringFS = useRef(false);

  // Load exam
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await http.get("/admin/mock-tests");
        const found = data.find((e) => e._id === id);
        if (!found) { setError("Exam not found."); return; }

        // check if within time window
        const now = new Date();
        if (found.scheduledFor) {
          const start = new Date(found.scheduledFor);
          const end = new Date(start.getTime() + found.durationMinutes * 60 * 1000);
          if (now < start) { setError("This exam has not started yet."); return; }
          if (now > end) { setError("This exam has ended."); return; }
          // time remaining
          setTimeLeft(Math.floor((end - now) / 1000));
        } else {
          setTimeLeft(found.durationMinutes * 60);
        }

        setExam(found);
      } catch (e) {
        setError("Failed to load exam.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const submitExam = useCallback(async (reason = "", terminated = false) => {
    if (!exam) return;
    const submissions = exam.questions.map((q) => ({
      problemId: q.problemId?._id || q.problemId,
      code: codeMap[q.problemId?._id || q.problemId] || "",
      language: exam.language,
      status: submittedMap[q.problemId?._id || q.problemId] || "not_attempted",
      score: submittedMap[q.problemId?._id || q.problemId] === "accepted" ? 10 : 0,
    }));

    try {
      await http.post(`/admin/mock-tests/${id}/submit`, {
        submissions,
        warnings: warningsRef.current,
        terminated,
        terminationReason: reason,
      });
    } catch (e) { /* silent */ }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    navigate(`/exams/${id}/result`);
  }, [exam, codeMap, submittedMap, id, navigate]);

  // Timer
  useEffect(() => {
    if (!testStarted || malpracticeReason || needsFullscreen) return;
    if (timeLeft <= 0) { submitExam("Time up"); return; }
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { submitExam("Time up"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [testStarted, malpracticeReason, needsFullscreen, submitExam]);

  // Anti-cheat
  const requestFS = async () => {
    const el = fullscreenRef.current;
    if (!el?.requestFullscreen) return true;
    if (document.fullscreenElement === el) return true;
    try {
      restoringFS.current = true;
      await el.requestFullscreen();
      setNeedsFullscreen(false);
      return true;
    } catch { return false; }
    finally { setTimeout(() => { restoringFS.current = false; }, 300); }
  };

  const terminateMalpractice = async (reason) => {
    setMalpracticeReason(reason);
    setTestStarted(false);
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    await submitExam(reason, true);
  };

  const registerViolation = async (reason) => {
    if (!testStarted || malpracticeReason) return;
    const now = Date.now();
    if (now - lastViolationAt.current < 1200) return;
    lastViolationAt.current = now;
    const count = ++warningsRef.current;
    setWarningCount(Math.min(count, MAX_WARNINGS));
    if (count >= MAX_WARNINGS) {
      setWarningMsg(`Malpractice detected. Terminated. Reason: ${reason}`);
      await terminateMalpractice(reason);
      return;
    }
    setWarningMsg(`Warning ${count}/${MAX_WARNINGS}: ${reason}`);
  };

  useEffect(() => {
    if (!testStarted || malpracticeReason) return;

    const onVisibility = () => { if (document.hidden) void registerViolation("Switched window"); };
    const onBlur = () => void registerViolation("Window lost focus");
    const onFSChange = async () => {
      if (restoringFS.current || document.fullscreenElement || malpracticeReason) return;
      await registerViolation("Exited fullscreen");
      const ok = await requestFS();
      if (!ok) { setNeedsFullscreen(true); setWarningMsg("Return to fullscreen to continue."); }
    };
    const block = (e) => {
      e.preventDefault();
      const map = { contextmenu: "Right-click", copy: "Copy", cut: "Cut", paste: "Paste", drop: "Drop", dragstart: "Drag" };
      void registerViolation(`${map[e.type] || "Protected action"} blocked`);
    };
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "F12" || e.metaKey || (e.ctrlKey && e.key !== "z")) {
        e.preventDefault();
        void registerViolation("Restricted shortcut");
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFSChange);
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("paste", block);
    document.addEventListener("drop", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFSChange);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("drop", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("keydown", onKey);
    };
  }, [testStarted, malpracticeReason]);

  useEffect(() => () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); }, []);

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4 p-6">
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );

  if (error) return (
    <div className="max-w-lg mx-auto mt-16 text-center">
      <div className="card rounded-3xl p-10">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Cannot Open Exam</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{error}</p>
        <button onClick={() => navigate("/exams")} className="btn-secondary px-6 py-2.5 text-sm">Back to Exams</button>
      </div>
    </div>
  );

  const questions = exam.questions || [];
  const currentQ = questions[currentIdx];
  const problem = currentQ?.problemId;
  const problemId = problem?._id || problem;
  const currentCode = codeMap[problemId] || "";

  // Pre-start screen
  if (!testStarted) {
    return (
      <div className="max-w-2xl mx-auto mt-8 animate-slide-up">
        <div className="card rounded-3xl p-10">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="w-4 h-4 text-brand-400" />
            <span className="text-[10px] font-bold text-brand-400 tracking-[0.2em] uppercase">Exam</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{exam.title}</h1>
          {exam.company && <p className="text-sm text-[var(--text-muted)] mb-6">{exam.company}</p>}

          <div className="space-y-3 mb-8">
            {[
              { icon: Clock, label: "Duration", value: `${exam.durationMinutes} minutes` },
              { icon: FileText, label: "Questions", value: `${questions.length} problems` },
              { icon: Lock, label: "Language", value: `${LANG_LABELS[exam.language]} only (locked)` },
              { icon: AlertCircle, label: "Rules", value: "Fullscreen required. 3 warnings = auto-terminate." },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 text-sm"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "12px" }}>
                <Icon className="w-4 h-4 text-[var(--text-muted)] mt-0.5 shrink-0" />
                <div><span className="text-[var(--text-muted)]">{label}: </span><span className="font-semibold text-[var(--text-primary)]">{value}</span></div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate("/exams")} className="btn-secondary flex-1 py-3 text-sm">Back</button>
            <button
              onClick={async () => {
                const ok = await requestFS();
                setTestStarted(true);
                if (!ok) setNeedsFullscreen(true);
              }}
              className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-base)" }} ref={fullscreenRef}>
      {/* Warning Banner */}
      {warningMsg && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-6 py-3"
          style={{ background: "rgba(245,158,11,0.15)", borderBottom: "1px solid rgba(245,158,11,0.3)" }}>
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-sm font-semibold text-amber-300 flex-1">{warningMsg}</p>
          {needsFullscreen && (
            <button onClick={requestFS} className="text-xs font-bold text-amber-300 underline">
              Restore Fullscreen →
            </button>
          )}
          <button onClick={() => setWarningMsg("")}><X className="w-4 h-4 text-amber-400" /></button>
        </div>
      )}

      {/* Confirm submit modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="card rounded-2xl p-8 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Submit Exam?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              You have {formatTime(timeLeft)} remaining. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 py-2.5 text-sm">Continue</button>
              <button onClick={() => { setShowConfirm(false); setSubmitting(true); submitExam(); }}
                disabled={submitting} className="btn-primary flex-1 py-2.5 text-sm">
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Sidebar ─── */}
      <aside className="w-64 flex flex-col shrink-0"
        style={{ background: "var(--bg-shell)", borderRight: "1px solid var(--border-default)" }}>
        {/* Timer */}
        <div className="p-4 flex flex-col items-center gap-1" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <p className="text-[9px] font-bold text-[var(--text-muted)] tracking-widest uppercase">Time Left</p>
          <p className={`text-3xl font-bold font-mono ${timeLeft < 300 ? "text-rose-400" : "text-[var(--text-primary)]"}`}>
            {formatTime(timeLeft)}
          </p>
          <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mt-1`}
            style={{ background: "rgba(47,158,68,0.12)", border: "1px solid rgba(47,158,68,0.25)", color: "var(--brand-400)" }}>
            <Lock className="w-3 h-3" /> {LANG_LABELS[exam.language]}
          </div>
        </div>

        {/* Question list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <p className="text-[9px] font-bold text-[var(--text-muted)] tracking-widest uppercase px-1 mb-2">
            Questions ({questions.length})
          </p>
          {questions.map((q, idx) => {
            const pid = q.problemId?._id || q.problemId;
            const done = submittedMap[pid];
            const isActive = idx === currentIdx;
            return (
              <button key={pid || idx} onClick={() => setCurrentIdx(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? "text-brand-400" : "text-[var(--text-secondary)] hover:bg-white/[0.03]"}`}
                style={{ background: isActive ? "rgba(47,158,68,0.1)" : "transparent", border: isActive ? "1px solid rgba(47,158,68,0.2)" : "1px solid transparent" }}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs w-5 text-center">{idx + 1}</span>
                  <span className="truncate flex-1 font-medium">{q.problemId?.title || `Problem ${idx + 1}`}</span>
                  {done && <Check className="w-3.5 h-3.5 text-brand-400 shrink-0" />}
                </div>
                {q.problemId?.difficulty && (
                  <p className={`text-[10px] mt-0.5 pl-7 ${diffStyle[q.problemId.difficulty]}`}>{q.problemId.difficulty}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Submit */}
        <div className="p-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="text-xs text-[var(--text-muted)] text-center mb-2">
            {Object.keys(submittedMap).length}/{questions.length} submitted
          </div>
          <button onClick={() => setShowConfirm(true)} disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
            <X className="w-4 h-4" /> End Exam
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border-default)", background: "rgba(17,19,24,0.95)" }}>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              {problem?.title || `Problem ${currentIdx + 1}`}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">Q{currentIdx + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
              className="btn-ghost w-8 h-8 flex items-center justify-center disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))} disabled={currentIdx === questions.length - 1}
              className="btn-ghost w-8 h-8 flex items-center justify-center disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Split pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Problem description */}
          <div className="w-[45%] overflow-y-auto p-5" style={{ borderRight: "1px solid var(--border-default)" }}>
            {problem ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  {problem.difficulty && (
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${diffStyle[problem.difficulty]}`}
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {problem.difficulty}
                    </span>
                  )}
                  {problem.problemCode && (
                    <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase">{problem.problemCode}</span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{problem.description}</p>
                {problem.examples?.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Examples</p>
                    <div className="space-y-3">
                      {problem.examples.map((ex, i) => (
                        <div key={i} className="rounded-xl p-3 text-xs font-mono"
                          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                          <p className="text-[var(--text-muted)]">Input: <span className="text-[var(--text-primary)]">{ex.input}</span></p>
                          <p className="text-emerald-400 mt-1">Output: {ex.output}</p>
                          {ex.explanation && <p className="text-[var(--text-muted)] mt-1">Explanation: {ex.explanation}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {problem.constraints?.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Constraints</p>
                    <ul className="space-y-1">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)] font-mono">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Problem data unavailable.</p>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Language lock bar */}
            <div className="flex items-center justify-between px-4 py-2 shrink-0"
              style={{ borderBottom: "1px solid var(--border-default)", background: "var(--bg-shell)" }}>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                <Lock className="w-3.5 h-3.5" />
                {LANG_LABELS[exam.language]} (locked)
              </div>
              {submittedMap[problemId] && (
                <span className="flex items-center gap-1 text-xs font-bold text-brand-400">
                  <Check className="w-3.5 h-3.5" /> Submitted
                </span>
              )}
            </div>

            {/* Monaco */}
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                language={exam.language}
                value={currentCode}
                onChange={(code) => setCodeMap((prev) => ({ ...prev, [problemId]: code }))}
              />
            </div>

            {/* Run output */}
            {runResult && (
              <div className="px-4 py-3 text-xs font-mono max-h-32 overflow-y-auto"
                style={{ borderTop: "1px solid var(--border-default)", background: "var(--bg-input)", color: runResult.stderr ? "#f87171" : "#4ade80" }}>
                <p className="text-[var(--text-muted)] mb-1 font-bold uppercase tracking-widest text-[9px]">Output</p>
                <pre className="whitespace-pre-wrap">{runResult.stderr || runResult.stdout}</pre>
              </div>
            )}

            {/* Action bar */}
            <div className="flex gap-3 px-4 py-3 shrink-0"
              style={{ borderTop: "1px solid var(--border-default)", background: "var(--bg-shell)" }}>
              <button
                onClick={async () => {
                  setRunning(true); setRunResult(null);
                  try {
                    const { data } = await http.post("/run-code", { code: currentCode, language: exam.language, stdin: "" });
                    setRunResult(data);
                  } catch { setRunResult({ stderr: "Run failed." }); }
                  finally { setRunning(false); }
                }}
                disabled={running}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm">
                <Play className="w-4 h-4" />
                {running ? "Running..." : "Run Code"}
              </button>
              <button
                onClick={async () => {
                  setRunning(true);
                  try {
                    const { data } = await http.post("/submit", { code: currentCode, language: exam.language, problemId: problemId });
                    setSubmittedMap((prev) => ({ ...prev, [problemId]: data.status || "attempted" }));
                    setRunResult({ stdout: `Status: ${data.status || "Submitted"}` });
                  } catch { setRunResult({ stderr: "Submission failed." }); }
                  finally { setRunning(false); }
                }}
                disabled={running || !!submittedMap[problemId]}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50">
                <Send className="w-4 h-4" />
                {submittedMap[problemId] ? "Submitted ✓" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamWorkspacePage;
