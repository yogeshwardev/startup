import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";
import { Code, CheckCircle, XCircle, Clock, ChevronRight, FileCode } from "lucide-react";
import Skeleton from "../../components/Skeleton";

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await http.get("/submissions/me");
        setSubmissions(data);
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-12 w-64 rounded-2xl mb-8" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8 animate-slide-up">
        <div className="w-11 h-11 rounded-2xl bg-brand-500/10 flex items-center justify-center">
          <FileCode className="w-5 h-5 text-brand-400" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display">Your Submissions</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Track your problem solving progress</p>
        </div>
      </div>

      {!submissions || submissions.length === 0 ? (
        <div className="card rounded-3xl text-center py-20 px-6 animate-slide-up">
          <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-float">
            <Code className="w-7 h-7 text-brand-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">No Submissions Yet</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto text-sm">
            You haven't solved any problems yet. Head over to the problems page to get started!
          </p>
          <Link
            to="/problems"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-[var(--text-primary)] rounded-xl font-semibold transition-all  hover:"
          >
            Explore Problems <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {submissions.map((sub) => {
            const isAccepted = sub.status === "Accepted";
            const StatusIcon = isAccepted ? CheckCircle : XCircle;
            return (
              <Link
                key={sub._id}
                to={`/problems/${sub.problemId?.slug}?submissionId=${sub._id}`}
                className="block card rounded-3xl p-5 transition-all group  relative overflow-hidden"
              >
                {/* Status accent line */}
                <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full ${isAccepted ? 'bg-emerald-400' : 'bg-rose-400'}`} />

                <div className="flex items-center justify-between pl-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isAccepted ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                      <StatusIcon className={`w-5 h-5 ${isAccepted ? 'text-emerald-400' : 'text-rose-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-[var(--text-primary)] group-hover:text-brand-400 transition-colors">
                        {sub.problemId?.title || "Unknown Problem"}
                      </h3>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5" />
                          {sub.language.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(sub.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg ${isAccepted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {sub.status}
                      </span>
                      {sub.runtime > 0 && (
                        <p className="text-xs text-[var(--text-muted)] mt-2 font-mono">{sub.runtime}ms</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;



