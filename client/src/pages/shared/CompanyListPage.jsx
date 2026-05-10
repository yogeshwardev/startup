import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Briefcase } from "lucide-react";
import http from "../../api/http";
import PageHeader from "../../components/PageHeader";
import Skeleton from "../../components/Skeleton";

const CompanyListPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const { data } = await http.get("/placement/companies");
        setCompanies(data);
      } catch (error) {
        console.error("Failed to load companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const typeColors = {
    "Mass Hiring": "bg-brand-500/15 text-brand-600",
    "Product Based": "bg-indigo-500/15 text-indigo-600",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Placement"
          title="Company Preparation"
          description="Select a company to practice previously asked questions"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Placement"
        title="Company Preparation"
        description="Select a company to practice previously asked questions"
      />

      {/* Quick Navigation Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-surface rounded-xl border p-6 bg-gradient-to-br from-brand-50 to-slate-50 dark:from-brand-500/10 dark:to-slate-900">
          <h3 className="font-semibold mb-2">Start Practicing</h3>
          <p className="text-sm text-slate-600 mb-4">
            Select a company below to practice specific interview questions and topics
          </p>
        </div>
        <button
          onClick={() => navigate("/placement/mock-test")}
          className="card-surface rounded-xl border p-6 bg-gradient-to-br from-amber-50 to-slate-50 dark:from-amber-500/10 dark:to-slate-900 hover:shadow-lg transition text-left"
        >
          <h3 className="font-semibold mb-2">Take Mock Test</h3>
          <p className="text-sm text-slate-600">
            Evaluate your readiness with a comprehensive mock test
          </p>
          <p className="text-xs font-semibold text-amber-600 mt-3">Try now →</p>
        </button>
      </div>

      {/* Companies Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <button
            key={company._id}
            onClick={() => navigate(`/placement/company/${company.name}`)}
            className="card-surface group rounded-xl p-5 text-left transition hover:shadow-md"
          >
            {/* Logo Placeholder */}
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition">
              <Building2 className="h-5 w-5 text-slate-600" />
            </div>

            {/* Company Name */}
            <h3 className="text-base font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400 transition truncate">
              {company.name}
            </h3>

            {/* Type Badge */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  typeColors[company.type] || "bg-slate-100 text-slate-600"
                }`}
              >
                {company.type}
              </span>
            </div>

            {/* Focus Areas */}
            {company.focusAreas?.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-slate-600">Focus Areas:</p>
                <div className="flex flex-wrap gap-1">
                  {company.focusAreas.slice(0, 3).map((area) => (
                    <span
                      key={area}
                      className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                    >
                      {area}
                    </span>
                  ))}
                  {company.focusAreas.length > 3 && (
                    <span className="text-xs text-slate-500">
                      +{company.focusAreas.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Arrow */}
            <div className="mt-4 text-brand-600 opacity-0 group-hover:opacity-100 transition">
              →
            </div>
          </button>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="rounded-xl card-surface border p-12 text-center">
          <p className="text-slate-500">No companies found</p>
        </div>
      )}
    </div>
  );
};

export default CompanyListPage;



