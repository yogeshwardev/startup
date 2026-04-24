import {
  AlertTriangle,
  Clock3,
  Play,
  Send,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import http from "../../api/http";
import CodeEditor from "../../components/CodeEditor";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
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

  const warningsRef = useRef(0);
  const lastViolationAtRef = useRef(0);
  const restoringFullscreenRef = useRef(false);
  const fullscreenTargetRef = useRef(null);

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
  const [practiceStarted, setPracticeStarted] = useState(Boolean(contestId));
  const [practiceSessionId, setPracticeSessionId] = useState("");
  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [malpracticeReason, setMalpracticeReason] = useState("");
  const [needsFullscreenRestore, setNeedsFullscreenRestore] = useState(false);

  useEffect(() => {
    warningsRef.current = warningCount;
  }, [warningCount]);

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
        setCodeMap({
          python: data.starterCode?.python || "",
          cpp: data.starterCode?.cpp || "",
          java: data.starterCode?.java || "",
        });
        setStdin(data.visibleTestCases?.[0]?.input || "");
        setSubmissions(data.submissions || []);
        setPracticeSessionId("");
        setWarningCount(0);
        warningsRef.current = 0;
        setWarningMessage("");
        setMalpracticeReason("");
        setNeedsFullscreenRestore(false);
        setPracticeStarted(Boolean(contestId));

        if (!contestId && sessionResponse?.data) {
          const restoredSession = sessionResponse.data;

          setPracticeSessionId(restoredSession.sessionId || "");
          setWarningCount(restoredSession.warningCount || 0);
          warningsRef.current = restoredSession.warningCount || 0;

          if (restoredSession.malpractice) {
            setMalpracticeReason(
              restoredSession.terminationReason ||
                "This session was terminated for malpractice."
            );
            setPracticeStarted(false);
          } else if (restoredSession.status === "ACTIVE") {
            setPracticeStarted(true);
            setNeedsFullscreenRestore(true);
            setWarningMessage(
              `Protected session restored with ${restoredSession.warningCount || 0}/${MAX_WARNINGS} warnings. Restore fullscreen to continue.`
            );
          }
        }
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

  useEffect(() => {
    if (!isPracticeMode) {
      return undefined;
    }

    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isPracticeMode]);

  const requestSecureFullscreen = async () => {
    const fullscreenTarget = fullscreenTargetRef.current;

    if (!fullscreenTarget?.requestFullscreen) {
      return true;
    }

    if (document.fullscreenElement === fullscreenTarget) {
      return true;
    }

    try {
      restoringFullscreenRef.current = true;
      await fullscreenTarget.requestFullscreen();
      setNeedsFullscreenRestore(false);
      return true;
    } catch (_error) {
      return false;
    } finally {
      window.setTimeout(() => {
        restoringFullscreenRef.current = false;
      }, 300);
    }
  };

  const terminateForMalpractice = async (reason) => {
    setMalpracticeReason(reason);
    setPracticeStarted(false);
    setNeedsFullscreenRestore(false);
    setSubmitResult({
      error: `Test terminated for malpractice: ${reason}`,
    });

    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen().catch(() => {});
    }
  };

  const registerViolation = async (reason, eventType) => {
    if (!isPracticeMode || !practiceStarted || malpracticeReason || !practiceSessionId) {
      return;
    }

    const now = Date.now();
    if (now - lastViolationAtRef.current < 1200) {
      return;
    }
    lastViolationAtRef.current = now;

    try {
      const { data } = await http.post(
        `/practice-sessions/${practiceSessionId}/violation`,
        {
          reason,
          eventType,
        }
      );

      setWarningCount(Math.min(data.warningCount, MAX_WARNINGS));

      if (data.malpractice || data.status === "TERMINATED") {
        setWarningMessage(
          `Malpractice detected. Test terminated. Reason: ${data.terminationReason}`
        );
        await terminateForMalpractice(
          data.terminationReason || reason
        );
        return;
      }

      setWarningMessage(
        `Warning ${data.warningCount}/${MAX_WARNINGS}: ${reason}`
      );
    } catch (_error) {
      setWarningMessage("Unable to record the violation on the server.");
    }
  };

  useEffect(() => {
    if (!isPracticeMode || !practiceStarted || malpracticeReason) {
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        void registerViolation(
          "You switched away from the active test window.",
          "visibility_change"
        );
      }
    };

    const handleBlur = () => {
      void registerViolation(
        "The test window lost focus.",
        "window_blur"
      );
    };

    const handleFullscreenChange = async () => {
      if (
        restoringFullscreenRef.current ||
        document.fullscreenElement ||
        malpracticeReason
      ) {
        return;
      }

      await registerViolation(
        "You exited fullscreen mode.",
        "fullscreen_exit"
      );

      const restored = await requestSecureFullscreen();
      if (!restored && !malpracticeReason) {
        setNeedsFullscreenRestore(true);
        setWarningMessage(
          "Fullscreen was exited. Return to fullscreen to continue."
        );
      }
    };

    const blockProtectedAction = (event) => {
      event.preventDefault();
      const reasonMap = {
        contextmenu: "Right click is not allowed during the test.",
        copy: "Copy is not allowed during the test.",
        cut: "Cut is not allowed during the test.",
        paste: "Paste is not allowed during the test.",
        drop: "Drop is not allowed during the test.",
        dragstart: "Dragging content is not allowed during the test.",
      };
      void registerViolation(
        reasonMap[event.type] || "A protected action was blocked.",
        event.type
      );
    };

    const handleKeyDown = (event) => {
      const blockedShortcut =
        event.key === "Control" ||
        event.key === "Meta" ||
        event.key === "Alt" ||
        event.key === "Tab" ||
        event.key === "F12" ||
        event.ctrlKey ||
        event.metaKey;

      if (!blockedShortcut) {
        return;
      }

      event.preventDefault();
      void registerViolation(
        "Restricted keyboard shortcut usage is not allowed during the test.",
        "blocked_shortcut"
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", blockProtectedAction);
    document.addEventListener("copy", blockProtectedAction);
    document.addEventListener("cut", blockProtectedAction);
    document.addEventListener("paste", blockProtectedAction);
    document.addEventListener("drop", blockProtectedAction);
    document.addEventListener("dragstart", blockProtectedAction);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", blockProtectedAction);
      document.removeEventListener("copy", blockProtectedAction);
      document.removeEventListener("cut", blockProtectedAction);
      document.removeEventListener("paste", blockProtectedAction);
      document.removeEventListener("drop", blockProtectedAction);
      document.removeEventListener("dragstart", blockProtectedAction);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isPracticeMode,
    malpracticeReason,
    practiceSessionId,
    practiceStarted,
  ]);

  const currentCode = codeMap[language] || "";
  const alreadySubmitted = submissions.length > 0;
  const workspaceLocked =
    (isPracticeMode && (!practiceStarted || needsFullscreenRestore)) ||
    Boolean(malpracticeReason) ||
    alreadySubmitted;

  const handleCodeChange = (nextCode) => {
    setCodeMap((current) => ({ ...current, [language]: nextCode }));
  };

  const startProtectedPractice = async () => {
    if (!problem) {
      return;
    }

    const fullscreenEnabled = await requestSecureFullscreen();

    if (!fullscreenEnabled) {
      setWarningMessage(
        "Fullscreen permission is required to start this protected practice session."
      );
      return;
    }

    try {
      const { data } = await http.post("/practice-sessions/start", {
        problemId: problem._id,
      });

      setPracticeSessionId(data.sessionId);
      setWarningCount(0);
      warningsRef.current = 0;
      setWarningMessage("Protected practice mode is active.");
      setPracticeStarted(true);
      setNeedsFullscreenRestore(false);
    } catch (requestError) {
      setWarningMessage(
        requestError.response?.data?.message ||
          "Unable to start protected practice mode."
      );
    }
  };

  const restoreFullscreen = async () => {
    const restored = await requestSecureFullscreen();

    if (restored) {
      setNeedsFullscreenRestore(false);
      setWarningMessage("Fullscreen restored. Continue your test.");
    } else {
      setWarningMessage(
        "Browser blocked automatic fullscreen. Use the button again to continue."
      );
    }
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
      setActiveTab("Testcases");
    } catch (requestError) {
      setRunResult({
        stderr: requestError.response?.data?.message || "Code run failed.",
      });
      setActiveTab("Testcases");
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
        practiceSessionId: isPracticeMode ? practiceSessionId : undefined,
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
        <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300">
          <p className="whitespace-pre-line">{problem.description}</p>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Tags
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {problem.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Visible test cases
            </h3>
            <div className="mt-3 space-y-3">
              {problem.visibleTestCases.map((testCase, index) => (
                <div key={index} className="app-muted rounded-[1.5rem] p-4">
                  <pre className="whitespace-pre-wrap">
                    Input: {testCase.input}
                  </pre>
                  <pre className="mt-2 whitespace-pre-wrap">
                    Output: {testCase.expectedOutput}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "Testcases") {
      return (
        <div className="space-y-4">
          <textarea
            className="min-h-32 w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            placeholder="Custom input"
            disabled={workspaceLocked}
          />
          <div className="app-muted rounded-[1.5rem] p-4 text-sm">
            <p className="font-semibold text-slate-900 dark:text-white">
              Output console
            </p>
            <pre className="mt-3 whitespace-pre-wrap text-slate-600 dark:text-slate-300">
              {formatOutput(runResult)}
            </pre>
          </div>
        </div>
      );
    }

    return submissions.length ? (
      <div className="space-y-3">
        {submissions.map((submission) => (
          <div
            key={submission._id}
            className="app-muted rounded-[1.5rem] p-4 text-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-900 dark:text-white">
                {submission.status}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {submission.language.toUpperCase()}
              </span>
            </div>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {new Date(submission.createdAt).toLocaleString()}
            </p>
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

  if (isPracticeMode && malpracticeReason) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Protected practice"
          title={problem.title}
          description="This practice session was terminated for malpractice."
        />

        <SectionCard title="Session terminated">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] bg-rose-500/10 p-5 text-sm text-rose-200">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5" />
                <p className="font-semibold">
                  Malpractice detected. The test has been terminated.
                </p>
              </div>
              <p className="mt-3">Reason: {malpracticeReason}</p>
              <p className="mt-2">
                Warnings exceeded. This session is stored on the server.
              </p>
            </div>
            <Link
              to="/problems"
              className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              Back to problems
            </Link>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={fullscreenTargetRef}>
      <PageHeader
        eyebrow="Code arena"
        title={problem.title}
        description={`Problem ID ${problem.problemCode} • ${problem.difficulty} • ${problem.tags.join(", ")}`}
      />

      {contest ? (
        <SectionCard
          title="Contest mode"
          action={
            <Link
              to={`/contest/${contest._id}`}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              Back to contest
            </Link>
          }
        >
          <div className="app-muted rounded-[1.5rem] p-4 text-sm">
            <p className="font-semibold text-slate-900 dark:text-white">
              {contest.title}
            </p>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Your submissions from this page will count toward the contest
              leaderboard while the contest is live.
            </p>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Protected practice mode">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="app-muted rounded-[1.5rem] p-4 text-sm">
              <p className="font-semibold text-slate-900 dark:text-white">
                Active rules
              </p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Fullscreen is mandatory, this window must stay active, and
                copy, paste, cut, drag, drop, right click, and restricted
                shortcuts such as Ctrl, Alt, Meta, Tab, and F12 are blocked.
              </p>
            </div>
            <div className="app-muted rounded-[1.5rem] p-4 text-sm">
              <p className="font-semibold text-slate-900 dark:text-white">
                Server tracked warnings
              </p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                {warningCount}/{MAX_WARNINGS} warnings used. The 4th violation
                terminates the session as malpractice.
              </p>
              {warningMessage ? (
                <p className="mt-3 text-amber-300">{warningMessage}</p>
              ) : null}
              {alreadySubmitted ? (
                <p className="mt-3 text-emerald-300">
                  You have already submitted this problem. Practice is now locked.
                </p>
              ) : null}
            </div>
          </div>
        </SectionCard>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          title="Problem"
          action={
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                    activeTab === tab
                      ? "bg-brand-500 text-white"
                      : "app-muted text-slate-700 dark:text-slate-200"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          }
        >
          {tabContent}
        </SectionCard>

        <SectionCard
          title="Monaco editor"
          action={
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-white/5 dark:text-slate-300">
                <Clock3 className="h-4 w-4" />
                {problem.difficulty}
              </div>
              <select
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                disabled={workspaceLocked}
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
          }
        >
          <CodeEditor
            language={language}
            value={currentCode}
            onChange={handleCodeChange}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
              onClick={handleRun}
              disabled={running || workspaceLocked}
            >
              <Play className="h-4 w-4" />
              {running ? "Running..." : "Run Code"}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70 dark:bg-white dark:text-slate-900"
              onClick={handleSubmit}
              disabled={submitting || workspaceLocked}
            >
              <Send className="h-4 w-4" />
              {alreadySubmitted ? "Solved" : submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
          {submitResult?.submissionId ? (
            <div className="mt-4 rounded-[1.5rem] bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-200">
              Submission queued: {submitResult.submissionId}
            </div>
          ) : null}
          {submitResult?.error ? (
            <div className="mt-4 rounded-[1.5rem] bg-rose-500/10 p-4 text-sm text-rose-300">
              {submitResult.error}
            </div>
          ) : null}
        </SectionCard>
      </div>

      <Modal
        open={
          isPracticeMode &&
          !practiceStarted &&
          !malpracticeReason &&
          !alreadySubmitted
        }
        title="Protected Practice Instructions"
        onClose={() => {}}
        footer={
          <>
            <Link
              to="/problems"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-white/10"
            >
              Back to problems
            </Link>
            <button
              type="button"
              className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
              onClick={startProtectedPractice}
            >
              Start protected test
            </button>
          </>
        }
      >
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="rounded-[1.5rem] bg-amber-500/10 p-4 text-amber-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-semibold">
                These rules apply only to the normal problems section, not contests.
              </p>
            </div>
          </div>
          <p>1. Fullscreen is required for the entire session.</p>
          <p>2. Pressing Esc to leave fullscreen triggers a warning and the app will try to restore fullscreen immediately.</p>
          <p>3. If the browser blocks automatic fullscreen restore, the test is locked until fullscreen is restored.</p>
          <p>4. The test window must remain active. Switching tab, window, or desktop counts as a violation.</p>
          <p>5. Right click, copy, cut, paste, drag, drop, Ctrl, Alt, Meta, Tab, F12, and shortcut combos are blocked and reported.</p>
          <p>6. Reloading the page does not reset warnings because the active practice session is restored from the backend.</p>
          <p>7. Warnings and malpractice are stored on the backend session, not only in frontend state.</p>
        </div>
      </Modal>

      <Modal
        open={isPracticeMode && needsFullscreenRestore && !malpracticeReason}
        title="Return To Fullscreen"
        onClose={() => {}}
        footer={
          <button
            type="button"
            className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
            onClick={restoreFullscreen}
          >
            Restore fullscreen
          </button>
        }
      >
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="rounded-[1.5rem] bg-amber-500/10 p-4 text-amber-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-semibold">
                Fullscreen was exited. A warning has been recorded on the backend.
              </p>
            </div>
          </div>
          <p>
            Browsers usually do not allow sites to force fullscreen again after
            `Esc` without a fresh user action. Use the button below to continue.
          </p>
          {warningMessage ? (
            <p className="text-amber-300">{warningMessage}</p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

export default ProblemWorkspacePage;
