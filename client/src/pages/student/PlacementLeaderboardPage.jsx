import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, Flame } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Skeleton from "../../components/Skeleton";

// Sample leaderboard data
const LEADERBOARD_DATA = [
  { rank: 1, name: "Ananya Sharma", company: "Google", score: 4850, solved: 97, streak: 42, avatar: "🟢" },
  { rank: 2, name: "Arjun Kumar", company: "Amazon", score: 4720, solved: 94, streak: 38, avatar: "🔵" },
  { rank: 3, name: "Priya Patel", company: "Microsoft", score: 4680, solved: 93, streak: 35, avatar: "🟣" },
  { rank: 4, name: "Vikram Singh", company: "Google", score: 4520, solved: 90, streak: 28, avatar: "🟡" },
  { rank: 5, name: "Neha Gupta", company: "Amazon", score: 4380, solved: 87, streak: 25, avatar: "🟠" },
  { rank: 6, name: "Rohan Mehta", company: "Microsoft", score: 4210, solved: 84, streak: 22, avatar: "🔴" },
  { rank: 7, name: "Shreya Dey", company: "TCS", score: 4050, solved: 81, streak: 20, avatar: "⚪" },
  { rank: 8, name: "Aditya Nair", company: "Infosys", score: 3920, solved: 78, streak: 18, avatar: "🟢" },
  { rank: 9, name: "Deepika Yadav", company: "Wipro", score: 3780, solved: 75, streak: 15, avatar: "🔵" },
  { rank: 10, name: "Nikhil Verma", company: "Accenture", score: 3650, solved: 72, streak: 12, avatar: "🟣" },
];

const PlacementLeaderboardPage = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCompany, setFilterCompany] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    setTimeout(() => {
      setLeaderboard(LEADERBOARD_DATA);
      setLoading(false);
    }, 500);
  }, []);

  const companies = ["all", "Google", "Amazon", "Microsoft", "TCS", "Infosys", "Wipro", "Accenture"];

  const filteredLeaderboard = leaderboard.filter((entry) => {
    if (filterCompany === "all") return true;
    return entry.company === filterCompany;
  });

  const getRankMedal = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-sm font-bold text-slate-600 w-5">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Leaderboard"
          title="Placement Rankings"
          description="Top performers preparing for placements"
        />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow="Leaderboard"
        title="Placement Rankings"
        description="Compete with peers and track your placement preparation progress"
      />

      {/* Quick Action - Mock Test CTA */}
      <button
        onClick={() => navigate("/placement/mock-test")}
        className="w-full bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-500 dark:to-brand-600 rounded-xl p-4 text-[var(--text-primary)] hover:shadow-lg transition group"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="font-bold">Practice with Mock Tests</h3>
            <p className="text-sm opacity-90">Test your skills and improve your rankings →</p>
          </div>
          <Flame className="w-6 h-6 opacity-75 group-hover:opacity-100 transition" />
        </div>
      </button>

      {/* Top 3 Cards */}
      {filteredLeaderboard.slice(0, 3).length >= 1 && (
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {filteredLeaderboard.slice(0, 3).map((entry, idx) => (
            <div
              key={entry.rank}
              className={`rounded-xl border ${
                idx === 0
                  ? "card-surface border-yellow-200 bg-yellow-50"
                  : idx === 1
                  ? "card-surface border-slate-300 bg-slate-50"
                  : "card-surface border-orange-200 bg-orange-50"
              } p-6 text-center relative overflow-hidden`}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 text-6xl opacity-10">#</div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                </div>

                <p className={`text-sm font-semibold mb-1 ${
                  idx === 0
                    ? "text-yellow-600"
                    : idx === 1
                    ? "text-slate-600"
                    : "text-orange-600"
                }`}>
                  RANK #{entry.rank}
                </p>

                <h3 className="text-xl font-bold mb-1">
                  {entry.name}
                </h3>

                <p className="text-sm text-slate-600 mb-4">
                  {entry.company}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-center items-center gap-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {entry.score}
                    </span>
                    <span className="text-sm text-slate-600">points</span>
                  </div>

                  <div className="flex justify-center gap-4 text-xs">
                    <div>
                      <p className="text-slate-500">Solved</p>
                      <p className="font-bold text-slate-900">{entry.solved}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Streak</p>
                      <p className="font-bold text-slate-900">{entry.streak}d</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">Company:</p>
          <div className="flex gap-2 flex-wrap">
            {companies.map((company) => (
              <button
                key={company}
                onClick={() => setFilterCompany(company)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filterCompany === company
                    ? "bg-brand-600 text-[var(--text-primary)] shadow-lg"
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                {company === "all" ? "All Companies" : company}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="card-surface rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 text-sm">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Company</div>
          <div className="col-span-1 text-right">Score</div>
          <div className="col-span-1 text-right">Solved</div>
          <div className="col-span-1 text-right">Streak</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {filteredLeaderboard.map((entry) => (
            <div
              key={entry.rank}
              className="hover:bg-slate-50 transition px-6 py-4"
            >
              {/* Mobile view */}
              <div className="md:hidden space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankMedal(entry.rank)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {entry.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {entry.company}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-brand-600">
                    {entry.score}
                  </p>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-slate-600">
                    {entry.solved} solved
                  </span>
                  <span className="text-slate-600">
                    {entry.streak}d streak
                  </span>
                </div>
              </div>

              {/* Desktop view */}
              <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1 flex justify-center">
                  {getRankMedal(entry.rank)}
                </div>

                <div className="col-span-5 flex items-center gap-3">
                  <span className="text-2xl">{entry.avatar}</span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {entry.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Rank #{entry.rank}
                    </p>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {entry.company}
                  </span>
                </div>

                <div className="col-span-1 text-right">
                  <p className="font-bold text-lg text-brand-600">
                    {entry.score}
                  </p>
                </div>

                <div className="col-span-1 text-right">
                  <p className="font-semibold text-slate-900">
                    {entry.solved}
                  </p>
                </div>

                <div className="col-span-1 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <p className="font-semibold text-slate-900">
                      {entry.streak}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card-surface rounded-xl border p-5 text-center">
          <p className="text-sm text-slate-600 mb-2">Total Participants</p>
          <p className="text-3xl font-bold text-slate-900">10,000+</p>
        </div>
        <div className="card-surface rounded-xl border p-5 text-center">
          <p className="text-sm text-slate-600 mb-2">Avg Score</p>
          <p className="text-3xl font-bold text-slate-900">3,420</p>
        </div>
        <div className="card-surface rounded-xl border p-5 text-center">
          <p className="text-sm text-slate-600 mb-2">Your Rank</p>
          <p className="text-3xl font-bold text-brand-600">#547</p>
        </div>
        <div className="card-surface rounded-xl border p-5 text-center">
          <p className="text-sm text-slate-600 mb-2">Your Score</p>
          <p className="text-3xl font-bold text-slate-900">3,890</p>
        </div>
      </div>
    </div>
  );
};

export default PlacementLeaderboardPage;



