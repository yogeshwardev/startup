import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Download, Eye, EyeOff, Users, Trophy, AlertCircle,
  CheckCircle2, XCircle, Code2, ChevronLeft, FileText
} from "lucide-react";
import http from "../../api/http";
import Skeleton from "../../components/Skeleton";

const LANG_LABELS = { python: "Python", cpp: "C++", java: "Java", javascript: "JavaScript", c: "C" };

const statusColor = {
  accepted: "text-brand-400",
  wrong_answer: "text-rose-400",
  error: "text-rose-400",
  attempted: "text-amber-400",
  not_attempted: "text-[var(--text-muted)]",
};

// ─── Export Helpers ───────────────────────────────────────────────
const exportCSV = (exam, submissions) => {
  const questions = exam.questions || [];
  const headers = [
    "Rank", "Name", "Registration", "Email", "Department", "Year",
    ...questions.map((q, i) => `Q${i + 1} (${q.problemId?.title || "Problem"})`),
    "Total Score", "Warnings", "Terminated"
  ];

  const rows = submissions.map((sub, idx) => {
    const student = sub.studentId || {};
    const qScores = questions.map((q) => {
      const pid = q.problemId?._id || q.problemId;
      const s = (sub.submissions || []).find((s) => s.problemId === pid || s.problemId?.toString() === pid?.toString());
      return s ? `${s.status} (${s.score || 0}pts)` : "not_attempted";
    });
    return [
      idx + 1,
      student.name || "",
      student.registrationNumber || "",
      student.email || "",
      student.department || "",
      student.year || "",
      ...qScores,
      sub.totalScore || 0,
      sub.warnings || 0,
      sub.terminated ? "Yes" : "No",
    ];
  });

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${exam.title.replace(/\s+/g, "_")}_results.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportPDF = (exam, submissions) => {
  const questions = exam.questions || [];
  const rows = submissions.map((sub, idx) => {
    const student = sub.studentId || {};
    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${student.name || ""}</td>
        <td>${student.registrationNumber || ""}</td>
        <td>${student.department || ""}</td>
        <td>${sub.totalScore || 0}</td>
        <td>${sub.warnings || 0}</td>
        <td>${sub.terminated ? "Yes" : "No"}</td>
      </tr>
    `;
  }).join("");

  const qHeaders = questions.map((q, i) => `<th>Q${i + 1}</th>`).join("");
  const html = `<!DOCTYPE html><html><head><title>${exam.title} Results</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12px; color: #111; }
      h1 { font-size: 18px; } h2 { font-size: 14px; color: #555; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
      th { background: #f0f0f0; font-weight: bold; }
      tr:nth-child(even) { background: #f9f9f9; }
    </style></head><body>
    <h1>${exam.title} — Exam Results</h1>
    <h2>Language: ${LANG_LABELS[exam.language] || exam.language} | Duration: ${exam.durationMinutes} min | Students: ${submissions.length}</h2>
    <table><thead><tr>
      <th>Rank</th><th>Name</th><th>Registration</th><th>Department</th>
      <th>Score</th><th>Warnings</th><th>Terminated</th>
    </tr></thead><tbody>${rows}</tbody></table>
    </body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  setTimeout(() => { w.print(); }, 500);
};

// ─── Code Viewer Modal ────────────────────────────────────────────
const CodeModal = ({ studentName, problem, code, language, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
    <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl overflow-hidden"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
      <div className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">{studentName}</p>
          <p className="text-xs text-[var(--text-muted)]">{problem} · {LANG_LABELS[language] || language}</p>
        </div>
        <button onClick={onClose} className="btn-ghost w-8 h-8 flex items-center justify-center text-[var(--text-muted)]">✕</button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <pre className="text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
          {code || "No code submitted."}
        </pre>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────
const ExamAnalyticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeModal, setCodeModal] = useState(null); // { studentName, problem, code, language }
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    http.get(`/admin/mock-tests/${id}/submissions`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto space-y-4">
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );

  if (!data?.exam) return (
    <div className="text-center mt-16">
      <p className="text-[var(--text-muted)]">Exam not found.</p>
      <button onClick={() => navigate(-1)} className="btn-secondary mt-4 px-6 py-2.5 text-sm">Back</button>
    </div>
  );

  const { exam, submissions } = data;
  const questions = exam.questions || [];
  const avg = submissions.length ? Math.round(submissions.reduce((s, x) => s + (x.totalScore || 0), 0) / submissions.length) : 0;
  const highest = submissions[0]?.totalScore || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {codeModal && <CodeModal {...codeModal} onClose={() => setCodeModal(null)} />}

      {/* Header */}
      <div className="animate-slide-up">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-4 hover:text-[var(--text-primary)] transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-brand-400" />
              <span className="text-[10px] font-bold text-brand-400 tracking-[0.2em] uppercase">Exam Analytics</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{exam.title}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {LANG_LABELS[exam.language]} · {exam.durationMinutes} min · {questions.length} problems
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => exportCSV(exam, submissions)}
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 text-sm">
              <Download className="w-4 h-4" /> Excel / CSV
            </button>
            <button onClick={() => exportPDF(exam, submissions)}
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 text-sm">
              <Download className="w-4 h-4" /> PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        {[
          { icon: Users, label: "Students", value: submissions.length, color: "#818cf8" },
          { icon: Trophy, label: "Highest Score", value: highest, color: "#f59e0b" },
          { icon: CheckCircle2, label: "Avg Score", value: avg, color: "#10b981" },
          { icon: AlertCircle, label: "Terminated", value: submissions.filter((s) => s.terminated).length, color: "#f87171" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <p className="text-xs text-[var(--text-muted)]">{label}</p>
            </div>
            <p className="text-2xl font-black text-[var(--text-primary)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: "120ms" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <p className="text-sm font-bold text-[var(--text-primary)]">Student Results</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Click a row to view per-problem details and code</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <th className="text-left px-4 py-3 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">#</th>
                <th className="text-left px-4 py-3 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Name</th>
                <th className="text-left px-4 py-3 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Reg No.</th>
                <th className="text-left px-4 py-3 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Dept</th>
                {questions.map((q, i) => (
                  <th key={i} className="text-center px-3 py-3 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">
                    Q{i + 1}
                  </th>
                ))}
                <th className="text-center px-4 py-3 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Score</th>
                <th className="text-center px-4 py-3 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Warn</th>
                <th className="text-center px-4 py-3 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={6 + questions.length + 2} className="text-center py-12 text-[var(--text-muted)] text-sm">
                    No submissions yet.
                  </td>
                </tr>
              )}
              {submissions.map((sub, idx) => {
                const student = sub.studentId || {};
                const isExpanded = expandedRow === sub._id;
                return (
                  <>
                    <tr key={sub._id}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      onClick={() => setExpandedRow(isExpanded ? null : sub._id)}>
                      <td className="px-4 py-3 text-xs font-bold text-[var(--text-muted)]">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap">{student.name || "—"}</td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)] font-mono">{student.registrationNumber || "—"}</td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{student.department || "—"}</td>
                      {questions.map((q, qi) => {
                        const pid = q.problemId?._id || q.problemId;
                        const s = (sub.submissions || []).find((s) => s.problemId === pid || s.problemId?.toString() === pid?.toString());
                        const status = s?.status || "not_attempted";
                        return (
                          <td key={qi} className="px-3 py-3 text-center">
                            {status === "accepted" ? <CheckCircle2 className="w-4 h-4 text-brand-400 mx-auto" />
                              : status === "not_attempted" ? <span className="text-xs text-[var(--text-muted)]">—</span>
                              : <XCircle className="w-4 h-4 text-rose-400 mx-auto" />}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-bold text-[var(--text-primary)]">{sub.totalScore || 0}</td>
                      <td className="px-4 py-3 text-center">
                        {sub.warnings > 0
                          ? <span className="text-xs font-bold text-amber-400">{sub.warnings}</span>
                          : <span className="text-xs text-[var(--text-muted)]">0</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isExpanded ? <EyeOff className="w-4 h-4 mx-auto text-[var(--text-muted)]" /> : <Eye className="w-4 h-4 mx-auto text-[var(--text-muted)]" />}
                      </td>
                    </tr>
                    {/* Expanded row */}
                    {isExpanded && (
                      <tr key={`${sub._id}-expanded`} style={{ background: "rgba(255,255,255,0.015)" }}>
                        <td colSpan={6 + questions.length + 2} className="px-6 py-4">
                          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Per-Problem Submissions</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {questions.map((q, qi) => {
                              const pid = q.problemId?._id || q.problemId;
                              const s = (sub.submissions || []).find((s) => s.problemId === pid || s.problemId?.toString() === pid?.toString());
                              return (
                                <div key={qi} className="rounded-xl p-3 flex items-center justify-between gap-2"
                                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                                      Q{qi + 1}: {q.problemId?.title || "Problem"}
                                    </p>
                                    <p className={`text-[10px] mt-0.5 ${statusColor[s?.status || "not_attempted"]}`}>
                                      {s?.status?.replace("_", " ") || "Not Attempted"}
                                      {s?.score > 0 ? ` · ${s.score}pts` : ""}
                                    </p>
                                  </div>
                                  {s?.code && (
                                    <button
                                      onClick={() => setCodeModal({
                                        studentName: student.name,
                                        problem: q.problemId?.title || "Problem",
                                        code: s.code,
                                        language: s.language || exam.language,
                                      })}
                                      className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand-400 hover:bg-brand-500/10 shrink-0">
                                      <Code2 className="w-3.5 h-3.5" /> View Code
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {sub.terminated && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-rose-400">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Terminated: {sub.terminationReason}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExamAnalyticsPage;
