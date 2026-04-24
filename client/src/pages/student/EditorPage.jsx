import { useEffect, useState } from "react";
import http from "../../api/http";
import CodeEditor from "../../components/CodeEditor";
import SectionCard from "../../components/SectionCard";

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
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Problem Brief">
        {problemsError ? <p className="text-sm text-red-300">{problemsError}</p> : null}
        {!problemsError && problems.length === 0 ? (
          <p className="text-sm text-slate-300">
            No coding problems are available yet. Add one from the admin panel to enable guided runs and submissions.
          </p>
        ) : null}
        {selectedProblem ? (
          <div className="space-y-4">
            <select
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
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
              <p className="text-sm text-slate-400">{selectedProblem.difficulty}</p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-200">{selectedProblem.description}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Sample Input</p>
              <pre className="mt-2 whitespace-pre-wrap">{selectedProblem.sampleTestCases?.[0]?.input}</pre>
              <p className="mt-4 font-semibold text-white">Sample Output</p>
              <pre className="mt-2 whitespace-pre-wrap">{selectedProblem.sampleTestCases?.[0]?.expectedOutput}</pre>
            </div>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              placeholder="Custom stdin for dry runs"
              value={stdin}
              onChange={(event) => setStdin(event.target.value)}
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Monaco Arena"
        action={
          <select
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="python">Python</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        }
      >
        <CodeEditor language={language} value={code} onChange={setCode} />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-brand-500 px-5 py-3 font-semibold disabled:opacity-70"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Run Code"}
          </button>
          <button
            type="button"
            className="rounded-full bg-accent px-5 py-3 font-semibold disabled:opacity-70"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedProblemId}
          >
            {isSubmitting ? "Submitting..." : "Submit Solution"}
          </button>
        </div>
        {actionError ? <p className="mt-4 text-sm text-red-300">{actionError}</p> : null}
        {result ? (
          <div className="mt-4 rounded-2xl bg-black/30 p-4 text-sm">
            <p className="font-semibold text-white">Run Result</p>
            <pre className="mt-2 whitespace-pre-wrap text-slate-200">{result.stdout || result.stderr || "No output"}</pre>
          </div>
        ) : null}
        {queueResult ? (
          <div className="mt-4 rounded-2xl bg-black/30 p-4 text-sm">
            <p className="font-semibold text-white">Submission queued</p>
            <p className="mt-2 text-slate-300">Submission ID: {queueResult.submissionId}</p>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
};

export default EditorPage;
