import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, ChevronRight, Briefcase, Sparkles, Award
} from "lucide-react";
import http from "../../api/http";
import Skeleton from "../../components/Skeleton";

const CompanyCard = ({ company, completionPercent, onClick }) => {
  const problemCount = company.assignedProblemCount || 0;

  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left p-6 card rounded-3xl transition-all overflow-hidden flex flex-col min-h-[240px] card-interactive"
    >
      <Building2 className="absolute -right-6 top-1/2 -translate-y-1/2 w-48 h-48 text-brand-500 opacity-[0.02] pointer-events-none -rotate-12 group-hover:scale-110 transition-transform duration-700" />

      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 overflow-hidden">
          {company.logo?.startsWith("http") ? (
            <img src={company.logo} alt={company.name} className="w-9 h-9 object-contain" />
          ) : (
            <span className="text-2xl">{company.logo || "🏢"}</span>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-brand-400 transition-colors">
            {company.name}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-2 pr-2 leading-relaxed">
            {company.description || "Focused company-specific preparation patterns."}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-auto relative z-10 w-full">
        <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${completionPercent}%`,
              background: "linear-gradient(90deg, var(--brand-600), var(--brand-400))",
            }}
          />
        </div>

        <div className="flex items-end justify-between w-full">
          <div className="flex gap-8">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">Problem Bank</p>
              <p className="text-[var(--text-primary)] font-bold text-sm">{problemCount} Problems</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">Completion</p>
              <p className="text-brand-400 font-bold text-sm">{completionPercent}%</p>
            </div>
          </div>

          <div
            className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-brand-500 transition-all shrink-0"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}
          >
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
          </div>
        </div>
      </div>
    </button>
  );
};

const PlacementHubPage = () => {
  const [companies, setCompanies] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [compRes, progRes] = await Promise.all([
          http.get("/placement/companies"),
          http.get("/placement/progress/me").catch(() => ({ data: { progress: { companyProgress: [] } } })),
        ]);
        setCompanies(compRes.data);
        setProgress(progRes.data?.progress?.companyProgress || []);
      } catch (error) {
        console.error("Failed to load placement data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getCompletionPercent = (company) => {
    const problemCount = company.assignedProblemCount || 0;
    if (!problemCount) return 0;
    const companyProg = progress?.find((p) => p.companyName === company.name);
    if (!companyProg) return 0;
    const attemptCount = companyProg.totalQuestionsAttempted || 0;
    return Math.min(100, Math.round((attemptCount / problemCount) * 100));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-[350px] w-full rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[240px] rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Hero Section */}
      <div
        className="relative overflow-hidden rounded-[2rem] p-8 lg:p-12 animate-slide-up"
        style={{
          background: "linear-gradient(135deg, rgba(47, 158, 68, 0.06) 0%, rgba(81, 207, 102, 0.03) 100%)",
          border: "1px solid rgba(47, 158, 68, 0.1)",
        }}
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <Briefcase className="absolute right-8 bottom-8 w-32 h-32 text-brand-400/[0.03] pointer-events-none" strokeWidth={0.8} />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-[10px] font-bold text-brand-400 tracking-[0.2em] uppercase">Placement Hub</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold font-display text-[var(--text-primary)] leading-tight mb-5">
            Company-wise <span className="gradient-text">Preparation</span>
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
            Prepare for placements with company-specific coding problems, aptitude questions, and interview rounds. Track your progress and compete with peers.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => document.getElementById("companies-grid")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-primary group px-6 py-3 flex items-center gap-2 text-sm"
            >
              Browse Companies <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/placement/leaderboard")}
              className="btn-secondary flex items-center gap-2 px-6 py-3 text-sm"
            >
              <Award className="w-4 h-4 text-amber-400" />
              Placement Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Section Label */}
      <div className="flex items-center gap-2 animate-slide-up" style={{ animationDelay: "80ms" }}>
        <Building2 className="w-4 h-4 text-brand-400" />
        <span className="text-[10px] font-bold text-brand-400 tracking-[0.2em] uppercase">Companies</span>
        <span className="text-[var(--text-muted)] text-xs ml-1">— {companies.length} tracks available</span>
      </div>

      {/* Company Grid */}
      <div id="companies-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
        {companies.map((company) => (
          <CompanyCard
            key={company._id}
            company={company}
            completionPercent={getCompletionPercent(company)}
            onClick={() => navigate(`/placement/company/${encodeURIComponent(company.name)}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlacementHubPage;
