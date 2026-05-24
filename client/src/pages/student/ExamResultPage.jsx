import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, ClipboardList, AlertCircle, ChevronRight } from "lucide-react";
import http from "../../api/http";
import Skeleton from "../../components/Skeleton";

const LANG_LABELS = { python: "Python", cpp: "C++", java: "Java", javascript: "JavaScript", c: "C" };

const statusConfig = {
  accepted: { color: "text-brand-400", bg: "rgba(47,158,68,0.12)", border: "rgba(47,158,68,0.25)", icon: CheckCircle2, label: "Accepted" },
  wrong_answer: { color: "text-rose-400", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", icon: XCircle, label: "Wrong Answer" },
  error: { color: "text-rose-400", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", icon: AlertCircle, label: "Error" },
  attempted: { color: "text-amber-400", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", icon: AlertCircle, label: "Attempted" },
  not_attempted: { color: "text-[var(--text-muted)]", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", icon: ClipboardList, label: "Not Attempted" },
};

const ExamResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [examRes, subRes] = await Promise.all([
          http.get("/admin/mock-tests"),
          http.get(`/admin/mock-tests/${id}/my-submission`),
        ]);
        const exam = examRes.data.find((e) => e._id === id);
        setData({ exam, submission: subRes.data });
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4 mt-8">
      <Skeleton className="h-32 rounded-3xl" />
      <Skeleton className="h-64 rounded-3xl" />
    </div>
  );

  if (!data?.exam) return (
    <div className="max-w-lg mx-auto mt-16 text-center">
      <p className="text-[var(--text-muted)]">Exam not found.</p>
      <button onClick={() => navigate("/exams")} className="btn-secondary mt-4 px-6 py-2.5 text-sm">Back</button>
    </div>
  );

  const { exam, submission } = data;
  const questions = exam.questions || [];
  const subs = submission?.submissions || [];
  const total = questions.length;
  const accepted = subs.filter((s) => s.status === "accepted").length;
  const score = submission?.totalScore || 0;
  const warnings = submission?.warnings || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-brand-400" />
          <span className="text-[10px] font-bold text-brand-400 tracking-[0.2em] uppercase">Exam Result</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{exam.title}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{LANG_LABELS[exam.language]} · {exam.durationMinutes} min</p>
      </div>

      {/* Score card */}
      <div className="card rounded-3xl p-8 text-center"
        style={{ background: "linear-gradient(135deg, rgba(47,158,68,0.06) 0%, rgba(81,207,102,0.03) 100%)", border: "1px solid rgba(47,158,68,0.12)" }}>
        <p className="text-5xl font-black text-[var(--text-primary)] mb-1">{score}</p>
        <p className="text-sm text-[var(--text-muted)]">Total Score</p>
        <div className="flex justify-center gap-8 mt-6">
          <div>
            <p className="text-2xl font-bold text-brand-400">{accepted}</p>
            <p className="text-xs text-[var(--text-muted)]">Accepted</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{total}</p>
            <p className="text-xs text-[var(--text-muted)]">Total</p>
          </div>
          {warnings > 0 && (
            <div>
              <p className="text-2xl font-bold text-amber-400">{warnings}</p>
              <p className="text-xs text-[var(--text-muted)]">Warnings</p>
            </div>
          )}
        </div>
        {submission?.terminated && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            Test was terminated: {submission.terminationReason}
          </div>
        )}
      </div>

      {/* Per-problem breakdown */}
      <div className="card rounded-3xl p-6">
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Problem Breakdown</p>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const pid = q.problemId?._id || q.problemId;
            const sub = subs.find((s) => s.problemId === pid || s.problemId?.toString() === pid?.toString());
            const status = sub?.status || "not_attempted";
            const cfg = statusConfig[status] || statusConfig.not_attempted;
            const Icon = cfg.icon;
            return (
              <div key={pid || i} className="flex items-center gap-3 rounded-xl p-3"
                style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="text-xs font-bold text-[var(--text-muted)] w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{q.problemId?.title || `Problem ${i + 1}`}</p>
                  <p className="text-xs text-[var(--text-muted)]">{q.problemId?.difficulty}</p>
                </div>
                <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.color}`}
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <Icon className="w-3 h-3" /> {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={() => navigate("/exams")}
        className="btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2">
        Back to Exams <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ExamResultPage;
