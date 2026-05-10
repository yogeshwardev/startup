import {
  Eye,
  Flame,
  MessageCircle,
  Search,
  ShieldAlert,
  Star,
  Trophy,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import SectionCard from "../../components/SectionCard";
import Skeleton from "../../components/Skeleton";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

const MAX_VISIBLE_SOLVED = 5;
const MONTH_LABEL_INDEXES = [0, 35, 70, 105, 140, 175, 210, 245, 280, 315, 350];

const heatClass = (count) => {
  if (count >= 4) return "bg-emerald-400";
  if (count >= 3) return "bg-emerald-500";
  if (count >= 2) return "bg-emerald-600";
  if (count >= 1) return "bg-emerald-800";
  return "bg-slate-800/50";
};

const difficultyColors = {
  Easy: "text-cyan-300 bg-cyan-500/10",
  Medium: "text-amber-300 bg-amber-500/10",
  Hard: "text-rose-300 bg-rose-500/10",
};

const communityIcons = {
  views: Eye,
  solutions: Trophy,
  discussions: MessageCircle,
  reputation: Star,
};

const UserProfilePage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [showAllSolved, setShowAllSolved] = useState(false);

  const isOwnProfile = !id || id === user?.id;

  const loadProfile = async () => {
    try {
      setLoading(true);
      const endpoint = isOwnProfile ? "/profiles/me" : `/profiles/${id}`;
      const { data } = await http.get(endpoint);
      setProfile(data);
    } catch (error) {
      toast.error(
        "Unable to load profile",
        error.response?.data?.message || "Please refresh and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id, isOwnProfile]);

  useEffect(() => {
    const loadSearch = async () => {
      const value = searchQuery.trim();
      if (value.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        const { data } = await http.get("/profiles/search", {
          params: { query: value },
        });
        setSearchResults(data);
      } catch (_error) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = window.setTimeout(loadSearch, 250);
    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleFollowToggle = async () => {
    if (!profile || isOwnProfile) return;

    try {
      setFollowBusy(true);
      await http.post(`/profiles/${profile.user.id}/follow`);
      await loadProfile();
    } catch (error) {
      toast.error(
        "Unable to update follow",
        error.response?.data?.message || "Please try again."
      );
    } finally {
      setFollowBusy(false);
    }
  };

  const languageStats = useMemo(() => {
    if (!profile) return [];
    return Object.entries(profile.stats.languageStats || {})
      .map(([language, value]) => ({
        language,
        solved: value.solved || 0,
      }))
      .sort((left, right) => right.solved - left.solved);
  }, [profile]);

  if (loading) {
    return <Skeleton className="h-[760px]" />;
  }

  if (!profile) {
    return (
      <EmptyState
        title="Profile not found"
        description="This user profile is not available."
      />
    );
  }

  const solvedProblems = profile.stats.solvedProblems || [];
  const visibleSolved = showAllSolved
    ? solvedProblems
    : solvedProblems.slice(0, MAX_VISIBLE_SOLVED);
  const activityCalendar = profile.stats.activityCalendar || [];
  const badges = profile.stats.badges || { earned: [], locked: [] };
  const communityStats = profile.stats.communityStats || {};
  const networkBasePath = isOwnProfile ? "/profile/connections" : `/profile/${profile.user.id}/connections`;

  return (
    <div className="mx-auto max-w-[1360px] space-y-6">
      <SectionCard title="">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-500">
              Developer Profile
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              {profile.user.displayName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              @{profile.user.username} · Rank #{profile.user.rank || "--"}
            </p>
            {profile.user.userCode && (
              <p className="mt-2 inline-block rounded-lg bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-500">
                User Code: {profile.user.userCode}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="card-surface flex items-center gap-3 rounded-2xl px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search by name, register number, or email"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            {searchQuery.trim().length >= 2 ? (
              <div className="card-surface absolute right-0 top-[calc(100%+0.5rem)] z-30 w-full rounded-[1.5rem] p-3 shadow-2xl">
                {searching ? (
                  <p className="px-2 py-3 text-sm text-slate-500">
                    Searching...
                  </p>
                ) : searchResults.length ? (
                  <div className="space-y-2">
                    {searchResults.map((entry) => (
                      <Link
                        key={entry.id}
                        to={`/profile/${entry.id}`}
                        className="block rounded-2xl px-3 py-3 text-sm transition hover:bg-white/5"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                      >
                        <p className="font-semibold text-slate-900">
                          {entry.displayName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {entry.email} · {entry.registrationNumber || "No register number"}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="px-2 py-3 text-sm text-slate-500">
                    No users found.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-6">
          <SectionCard title="">
            <div className="space-y-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-[1.8rem] bg-gradient-to-br from-brand-500 to-blue-600 text-2xl font-bold text-[var(--text-primary)]">
                {profile.user.username.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <p className="text-2xl font-semibold text-slate-900">
                  {profile.user.displayName}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {profile.user.email}
                </p>
                <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
                  <Link
                    to={`${networkBasePath}?tab=following`}
                    className="rounded-full px-2 py-1 transition hover:bg-white/5 hover:dark:hover:text-[var(--text-primary)]"
                  >
                    {profile.user.followingCount} Following
                  </Link>
                  <span>|</span>
                  <Link
                    to={`${networkBasePath}?tab=followers`}
                    className="rounded-full px-2 py-1 transition hover:bg-white/5 hover:dark:hover:text-[var(--text-primary)]"
                  >
                    {profile.user.followersCount} Followers
                  </Link>
                </div>
              </div>

              {!isOwnProfile ? (
                <button
                  type="button"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    profile.user.isFollowing
                      ? "border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
                      : "bg-emerald-500 text-[var(--text-primary)] hover:bg-emerald-600"
                  }`}
                  onClick={handleFollowToggle}
                  disabled={followBusy}
                >
                  <UserPlus className="h-4 w-4" />
                  {profile.user.isFollowing ? "Following" : "Follow"}
                </button>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard title="Community Stats">
            <div className="space-y-5">
              {Object.entries(communityStats).map(([key, value]) => {
                const Icon = communityIcons[key] || Trophy;
                return (
                  <div key={key} className="flex items-start gap-3">
                    <Icon className="mt-1 h-4 w-4 text-brand-400" />
                    <div>
                      <p className="font-semibold capitalize text-slate-900">
                        {key} {value}
                      </p>
                      <p className="text-sm text-slate-500">
                        Last week {Math.floor(Number(value || 0) / 7)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Languages">
            {languageStats.length ? (
              <div className="space-y-3">
                {languageStats.map((entry) => (
                  <div
                    key={entry.language}
                    className="flex items-center justify-between rounded-[1.25rem] bg-white/5 px-4 py-3 text-sm"
                  >
                    <span className="rounded-full bg-slate-700/80 px-3 py-1 text-slate-100">
                      {entry.language.toUpperCase()}
                    </span>
                    <span className="text-slate-500">
                      {entry.solved} solved
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No languages yet"
                description="Accepted submissions will populate language stats."
              />
            )}
          </SectionCard>
        </aside>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SectionCard title="Problem Stats">
              <div className="grid gap-4 lg:grid-cols-[1fr_150px]">
                <div className="flex min-h-[230px] items-center justify-center rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]">
                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[10px] border-amber-500/30">
                    <div className="absolute inset-3 rounded-full border-[8px] border-cyan-500/25" />
                    <div className="absolute inset-7 rounded-full border-[8px] border-rose-500/25" />
                    <div className="text-center">
                      <p className="text-5xl font-bold text-slate-900">
                        {profile.stats.solvedCount}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Total solved
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {Object.entries(profile.stats.solvedByDifficulty || {}).map(
                    ([difficulty, count]) => (
                      <div
                        key={difficulty}
                        className="rounded-[1.25rem] bg-white/5 p-4"
                      >
                        <p
                          className={`text-sm font-semibold ${
                            difficulty === "easy"
                              ? "text-cyan-300"
                              : difficulty === "medium"
                                ? "text-amber-300"
                                : "text-rose-300"
                          }`}
                        >
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                          {count}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Badges">
              <div className="grid gap-3">
                {badges.earned.length ? (
                  badges.earned.map((badge) => (
                    <div
                      key={badge.key}
                      className="rounded-[1.5rem] bg-emerald-500/10 p-4"
                    >
                      <p className="font-semibold text-emerald-300">{badge.label}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Earned badge
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] bg-white/5 p-4">
                    <p className="font-semibold text-slate-900">
                      No earned badges yet
                    </p>
                  </div>
                )}
                {badges.locked.slice(0, 2).map((badge) => (
                  <div
                    key={badge.key}
                    className="rounded-[1.5rem] border border-dashed border-white/10 p-4"
                  >
                    <p className="font-semibold text-slate-600">
                      {badge.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Locked badge
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Submission Heatmap">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                <p>{profile.stats.solvedCount} accepted submissions in the past year</p>
                <div className="flex gap-5">
                  <span>Total active days: {profile.stats.streak.activeDays}</span>
                  <span>Max streak: {profile.stats.streak.max}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="mb-2 grid grid-cols-[repeat(53,minmax(0,1fr))] gap-1 text-[11px] text-slate-500">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => (
                      <span key={month} className={i === 0 ? "col-span-5" : "col-span-4"}>
                        {month}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-flow-col grid-rows-7 gap-1">
                    {activityCalendar.map((day) => {
                      if (day.empty) {
                        return <div key={day.date} className="h-3.5 w-3.5" />;
                      }
                      return (
                        <div
                          key={day.date}
                          title={`Date: ${day.date}\nTotal Submissions: ${day.total || 0}\nAccuracy: ${day.accuracy || 0}%`}
                          className={`h-3.5 w-3.5 rounded-[3px] cursor-pointer ${heatClass(day.count)}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Recent Activity">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {profile.stats.solvedCount}
                </p>
                <p className="text-sm text-slate-500">
                  Unique questions solved
                </p>
              </div>
              {solvedProblems.length > MAX_VISIBLE_SOLVED ? (
                <button
                  type="button"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10"
                  onClick={() => setShowAllSolved((current) => !current)}
                >
                  {showAllSolved ? "Collapse" : "Show all"}
                </button>
              ) : null}
            </div>

            {visibleSolved.length ? (
              <div className="space-y-3">
                {visibleSolved.map((problem) => (
                  <div
                    key={problem.problemId}
                    className="card-surface flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] p-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {problem.title}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          ID {problem.problemCode}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            difficultyColors[problem.difficulty] ||
                            "bg-white/10 text-slate-300"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">
                      {new Date(problem.solvedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent activity yet"
                description="Accepted problems will appear here."
              />
            )}
          </SectionCard>

          {profile.malpractice.length ? (
            <SectionCard title="Malpracticed Questions">
              <div className="space-y-3">
                {profile.malpractice.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-[1.5rem] bg-rose-500/10 p-4 text-rose-200"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      <p className="font-semibold">{entry.title}</p>
                    </div>
                    <p className="mt-2 text-sm">
                      ID {entry.problemCode} · {entry.difficulty}
                    </p>
                    <p className="mt-2 text-sm">Reason: {entry.reason}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;



