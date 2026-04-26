import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  ChevronLeft,
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
    { to: "/placement", label: "Placement", icon: Briefcase },
    { to: "/department-war", label: "Department War", icon: Building2 },
  ],
  TEACHER: [
    { to: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "Profile", icon: Users },
    { to: "/teacher/users", label: "Users", icon: Users },
    { to: "/teacher/students", label: "Progress", icon: BarChart3 },
    { to: "/teacher/departments", label: "Departments", icon: Building2 },
    { to: "/teacher/problems", label: "Problems", icon: BookOpen },
    { to: "/teacher/mock-tests", label: "Mock Tests", icon: ShieldCheck },
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
    { to: "/admin/mock-tests", label: "Mock Tests", icon: ShieldCheck },
    { to: "/admin/placement/companies", label: "Placement Companies", icon: Briefcase },
    { to: "/admin/placement/questions", label: "Placement Questions", icon: BookOpen },
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* Top Navigation */}
      <header className="app-surface sticky top-3 z-40 mx-3 rounded-xl shadow-sm">
        <div className="px-5 py-3.5">
          {/* Logo and Workspace */}
          <div className="flex items-center justify-between gap-4 mb-3.5">
            <Link
              to="/"
              className="font-display text-xl font-bold text-slate-900 dark:text-white flex-shrink-0"
            >
              CampusArena
            </Link>
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                className="app-muted rounded-lg p-2.5"
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-amber-300" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600" />
                )}
              </button>
              <div className="relative">
                <button
                  type="button"
                  className="app-muted flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                  onClick={() => setProfileOpen((current) => !current)}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                    {user?.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-900 dark:text-white">
                    {user?.name}
                  </span>
                </button>

                {profileOpen ? (
                  <div className="app-surface absolute right-0 top-[calc(100%+0.5rem)] z-[70] w-56 rounded-xl p-3 shadow-lg">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {user?.department} • Year {user?.year}
                    </p>
                    <Link
                      to={user?.id ? `/profile/${user.id}` : "/profile"}
                      className="mt-3 block w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-center text-sm font-medium text-slate-700 dark:border-white/10 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                      onClick={() => setProfileOpen(false)}
                    >
                      View Profile
                    </Link>
                    <button
                      type="button"
                      className="mt-2 w-full rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              className="md:hidden rounded-full p-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Workspace Card */}
          <div className="mb-4 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 border border-slate-200 dark:border-slate-700">
            <p className="text-xs uppercase tracking-widest font-semibold text-slate-600 dark:text-slate-400">
              {user?.role} • {user?.role === "ADMIN"
                ? "Control Center"
                : user?.role === "TEACHER"
                  ? "Faculty Desk"
                  : "Student Arena"}
            </p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-wrap gap-1.5 overflow-x-auto pb-2">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition whitespace-nowrap ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
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
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] p-3 md:p-4">
        <main className="min-h-[calc(100vh-200px)]">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
