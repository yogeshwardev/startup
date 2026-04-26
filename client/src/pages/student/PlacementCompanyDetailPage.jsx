import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, BookOpen, Users } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Skeleton from "../../components/Skeleton";
import CodingQuestionsTab from "../../components/placement/CodingQuestionsTab";
import AptitudeQuestionsTab from "../../components/placement/AptitudeQuestionsTab";
import InterviewProcessTab from "../../components/placement/InterviewProcessTab";

// Sample company data
const COMPANY_DATA = {
  1: {
    name: "TCS",
    logo: "🏢",
    hiringType: "Mass",
    focusAreas: ["DSA", "Aptitude", "Core CS"],
    description: "Tata Consultancy Services - India's largest IT consulting firm",
    interviewRounds: [
      { round: "Round 1", title: "Online Assessment", duration: "120 mins", topics: ["DSA", "Aptitude"] },
      { round: "Round 2", title: "Technical Interview", duration: "60 mins", topics: ["Problem Solving", "Coding"] },
      { round: "Round 3", title: "HR Round", duration: "30 mins", topics: ["Communication", "Aptitude"] },
    ],
  },
  2: {
    name: "Infosys",
    logo: "💼",
    hiringType: "Mass",
    focusAreas: ["DSA", "Database", "Aptitude"],
    description: "Infosys Limited - Global IT services and consulting",
    interviewRounds: [
      { round: "Round 1", title: "Coding Test", duration: "90 mins", topics: ["DSA", "Aptitude"] },
      { round: "Round 2", title: "Technical Discussion", duration: "45 mins", topics: ["Coding", "System Design"] },
      { round: "Round 3", title: "HR Interview", duration: "20 mins", topics: ["Communication"] },
    ],
  },
  3: {
    name: "Wipro",
    logo: "🎯",
    hiringType: "Mass",
    focusAreas: ["DSA", "Core CS", "Aptitude"],
    description: "Wipro Limited - IT services and consulting company",
    interviewRounds: [
      { round: "Round 1", title: "Aptitude Test", duration: "75 mins", topics: ["Reasoning", "Math"] },
      { round: "Round 2", title: "Coding Challenge", duration: "90 mins", topics: ["DSA", "Algorithms"] },
      { round: "Round 3", title: "Technical & HR", duration: "60 mins", topics: ["Technical", "HR"] },
    ],
  },
  4: {
    name: "Accenture",
    logo: "🚀",
    hiringType: "Mass",
    focusAreas: ["DSA", "Aptitude", "Reasoning"],
    description: "Accenture - Professional services company",
    interviewRounds: [
      { round: "Round 1", title: "Written Assessment", duration: "120 mins", topics: ["Aptitude", "English"] },
      { round: "Round 2", title: "Technical Interview", duration: "60 mins", topics: ["DSA", "Problem Solving"] },
      { round: "Round 3", title: "HR Round", duration: "30 mins", topics: ["Communication"] },
    ],
  },
  5: {
    name: "Amazon",
    logo: "🛒",
    hiringType: "Product",
    focusAreas: ["DSA", "System Design", "Core CS"],
    description: "Amazon - E-commerce and cloud computing giant",
    interviewRounds: [
      { round: "Round 1", title: "Online Assessment", duration: "90 mins", topics: ["DSA", "Coding"] },
      { round: "Round 2", title: "Technical Phone Screen", duration: "60 mins", topics: ["Problem Solving"] },
      { round: "Round 3", title: "On-site Interviews", duration: "240 mins", topics: ["DSA", "System Design", "Behavioral"] },
    ],
  },
  6: {
    name: "Microsoft",
    logo: "💻",
    hiringType: "Product",
    focusAreas: ["DSA", "Algorithms", "Core CS"],
    description: "Microsoft - Software and cloud services leader",
    interviewRounds: [
      { round: "Round 1", title: "Online Test", duration: "120 mins", topics: ["DSA", "Algorithms"] },
      { round: "Round 2", title: "Coding Interviews", duration: "180 mins", topics: ["Problem Solving", "Implementation"] },
      { round: "Round 3", title: "Final Round", duration: "90 mins", topics: ["Design", "System Architecture"] },
    ],
  },
  7: {
    name: "Google",
    logo: "🔍",
    hiringType: "Product",
    focusAreas: ["DSA", "System Design", "Aptitude"],
    description: "Google - Search and technology giant",
    interviewRounds: [
      { round: "Round 1", title: "Kickstart Round", duration: "90 mins", topics: ["DSA", "Algorithms"] },
      { round: "Round 2", title: "Phone Interviews", duration: "120 mins", topics: ["Coding", "Problem Solving"] },
      { round: "Round 3", title: "On-site Interviews", duration: "300 mins", topics: ["DSA", "System Design", "Behavioral"] },
    ],
  },
};

const TABS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "coding", label: "Coding Questions", icon: Play },
  { id: "aptitude", label: "Aptitude", icon: Users },
  { id: "process", label: "Interview Process", icon: Users },
];

const PlacementCompanyDetailPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const data = COMPANY_DATA[parseInt(companyId)] || COMPANY_DATA[1];
      setCompany(data);
      setLoading(false);
    }, 300);
  }, [companyId]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="app-surface rounded-xl border p-6 md:p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="text-5xl">{company.logo}</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                  {company.name}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {company.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 text-sm font-semibold">
              {company.hiringType} Hiring
            </span>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="mt-6 flex flex-wrap gap-2">
          {company.focusAreas.map((area, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
          <div className="grid gap-6 md:grid-cols-2">
            {/* Interview Rounds */}
            <div className="app-surface rounded-xl border p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Interview Rounds
              </h3>
              <div className="space-y-3">
                {company.interviewRounds.map((round, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-500/20 dark:bg-brand-500/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {round.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {round.duration}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {round.topics.map((topic, tidx) => (
                          <span
                            key={tidx}
                            className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="app-surface rounded-xl border p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Preparation Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Questions Available</span>
                    <span className="text-xl font-bold text-brand-600 dark:text-brand-400">30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Mock Tests</span>
                    <span className="text-xl font-bold text-brand-600 dark:text-brand-400">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Avg Time Limit</span>
                    <span className="text-xl font-bold text-brand-600 dark:text-brand-400">90 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Students Prepared</span>
                    <span className="text-xl font-bold text-brand-600 dark:text-brand-400">1.2K</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate("/placement/mock-test")}
                className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 px-6 py-3 text-white font-semibold transition"
              >
                Start Mock Test
              </button>
            </div>
          </div>
        )}

        {activeTab === "coding" && <CodingQuestionsTab companyId={companyId} />}
        {activeTab === "aptitude" && <AptitudeQuestionsTab companyId={companyId} />}
        {activeTab === "process" && <InterviewProcessTab companyId={companyId} />}
      </div>
    </div>
  );
};

export default PlacementCompanyDetailPage;
