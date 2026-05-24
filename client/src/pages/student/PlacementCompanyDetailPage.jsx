import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, BookOpen, Users } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Skeleton from "../../components/Skeleton";
import CodingQuestionsTab from "../../components/placement/CodingQuestionsTab";
import AptitudeQuestionsTab from "../../components/placement/AptitudeQuestionsTab";


import http from "../../api/http";
import { useToast } from "../../hooks/useToast";

const TABS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "coding", label: "Coding Questions", icon: Play },
  { id: "aptitude", label: "Aptitude", icon: Users },
];

const PlacementCompanyDetailPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [company, setCompany] = useState(null);
  const [codingProblems, setCodingProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const decodedName = decodeURIComponent(name);
        const [{ data: companyData }, { data: problemData }] = await Promise.all([
          http.get(`/placement/companies/${encodeURIComponent(decodedName)}`),
          http.get(`/placement/companies/${encodeURIComponent(decodedName)}/problems`),
        ]);
        setCompany(companyData);
        setCodingProblems(problemData.problems || []);
      } catch (error) {
        toast.error("Failed to load company details");
        navigate("/placement");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyDetails();
  }, [name, navigate]);

  if (loading || !company) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12" />
          ))}
        </div>
      </div>
    );
  }

  const problemCounts = codingProblems.reduce(
    (acc, problem) => {
      acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
      return acc;
    },
    { Easy: 0, Medium: 0, Hard: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-surface rounded-xl border p-6 md:p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:dark:hover:text-[var(--text-primary)] mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="text-5xl">{company.logo}</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  {company.name}
                </h1>
                <p className="text-slate-600 mt-1">
                  {company.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-500/15 text-brand-700 border border-brand-200 text-sm font-semibold">
              {company.type}
            </span>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="mt-6 flex flex-wrap gap-2">
          {company.focusAreas.map((area, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-slate-600 hover:dark:hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "overview" && (
          <div className="max-w-2xl mx-auto">
            {/* Stats */}
            <div className="space-y-4">
              <div className="card-surface rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Preparation Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Coding Problems</span>
                    <span className="text-xl font-bold text-brand-600">{codingProblems.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Easy</span>
                    <span className="text-xl font-bold text-emerald-600">{problemCounts.Easy || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Medium</span>
                    <span className="text-xl font-bold text-amber-600">{problemCounts.Medium || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Hard</span>
                    <span className="text-xl font-bold text-rose-600">{problemCounts.Hard || 0}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setActiveTab("coding")}
                className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 px-6 py-3 text-[var(--text-primary)] font-semibold transition"
              >
                Practice Assigned Problems
              </button>
            </div>
          </div>
        )}

        {activeTab === "coding" && <CodingQuestionsTab companyName={company.name} />}
        {activeTab === "aptitude" && <AptitudeQuestionsTab company={company} />}
      </div>
    </div>
  );
};

export default PlacementCompanyDetailPage;
