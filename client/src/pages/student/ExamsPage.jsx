import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Clock, Calendar, Code2, ChevronRight, Timer, CheckCircle2, Lock } from "lucide-react";
import http from "../../api/http";
import Skeleton from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";

const LANG_LABELS = { python: "Python", cpp: "C++", java: "Java", javascript: "JavaScript", c: "C" };

const getExamStatus = (exam) => {
  const now = new Date();
  if (!exam.scheduledFor) return "upcoming";
  const start = new Date(exam.scheduledFor);
  const end = new Date(start.getTime() + exam.durationMinutes * 60 * 1000);
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "completed";
};

const StatusBadge = ({ status }) => {
  const config = {
    upcoming: { label: "Upcoming", color: "text-amber-400", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
    live: { label: "🔴 Live", color: "text-emerald-400", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" },
    completed: { label: "Completed", color: "text-[var(--text-muted)]", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
  };
  const c = config[status] || config.upcoming;
  return (
    <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${c.color}`}
      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  );
};

const Countdown = ({ targetDate }) => {
  const [diff, setDiff] = useState(Math.max(0, Math.floor((new Date(targetDate) - Date.now()) / 1000)));

  useEffect(() => {
    const t = setInterval(() => {
      setDiff((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;

  return (
    <span className="font-mono text-xs text-amber-400">
      Starts in {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
};

const ExamCard = ({ exam, submitted, onClick }) => {
  const status = getExamStatus(exam);
  const isLive = status === "live";
  const isCompleted = status === "completed";
  const canOpen = isLive && !submitted;

  return (
    <div
      className={`card rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden transition-all duration-200 ${canOpen ? "card-interactive cursor-pointer hover:-translate-y-1" : ""}`}
      onClick={canOpen ? onClick : undefined}
    >
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 animate-pulse"
          style={{ background: "linear-gradient(90deg, #10b981, #06b6d4)" }} />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusBadge status={status} />
            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full text-brand-400"
              style={{ background: "rgba(47,158,68,0.12)", border: "1px solid rgba(47,158,68,0.25)" }}>
              <Code2 className="w-2.5 h-2.5 inline mr-1" />
              {LANG_LABELS[exam.language] || exam.language}
            </span>
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)] line-clamp-1">{exam.title}</h3>
          {exam.company && <p className="text-xs text-[var(--text-muted)] mt-0.5">{exam.company}</p>}
        </div>
        {canOpen && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-brand-500/10"
            style={{ border: "1px solid rgba(47,158,68,0.25)" }}>
            <ChevronRight className="w-4 h-4 text-brand-400" />
          </div>
        )}
        {submitted && <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-1" />}
        {isCompleted && !submitted && <Lock className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-1" />}
      </div>

      <div className="flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          {exam.durationMinutes} min
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <ClipboardList className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          {exam.questions?.length || 0} problems
        </div>
        {exam.scheduledFor && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            {new Date(exam.scheduledFor).toLocaleString()}
          </div>
        )}
      </div>

      {status === "upcoming" && exam.scheduledFor && (
        <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Timer className="w-3.5 h-3.5 text-amber-400" />
          <Countdown targetDate={exam.scheduledFor} />
        </div>
      )}
      {submitted && (
        <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs text-brand-400 font-medium">Submitted</span>
        </div>
      )}
      {isLive && !submitted && (
        <button onClick={onClick}
          className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
          Enter Exam <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [mySubmissions, setMySubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await http.get("/admin/mock-tests");
        setExams(data);
        // check which ones student already submitted
        const checks = await Promise.all(
          data.map((e) =>
            http.get(`/admin/mock-tests/${e._id}/my-submission`).then((r) => ({ id: e._id, sub: r.data })).catch(() => ({ id: e._id, sub: null }))
          )
        );
        const map = {};
        checks.forEach(({ id, sub }) => { if (sub) map[id] = true; });
        setMySubmissions(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const liveExams = exams.filter((e) => getExamStatus(e) === "live");
  const upcomingExams = exams.filter((e) => getExamStatus(e) === "upcoming");
  const completedExams = exams.filter((e) => getExamStatus(e) === "completed");

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-32 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-52 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="w-4 h-4 text-brand-400" />
          <span className="text-[10px] font-bold text-brand-400 tracking-[0.2em] uppercase">Exams</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-[var(--text-primary)] mb-2">
          Scheduled <span className="gradient-text">Tests</span>
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Teacher-assigned exams with a fixed language and timer. Join live exams when they open.
        </p>
      </div>

      {/* Live */}
      {liveExams.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[10px] font-bold text-emerald-400 tracking-[0.2em] uppercase">Live Now — {liveExams.length} active</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {liveExams.map((e) => (
              <ExamCard key={e._id} exam={e} submitted={!!mySubmissions[e._id]}
                onClick={() => navigate(`/exams/${e._id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcomingExams.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: "120ms" }}>
          <p className="text-[10px] font-bold text-amber-400 tracking-[0.2em] uppercase mb-4">Upcoming</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {upcomingExams.map((e) => <ExamCard key={e._id} exam={e} submitted={false} onClick={() => {}} />)}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedExams.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: "180ms" }}>
          <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-4">Completed</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {completedExams.map((e) => (
              <ExamCard key={e._id} exam={e} submitted={!!mySubmissions[e._id]}
                onClick={() => navigate(`/exams/${e._id}/result`)} />
            ))}
          </div>
        </div>
      )}

      {exams.length === 0 && (
        <EmptyState title="No exams scheduled" description="Your teacher will schedule exams here. Check back soon." />
      )}
    </div>
  );
};

export default ExamsPage;
