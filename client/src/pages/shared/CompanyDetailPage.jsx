import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import PageHeader from "../../components/PageHeader";
import Skeleton from "../../components/Skeleton";
import CodingQuestionsTab from "../../components/placement/CodingQuestionsTab";
import InterviewProcessTab from "../../components/placement/InterviewProcessTab";
import AptitudeQuestionsTab from "../../components/placement/AptitudeQuestionsTab";

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
        const decodedName = decodeURIComponent(name);
        const { data } = await http.get(`/placement/companies/${encodeURIComponent(decodedName)}`);
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
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow={company.type}
        title={company.name}
        description={`${company.assignedProblemCount || 0} assigned coding problems, aptitude practice, and interview preparation.`}
        action={
          <button
            onClick={() => navigate("/placement")}
            className="btn-secondary flex items-center gap-2 px-3.5 py-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        }
      />

      {/* Tab Navigation */}
      <div className="card-surface overflow-hidden rounded-lg border">
        <div className="flex gap-1 overflow-x-auto px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-3 text-sm font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-400"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card-surface rounded-lg border p-5">
        {activeTab === "interview-process" && (
          <InterviewProcessTab company={company} />
        )}
        {activeTab === "coding" && <CodingQuestionsTab companyName={company.name} />}
        {activeTab === "aptitude" && (
          <AptitudeQuestionsTab company={company} />
        )}
      </div>
    </div>
  );
};

export default CompanyDetailPage;
