import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const roleNavigation = {
  STUDENT: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "Profile", icon: Users },
    { to: "/problems", label: "Problems", icon: BookOpen },
    { to: "/contest", label: "Contests", icon: ShieldCheck },
    { to: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
    { to: "/department-war", label: "Department War", icon: Building2 },
  ],
  TEACHER: [
    { to: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "Profile", icon: Users },
    { to: "/teacher/users", label: "Users", icon: Users },
    { to: "/teacher/students", label: "Progress", icon: BarChart3 },
    { to: "/teacher/departments", label: "Departments", icon: Building2 },
    { to: "/teacher/problems", label: "Problems", icon: BookOpen },
    { to: "/teacher/settings", label: "Settings", icon: Settings },
  ],
  ADMIN: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "Profile", icon: Users },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/departments", label: "Departments", icon: Building2 },
    { to: "/admin/problems", label: "Problems", icon: BookOpen },
    { to: "/admin/problems/existing", label: "Existing Problems", icon: BookOpen },
    { to: "/admin/contests", label: "Contests", icon: ShieldCheck },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const links = roleNavigation[user?.role] || [];
  const currentPage = useMemo(
    () =>
      [...links]
        .sort((left, right) => right.to.length - left.to.length)
        .find(
          (item) =>
            location.pathname === item.to ||
            location.pathname.startsWith(`${item.to}/`)
        )?.label || "Dashboard",
    [links, location.pathname]
  );

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 p-3 md:p-4">
        <aside
          className={`app-surface fixed inset-y-3 left-3 z-40 w-[280px] rounded-[2rem] p-5 transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
          }`}
        >
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="font-display text-2xl font-bold text-slate-900 dark:text-white"
            >
              CampusArena
            </Link>
            <button
              type="button"
              className="rounded-full p-2 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-slate-500 dark:text-slate-300" />
            </button>
          </div>

          <div className="mt-8 rounded-[1.75rem] bg-brand-500 px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.25em] text-brand-100">
              Workspace
            </p>
            <p className="mt-3 text-xl font-semibold">
              {user?.role === "ADMIN"
                ? "Control Center"
                : user?.role === "TEACHER"
                  ? "Faculty Desk"
                  : "Student Arena"}
            </p>
            <p className="mt-2 text-sm text-brand-100">
              {user?.role === "ADMIN"
                ? "Manage users, problems, contests, and analytics."
                : user?.role === "TEACHER"
                  ? "Monitor students and coordinate preparation."
                  : "Solve, compete, and climb the leaderboard."}
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-600 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-white/5"
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col gap-4">
          <header className="app-surface relative z-30 overflow-visible rounded-[2rem] px-4 py-4 md:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-full p-2 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
                    {user?.role} portal
                  </p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {currentPage}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="app-muted flex items-center gap-3 rounded-2xl px-4 py-3">
                  <LayoutDashboard className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    placeholder="Search workspace"
                  />
                </div>
                <button
                  type="button"
                  className="app-muted rounded-2xl p-3"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 text-amber-300" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-600" />
                  )}
                </button>
                <button type="button" className="app-muted rounded-2xl p-3">
                  <Bell className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                </button>
                <button
                  type="button"
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <div className="relative z-40">
                  <button
                    type="button"
                    className="app-muted flex items-center gap-3 rounded-2xl px-4 py-3"
                    onClick={() => setProfileOpen((current) => !current)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white dark:bg-brand-500">
                      {user?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="hidden text-left md:block">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                  </button>

                  {profileOpen ? (
                    <div className="app-surface absolute right-0 top-[calc(100%+0.75rem)] z-[70] w-64 rounded-3xl p-4 shadow-2xl">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {user?.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {user?.department} · Year {user?.year}
                      </p>
                      <Link
                        to={user?.id ? `/profile/${user.id}` : "/profile"}
                        className="mt-4 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
                        onClick={() => setProfileOpen(false)}
                      >
                        My profile
                      </Link>
                      <button
                        type="button"
                        className="mt-3 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
                        onClick={handleLogout}
                      >
                        Sign out
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
