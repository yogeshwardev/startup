import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, BookmarkIcon, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import PageHeader from "../../components/PageHeader";
import Skeleton from "../../components/Skeleton";
import SectionCard from "../../components/SectionCard";
import QuestionList from "../../components/placement/QuestionList";
import InterviewProcessTab from "../../components/placement/InterviewProcessTab";
import AptitudeQuestionsTab from "../../components/placement/AptitudeQuestionsTab";
import InterviewQuestionsTab from "../../components/placement/InterviewQuestionsTab";

const CompanyDetailPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("interview-process");
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const { data } = await http.get(`/placement/companies/${name}`);
        setCompany(data);
      } catch (error) {
        console.error("Failed to load company:", error);
        navigate("/placement");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [name, navigate]);

  if (loading || !company) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  const tabs = [
    { id: "interview-process", label: "Interview Process" },
    { id: "coding", label: "Coding Questions" },
    { id: "aptitude", label: "Aptitude Questions" },
    { id: "interview", label: "Interview Questions" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow={company.type}
        title={company.name}
        description="Prepare for placement interviews and coding rounds"
        action={
          <button
            onClick={() => navigate("/placement")}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        }
      />

      {/* Tab Navigation */}
      <div className="card-surface rounded-xl border overflow-hidden">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-brand-600 text-brand-600 bg-slate-50"
                  : "border-transparent text-slate-600 hover:dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card-surface rounded-xl border p-6">
        {activeTab === "interview-process" && (
          <InterviewProcessTab company={company} />
        )}
        {activeTab === "coding" && <QuestionList company={company} type="coding" />}
        {activeTab === "aptitude" && (
          <AptitudeQuestionsTab company={company} />
        )}
        {activeTab === "interview" && (
          <InterviewQuestionsTab company={company} />
        )}
      </div>
    </div>
  );
};

export default CompanyDetailPage;



