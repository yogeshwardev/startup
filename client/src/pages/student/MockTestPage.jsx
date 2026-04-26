import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Clock, AlertCircle, X, ChevronLeft, ChevronRight, Send, Copy, Check } from "lucide-react";
import CodeEditor from "../../components/CodeEditor";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import Skeleton from "../../components/Skeleton";

// Sample mock test questions
const MOCK_TEST_QUESTIONS = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Array",
    description:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
  },
  {
    id: 2,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "String",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      { input: 's = "abcabcbb"', output: "3" },
      { input: 's = "bbbbb"', output: "1" },
    ],
  },
  {
    id: 3,
    title: "Container With Most Water",
    difficulty: "Medium",
    topic: "Array",
    description:
      "You are given an integer array height where height[i] represents the height of the bar. Find two lines that together with the x-axis form a container, such that the container contains the most water.",
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" },
      { input: "height = [1,1]", output: "1" },
    ],
  },
  {
    id: 4,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topic: "Array",
    description:
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
    ],
  },
];

const LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "JavaScript", value: "javascript" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
];

const TABS = ["Description", "Submissions"];
const MAX_WARNINGS = 3;

const MockTestPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [submissions, setSubmissions] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [codeMap, setCodeMap] = useState({});
  const [customInput, setCustomInput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [language, setLanguage] = useState("python");
  const [activeTab, setActiveTab] = useState("Description");
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Protection states
  const warningsRef = useRef(0);
  const lastViolationAtRef = useRef(0);
  const restoringFullscreenRef = useRef(false);
  const fullscreenTargetRef = useRef(null);
  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [malpracticeReason, setMalpracticeReason] = useState("");
  const [needsFullscreenRestore, setNeedsFullscreenRestore] = useState(false);

  const currentQuestion = MOCK_TEST_QUESTIONS[currentQuestionIdx];
  const currentCode = codeMap[currentQuestion.id]?.[language] || "";

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const requestSecureFullscreen = async () => {
    const fullscreenTarget = fullscreenTargetRef.current;
    if (!fullscreenTarget?.requestFullscreen) return true;
    if (document.fullscreenElement === fullscreenTarget) return true;

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
    setTestStarted(false);
    setNeedsFullscreenRestore(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen().catch(() => {});
    }
  };

  const registerViolation = async (reason, eventType) => {
    if (!testStarted || malpracticeReason) return;
    const now = Date.now();
    if (now - lastViolationAtRef.current < 1200) return;
    lastViolationAtRef.current = now;

    const newWarningCount = warningsRef.current + 1;
    setWarningCount(Math.min(newWarningCount, MAX_WARNINGS));
    warningsRef.current = newWarningCount;

    if (newWarningCount >= MAX_WARNINGS) {
      setWarningMessage(`Malpractice detected. Test terminated. Reason: ${reason}`);
      await terminateForMalpractice(reason);
      return;
    }
    setWarningMessage(`Warning ${newWarningCount}/${MAX_WARNINGS}: ${reason}`);
  };

  // Protection event listeners
  useEffect(() => {
    if (!testStarted || malpracticeReason) {
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
      void registerViolation("The test window lost focus.", "window_blur");
    };

    const handleFullscreenChange = async () => {
      if (
        restoringFullscreenRef.current ||
        document.fullscreenElement ||
        malpracticeReason
      ) {
        return;
      }

      await registerViolation("You exited fullscreen mode.", "fullscreen_exit");

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
        event.key === "Escape" ||
        event.key === "Control" ||
        event.key === "Meta" ||
        event.key === "Alt" ||
        event.key === "Tab" ||
        event.key === "F12" ||
        (event.ctrlKey && event.key !== "z") ||
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
  }, [testStarted, malpracticeReason]);

  // Timer countdown
  useEffect(() => {
    if (!testStarted || needsFullscreenRestore) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, needsFullscreenRestore]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleCodeChange = (code) => {
    setCodeMap((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        [language]: code,
      },
    }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRun = async () => {
    setRunning(true);
    setTimeout(() => {
      setRunResult({
        stdout: `Test Case Output:\n${customInput ? `Input: ${customInput}` : "Running with default input..."}\nOutput: Correct!`,
        stderr: null,
      });
      setRunning(false);
    }, 1000);
  };

  const handleSubmitQuestion = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmissions((prev) => ({
        ...prev,
        [currentQuestion.id]: true,
      }));
      setSubmitting(false);
    }, 500);
  };

  const handleExitTest = () => {
    setShowConfirmExit(true);
  };

  const handleSubmitTest = () => {
    setTestStarted(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    navigate("/placement/mock-result", {
      state: {
        score: Math.floor(Object.keys(submissions).length / MOCK_TEST_QUESTIONS.length * 100),
        totalQuestions: MOCK_TEST_QUESTIONS.length,
        solved: Object.keys(submissions).length,
        timeLeft: timeLeft,
        warningCount: warningCount,
      },
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < MOCK_TEST_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  if (!testStarted) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Mock Test"
          title="Placement Readiness Assessment"
          description="Complete practice test to evaluate your placement preparation level"
        />

        <SectionCard title="Test Details">
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Test Information</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-brand-600">•</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    <strong>Questions:</strong> {MOCK_TEST_QUESTIONS.length}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600">•</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    <strong>Duration:</strong> 90 minutes
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600">•</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    <strong>Difficulty:</strong> Mixed (Easy, Medium, Hard)
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Requirements</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-400">
                    90-minute timer cannot be paused or extended
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Code in multiple programming languages: Python, JavaScript, Java, C++
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setTestStarted(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              <Play className="w-5 h-5" />
              Start Mock Test
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Back to Placement
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (malpracticeReason) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          eyebrow="Mock Test"
          title="Test Terminated"
          description="Your test session has been terminated"
        />

        <SectionCard title="Malpractice Detection">
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Test Terminated</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                  Reason: {malpracticeReason}
                </p>
                {warningCount > 0 && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Violations detected: {warningCount}/{MAX_WARNINGS}
                  </p>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/placement")}
            className="flex-1 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Return to Placement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950" ref={fullscreenTargetRef}>
      {/* Warning Banner */}
      {warningMessage && (
        <div className="fixed top-0 left-0 right-0 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/30 px-6 py-3 flex items-start gap-3 z-40">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">{warningMessage}</p>
            {needsFullscreenRestore && (
              <button
                onClick={requestSecureFullscreen}
                className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
              >
                Restore Fullscreen →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirm Exit Modal */}
      {showConfirmExit && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Submit Test?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to submit? You have {formatTime(timeLeft)} remaining.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmExit(false)}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Continue
              </button>
              <button
                onClick={handleSubmitTest}
                className="flex-1 px-4 py-2 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Questions List */}
      <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 overflow-y-auto hidden lg:flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
            Questions ({currentQuestionIdx + 1}/{MOCK_TEST_QUESTIONS.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {MOCK_TEST_QUESTIONS.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIdx(idx)}
              className={`w-full text-left px-3 py-3 rounded-lg transition text-sm font-medium ${
                idx === currentQuestionIdx
                  ? "bg-brand-600 dark:bg-brand-500 text-white shadow-md"
                  : submissions[q.id]
                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/50"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">Q{idx + 1}</div>
                  <div className="text-xs opacity-75 line-clamp-2">{q.title}</div>
                </div>
                {submissions[q.id] && <Check className="w-4 h-4 flex-shrink-0 mt-1" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
              {currentQuestion.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Question {currentQuestionIdx + 1} of {MOCK_TEST_QUESTIONS.length}
            </p>
          </div>

          <div className="flex items-center gap-4 ml-6">
            <div className="text-right flex-shrink-0">
              <div className={`text-2xl font-bold font-mono ${
                timeLeft < 600 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
              }`}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Time Left</p>
            </div>

            <button
              onClick={handleExitTest}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white font-semibold rounded-lg transition whitespace-nowrap flex-shrink-0"
            >
              <X className="w-4 h-4" />
              Submit
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Description Panel */}
          <div className="w-1/2 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            <div className="p-6">
              <div className="flex gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  currentQuestion.difficulty === "Easy"
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : currentQuestion.difficulty === "Medium"
                    ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                    : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300"
                }`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {currentQuestion.topic}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentQuestion.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Examples</h3>
                <div className="space-y-3">
                  {currentQuestion.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                    >
                      <p className="text-sm font-mono text-slate-600 dark:text-slate-400 mb-2">
                        Input: {ex.input}
                      </p>
                      <p className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
                        Output: {ex.output}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIdx === 0}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIdx === MOCK_TEST_QUESTIONS.length - 1}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Code Editor Panel */}
          <div className="w-1/2 flex flex-col">
            {/* Language and Copy */}
            <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between">
              <div className="flex gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                      language === lang.value
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Code Editor */}
            <div className="flex-1 overflow-hidden border-b border-slate-200 dark:border-slate-700">
              <CodeEditor
                language={language}
                value={currentCode}
                onChange={handleCodeChange}
              />
            </div>

            {/* Custom Input */}
            <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
              <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Custom Input
              </label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter test input here..."
                className="w-full h-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Output */}
            <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-900 text-slate-300 px-4 py-3 font-mono text-sm overflow-y-auto flex-1">
              <div className="text-xs font-semibold text-slate-400 mb-2">OUTPUT</div>
              {runResult ? (
                <pre className="whitespace-pre-wrap break-words">{runResult.stderr || runResult.stdout}</pre>
              ) : (
                <p className="text-slate-500">Run code to see output...</p>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex gap-3">
              <button
                onClick={handleRun}
                disabled={running}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold rounded-lg disabled:opacity-50 transition"
              >
                <Play className="w-4 h-4" />
                {running ? "Running..." : "Run Code"}
              </button>
              <button
                onClick={handleSubmitQuestion}
                disabled={submitting || submissions[currentQuestion.id]}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold rounded-lg disabled:opacity-50 transition"
              >
                <Send className="w-4 h-4" />
                {submissions[currentQuestion.id] ? "Submitted ✓" : submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestPage;
