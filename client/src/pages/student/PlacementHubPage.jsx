import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Skeleton from "../../components/Skeleton";

// Sample companies data
const COMPANIES = [
  {
    id: 1,
    name: "TCS",
    logo: "🏢",
    hiringType: "Mass",
    focusAreas: ["DSA", "Aptitude", "Core CS"],
    questionsCount: 30,
    mockTests: 5,
  },
  {
    id: 2,
    name: "Infosys",
    logo: "💼",
    hiringType: "Mass",
    focusAreas: ["DSA", "Database", "Aptitude"],
    questionsCount: 28,
    mockTests: 4,
  },
  {
    id: 3,
    name: "Wipro",
    logo: "🎯",
    hiringType: "Mass",
    focusAreas: ["DSA", "Core CS", "Aptitude"],
    questionsCount: 25,
    mockTests: 4,
  },
  {
    id: 4,
    name: "Accenture",
    logo: "🚀",
    hiringType: "Mass",
    focusAreas: ["DSA", "Aptitude", "Reasoning"],
    questionsCount: 22,
    mockTests: 3,
  },
  {
    id: 5,
    name: "Amazon",
    logo: "🛒",
    hiringType: "Product",
    focusAreas: ["DSA", "System Design", "Core CS"],
    questionsCount: 35,
    mockTests: 6,
  },
  {
    id: 6,
    name: "Microsoft",
    logo: "💻",
    hiringType: "Product",
    focusAreas: ["DSA", "Algorithms", "Core CS"],
    questionsCount: 32,
    mockTests: 5,
  },
  {
    id: 7,
    name: "Google",
    logo: "🔍",
    hiringType: "Product",
    focusAreas: ["DSA", "System Design", "Aptitude"],
    questionsCount: 38,
    mockTests: 7,
  },
];

const CompanyCard = ({ company, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{company.logo}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {company.name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1">
            {company.focusAreas.map((area) => (
              <span key={area} className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {area}
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>❔ {company.questionsCount} Q</span>
            <span>📝 {company.mockTests} Tests</span>
          </div>
        </div>
      </div>
    </button>
  );
};

const PlacementHubPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCompanies(COMPANIES);
      setLoading(false);
    }, 500);
  }, []);

  const filteredCompanies = companies.filter((company) => {
    if (selectedFilter === "all") return true;
    return company.hiringType.toLowerCase() === selectedFilter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Placement"
          title="Preparation Hub"
          description="Master company-specific interview preparation"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow="Placement"
        title="Preparation Hub"
        description="Master company-specific interview preparation with focused practice"
      />

      {/* Quick Action - Mock Test CTA */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-500 dark:to-brand-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold mb-1">Ready to Practice?</h3>
            <p className="text-sm opacity-90">Take a mock test and evaluate your placement readiness</p>
          </div>
          <button
            onClick={() => navigate("/placement/mock-test")}
            className="px-6 py-3 bg-white text-brand-600 font-semibold rounded-lg hover:bg-slate-100 transition whitespace-nowrap"
          >
            Start Mock Test
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex gap-3 flex-wrap">
        {["all", "mass", "product"].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              selectedFilter === filter
                ? "bg-brand-600 dark:bg-brand-500 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {filter === "all" ? "All Companies" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Hiring`}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="app-surface rounded-xl border p-5">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Companies</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{filteredCompanies.length}</p>
        </div>
        <div className="app-surface rounded-xl border p-5">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Questions</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {filteredCompanies.reduce((sum, c) => sum + c.questionsCount, 0)}
          </p>
        </div>
        <button
          onClick={() => navigate("/placement/mock-test")}
          className="app-surface rounded-xl border p-5 hover:shadow-lg transition-all hover:scale-105"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Mock Tests Available</p>
          <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-3">
            {filteredCompanies.reduce((sum, c) => sum + c.mockTests, 0)}
          </p>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Click to start →</p>
        </button>
      </div>

      {/* Companies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onClick={() => navigate(`/placement/company/${company.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlacementHubPage;
