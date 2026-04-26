import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowLeft, Download, Share2, TrendingUp } from "lucide-react";
import PageHeader from "../../components/PageHeader";

const MockTestResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { score, totalQuestions, solved, timeLeft } = location.state || {
    score: 75,
    totalQuestions: 4,
    solved: 3,
    timeLeft: 1200,
  };

  const [weakTopics, setWeakTopics] = useState([
    { name: "Binary Search", accuracy: 50, attempts: 2 },
    { name: "Dynamic Programming", accuracy: 40, attempts: 3 },
    { name: "Graph Algorithms", accuracy: 100, attempts: 1 },
    { name: "String Manipulation", accuracy: 75, attempts: 2 },
  ]);

  const performanceData = [
    { category: "Arrays", correct: 8, wrong: 2 },
    { category: "Strings", correct: 6, wrong: 4 },
    { category: "Trees", correct: 5, wrong: 5 },
    { category: "Graphs", correct: 3, wrong: 7 },
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} mins`;
  };

  const accuracy = Math.round((solved / totalQuestions) * 100);
  const timeTaken = 90 * 60 - timeLeft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <PageHeader
        eyebrow="Mock Test"
        title="Test Results"
        description="Review your performance and identify areas for improvement"
      />

      {/* Score Card */}
      <div className="app-surface rounded-xl border p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">
          YOUR SCORE
        </p>
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="text-6xl font-bold text-brand-600 dark:text-brand-400">
            {score}
          </span>
          <span className="text-2xl text-slate-600 dark:text-slate-400">%</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {solved} out of {totalQuestions} questions solved correctly
        </p>

        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              ACCURACY
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {accuracy}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              TIME TAKEN
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatTime(timeTaken)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              RANK
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              #1245
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold rounded-lg transition">
          <Download className="w-4 h-4" />
          Download Report
        </button>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition">
          <Share2 className="w-4 h-4" />
          Share Results
        </button>
        <button
          onClick={() => navigate("/placement/company/1")}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition ml-auto"
        >
          <TrendingUp className="w-4 h-4" />
          Retake Test
        </button>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Performance */}
        <div className="app-surface rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Performance by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="category" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="correct" fill="#10b981" name="Correct" />
              <Bar dataKey="wrong" fill="#ef4444" name="Wrong" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Difficulty Distribution */}
        <div className="app-surface rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Difficulty Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Easy", value: 40 },
                  { name: "Medium", value: 35 },
                  { name: "Hard", value: 25 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weak Topics */}
      <div className="app-surface rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Topics to Improve
        </h3>
        <div className="space-y-3">
          {weakTopics.map((topic, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {topic.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {topic.attempts} attempts
                </p>
              </div>

              {/* Accuracy bar */}
              <div className="w-32">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      topic.accuracy >= 75
                        ? "bg-emerald-500"
                        : topic.accuracy >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${topic.accuracy}%` }}
                  />
                </div>
              </div>

              <p className="font-semibold text-slate-900 dark:text-white w-12 text-right">
                {topic.accuracy}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
          📋 Recommendations
        </h3>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>
            ✓ Your score is <strong>above average</strong>. You're doing well!
          </li>
          <li>
            ✓ Focus on <strong>Dynamic Programming</strong> and <strong>Binary Search</strong> topics.
          </li>
          <li>
            ✓ Practice 2-3 more mock tests before the actual interview.
          </li>
          <li>
            ✓ Review the solutions of questions you missed.
          </li>
        </ul>
      </div>

      {/* Comparison Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="app-surface rounded-xl border p-5 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            YOUR RANK
          </p>
          <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">
            #1245
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            out of 10,000 students
          </p>
        </div>

        <div className="app-surface rounded-xl border p-5 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            AVG SCORE
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            62%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            You scored {score - 62}% above avg
          </p>
        </div>

        <div className="app-surface rounded-xl border p-5 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            AVG TIME
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            75 min
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            You took {Math.round(timeTaken / 60)} minutes
          </p>
        </div>

        <div className="app-surface rounded-xl border p-5 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            BEST SCORE
          </p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            85%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Previous attempt
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockTestResultPage;
