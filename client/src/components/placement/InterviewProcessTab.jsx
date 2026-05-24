import { CheckCircle2, Clock, Target } from "lucide-react";

const InterviewProcessTab = ({ company }) => {
  const companyName = company?.name || "Company";
  const stages = company?.interviewProcess || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Interview Process at {companyName}
        </h2>

        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 dark:border-slate-700 app-surface p-5 hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                {/* Stage Number */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 dark:bg-brand-500 text-white font-bold">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {stage.stage}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {stage.description}
                  </p>

                  {/* Duration */}
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {stage.duration}</span>
                  </div>

                  {/* Focus Areas */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(stage.tags || []).map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="app-surface rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Selection Flow
        </h3>
        <div className="space-y-2">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 dark:bg-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400">
                {index + 1}
              </div>
              <div className="flex-1 h-0.5 bg-brand-500/30 dark:bg-brand-500/20" />
              <span className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                {stage.stage}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-brand-50 dark:bg-brand-500/15 border border-brand-200 dark:border-brand-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <Target className="w-6 h-6 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
          <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-300">
            Preparation Guide
          </h3>
        </div>
        <ul className="space-y-2">
          <li className="text-sm text-slate-700 dark:text-slate-300">
            <strong>For Assessment Round:</strong> Master data structures, arrays, strings, and basic aptitude
          </li>
          <li className="text-sm text-slate-700 dark:text-slate-300">
            <strong>For Coding:</strong> Practice 2-3 problems per day, focus on complexity analysis
          </li>
          <li className="text-sm text-slate-700 dark:text-slate-300">
            <strong>For Technical:</strong> Prepare project descriptions, understand core concepts deeply
          </li>
          <li className="text-sm text-slate-700 dark:text-slate-300">
            <strong>For HR:</strong> Research the company, prepare your story, practice answering behavioral questions
          </li>
        </ul>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="app-surface rounded-xl border p-5 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Interview Rounds</p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stages.length}</p>
        </div>
      </div>
    </div>
  );
};

export default InterviewProcessTab;
