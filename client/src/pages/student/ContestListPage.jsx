import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import Skeleton from "../../components/Skeleton";
import { useContestTimer } from "../../hooks/useContestTimer";
import { Trophy, Clock, Users, ChevronRight, Calendar, Sparkles, Zap } from "lucide-react";

const FeaturedContest = ({ contest }) => {
  const timer = useContestTimer(contest.startTime, contest.endTime);
  const isLive = timer.state === "live";

  return (
    <div className="relative overflow-hidden rounded-[2rem] p-8 lg:p-12 transition-all" style={{
      background: isLive
        ? "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)"
        : "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(34, 211, 238, 0.05) 100%)",
      border: `1px solid ${isLive ? "rgba(245, 158, 11, 0.15)" : "rgba(99, 102, 241, 0.12)"}`,
      boxShadow: isLive ? "0 0 60px rgba(245, 158, 11, 0.05)" : "0 0 60px rgba(99, 102, 241, 0.03)",
    }}>
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-20 blur-[120px]"
        style={{ background: isLive ? "rgba(245, 158, 11, 0.15)" : "rgba(99, 102, 241, 0.15)" }} />

      <Trophy className="absolute right-[-3%] top-1/2 -translate-y-1/2 w-[350px] h-[350px] opacity-[0.03] pointer-events-none -rotate-12"
        style={{ color: isLive ? "#f59e0b" : "#6366f1" }} strokeWidth={0.8} />

      <div className="relative z-10 max-w-2xl">
        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${
          isLive ? 'bg-amber-500/20 text-amber-400' : 'bg-brand-500/15 text-brand-300'
        }`}>
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
          {isLive ? 'Live Now' : 'Upcoming'}
        </span>

        <h2 className="text-3xl lg:text-5xl font-bold font-display text-[var(--text-primary)] mb-5 leading-tight">
          {contest.title}
        </h2>

        <p className="text-[var(--text-secondary)] text-sm lg:text-base leading-relaxed mb-8 max-w-xl">
          {contest.description || "The biggest contest of the season. Compete against top students, climb the leaderboard, and showcase your problem-solving skills."}
        </p>

        <div className="flex flex-wrap items-center gap-8 mb-8">
          <div className="flex items-start gap-3">
            <Clock className={`w-5 h-5 mt-0.5 ${isLive ? 'text-amber-400' : 'text-[var(--text-secondary)]'}`} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">{timer.label}</p>
              <p className="text-[var(--text-primary)] font-bold text-lg">{timer.timeText}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className={`w-5 h-5 mt-0.5 ${isLive ? 'text-amber-400' : 'text-brand-400'}`} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Participants</p>
              <p className="text-[var(--text-primary)] font-bold text-lg">{contest.participants?.length || 0} Registered</p>
            </div>
          </div>
        </div>

        <Link
          to={`/contest/${contest._id}`}
          className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all hover:-translate-y-0.5 ${
            isLive
              ? 'bg-amber-500 hover:bg-amber-400 text-black -amber'
              : 'bg-brand-500 hover:bg-brand-600 text-[var(--text-primary)] '
          }`}
        >
          {isLive ? 'Enter Arena' : 'View Details'} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

const ContestCard = ({ contest }) => {
  const timer = useContestTimer(contest.startTime, contest.endTime);
  const difficulty = contest.problems?.[0]?.problemId?.difficulty || "MIXED";
  const isLive = timer.state === "live";

  const diffColors = {
    Easy: "text-emerald-400 bg-emerald-500/10",
    Medium: "text-amber-400 bg-amber-500/10",
    Hard: "text-rose-400 bg-rose-500/10",
    MIXED: "text-[var(--text-secondary)] bg-white/5",
  };

  return (
    <div className="card rounded-3xl p-6 flex flex-col group  transition-all">
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(100, 120, 200, 0.06)" }}>
          {isLive ? <Zap className="w-5 h-5 text-amber-400" /> : <Clock className="w-5 h-5 text-[var(--text-secondary)]" />}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg ${
          isLive ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-[var(--text-secondary)]'
        }`}>
          {timer.state === 'live' ? 'Active' : timer.state === 'upcoming' ? 'Registering' : 'Ended'}
        </span>
      </div>

      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 group-hover:text-brand-400 transition-colors line-clamp-1">{contest.title}</h3>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm font-medium">
          <Calendar className="w-4 h-4" />
          {new Date(contest.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${diffColors[difficulty] || diffColors.MIXED}`}>
          {difficulty}
        </span>
      </div>

      <Link
        to={`/contest/${contest._id}`}
        className="mt-auto w-full text-center text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all hover:bg-white/[0.06] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        style={{ border: "1px solid rgba(100, 120, 200, 0.08)" }}
      >
        {timer.state === 'live' ? 'ENTER NOW' : 'VIEW SCHEDULE'}
      </Link>
    </div>
  );
};

const tabs = ["LIVE", "UPCOMING", "MY HISTORY"];

const ContestListPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("LIVE");

  useEffect(() => {
    http
      .get("/contests")
      .then((response) => setContests(response.data))
      .finally(() => setLoading(false));
  }, []);

  const categorized = useMemo(() => {
    const now = new Date();
    const live = [];
    const upcoming = [];
    const past = [];

    const sorted = [...contests].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    sorted.forEach(c => {
      const start = new Date(c.startTime);
      const end = new Date(c.endTime);
      if (now >= start && now <= end) live.push(c);
      else if (now < start) upcoming.push(c);
      else past.push(c);
    });

    past.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    return { LIVE: live, UPCOMING: upcoming, "MY HISTORY": past };
  }, [contests]);

  const displayContests = categorized[activeTab] || [];
  const featured = displayContests[0];
  const remaining = displayContests.slice(1);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-slide-up" style={{ borderBottom: "1px solid rgba(100, 120, 200, 0.06)", paddingBottom: "1.5rem" }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 tracking-[0.2em] uppercase">Competitive Arena</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-[var(--text-primary)] mb-2">
            Join the <span className="gradient-text-warm">Battle</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Join daily contests, build your rank, and qualify for global events.
          </p>
        </div>

        <div className="flex items-center rounded-xl p-1.5" style={{ background: "rgba(15, 20, 35, 0.6)", border: "1px solid rgba(100, 120, 200, 0.08)" }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-amber-500/20 text-amber-400 -amber'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.03]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-[350px] w-full rounded-[2rem]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[220px] rounded-3xl" />
            <Skeleton className="h-[220px] rounded-3xl" />
          </div>
        </div>
      ) : displayContests.length === 0 ? (
        <EmptyState
          title={`No ${activeTab.toLowerCase()} contests`}
          description="There are currently no contests available in this category."
        />
      ) : (
        <div className="space-y-8">
          {featured && <FeaturedContest contest={featured} />}
          {remaining.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {remaining.map(contest => (
                <ContestCard key={contest._id} contest={contest} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContestListPage;



