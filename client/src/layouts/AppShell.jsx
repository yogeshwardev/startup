import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
  LogOut,
  Bell,
  Code2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Megaphone
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const roleNavigation = {
  STUDENT: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/problems", label: "Problems", icon: Code2 },
    { to: "/compiler", label: "Compiler", icon: Code2 },
    { to: "/submissions", label: "Submissions", icon: BookOpen },
    { to: "/contest", label: "Contests", icon: ShieldCheck },
    { to: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
    { to: "/department-war", label: "Department War", icon: Building2 },
    { to: "/placement", label: "Placement Hub", icon: Briefcase },
    { to: "/profile", label: "Profile", icon: Users },
  ],
  TEACHER: [
    { to: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "Profile", icon: Users },
    { to: "/teacher/users", label: "Users", icon: Users },
    { to: "/teacher/students", label: "Progress", icon: BarChart3 },
    { to: "/teacher/announcements", label: "Announcements", icon: Megaphone },
    { to: "/teacher/departments", label: "Departments", icon: Building2 },
    { to: "/teacher/problems", label: "Problems", icon: BookOpen },
    { to: "/teacher/mock-tests", label: "Mock Tests", icon: ShieldCheck },
    { to: "/teacher/settings", label: "Settings", icon: Settings },
  ],
  ADMIN: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "Profile", icon: Users },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { to: "/admin/departments", label: "Departments", icon: Building2 },
    { to: "/admin/problems", label: "Problems", icon: BookOpen },
    { to: "/admin/contests", label: "Contests", icon: ShieldCheck },
    { to: "/admin/mock-tests", label: "Mock Tests", icon: ShieldCheck },
    { to: "/admin/placement/companies", label: "Placement Companies", icon: Briefcase },
    { to: "/admin/placement/questions", label: "Placement Questions", icon: BookOpen },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links = roleNavigation[user?.role || "STUDENT"] || [];
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

  const userInitials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "CA";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══ Sidebar ═══ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex-shrink-0 flex flex-col transition-all duration-300 ease-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-[68px]" : "w-[240px]"}`}
        style={{
          background: "var(--bg-shell)",
          borderRight: "1px solid var(--border-default)",
        }}
      >
        {/* Logo */}
        <div className={`h-[64px] flex items-center shrink-0 ${isCollapsed ? "justify-center px-0" : "justify-between px-5"}`}
          style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            </div>
            {!isCollapsed && (
              <span className="font-display font-bold text-[15px] tracking-tight" style={{ color: "var(--text-primary)" }}>
                CampusArena
              </span>
            )}
          </Link>
          {!isCollapsed && (
            <button className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg transition-all"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
              onClick={() => setIsCollapsed(true)}>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <button className="lg:hidden transition" style={{ color: "var(--text-muted)" }} onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className={`flex-1 overflow-y-auto py-3 space-y-0.5 ${isCollapsed ? "px-2" : "px-3"}`}>
          {isCollapsed && (
            <button
              className="hidden lg:flex w-full items-center justify-center py-2 mb-2 rounded-lg transition-all"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
              onClick={() => setIsCollapsed(false)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={isCollapsed ? item.label : undefined}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-lg py-2.5 text-[13px] font-medium transition-all duration-200 overflow-hidden whitespace-nowrap ${
                    isCollapsed ? "justify-center px-0" : "gap-3 px-3"
                  } ${
                    isActive
                      ? "text-brand-400"
                      : ""
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? "rgba(47, 158, 68, 0.12)" : "transparent",
                  color: isActive ? undefined : "var(--text-secondary)",
                })}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-brand-500" />
                    )}
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="p-3 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
            className={`flex items-center rounded-lg py-2.5 text-[13px] font-medium text-rose-400 hover:bg-rose-500/10 transition-all ${
              isCollapsed ? "justify-center px-0 w-full" : "gap-3 px-3 w-full"
            }`}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ═══ Main Content Area ═══ */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-[64px] flex-shrink-0" style={{ borderBottom: "1px solid var(--border-default)", background: "rgba(17, 19, 24, 0.94)" }}>
          <div className="flex items-center justify-between h-full px-5 lg:px-7">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-0.5" style={{ color: "var(--text-muted)" }}>
                  Campus Learning Platform
                </p>
                <h2 className="text-base font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {getGreeting()}, <span className="text-brand-400">{user?.name || user?.email || "Student"}</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              {/* Notification Bell */}
              <button className="relative w-9 h-9 flex items-center justify-center transition-all rounded-lg hover:bg-white/[0.04]"
                style={{ color: "var(--text-secondary)" }}>
                <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-500 rounded-full" />
              </button>

              {/* Profile Pill */}
              <div className="relative">
                <button
                  className="flex items-center gap-2.5 rounded-lg pl-1 pr-3 py-1 cursor-pointer transition-all hover:bg-white/[0.04]"
                  style={{ border: "1px solid var(--border-default)" }}
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-[10px] font-bold text-white">
                    {userInitials}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-[12px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>{user?.name || user?.email}</span>
                    <span className="text-[10px] font-medium leading-tight" style={{ color: "var(--text-muted)" }}>
                      {user?.role || "STUDENT"} · {user?.department || "CSE"}
                    </span>
                  </div>
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+6px)] w-52 rounded-xl p-3 z-[70] animate-scale-in"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      boxShadow: "0 16px 48px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{user?.name || user?.email}</p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>{user?.department} · Year {user?.year}</p>
                    <div className="my-2.5" style={{ borderTop: "1px solid var(--border-subtle)" }} />
                    <Link
                      to={user?.id ? `/profile/${user.id}` : "/profile"}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-all hover:bg-white/[0.04]"
                      style={{ color: "var(--text-secondary)" }}
                      onClick={() => setProfileOpen(false)}
                    >
                      View Profile
                    </Link>
                    <button
                      type="button"
                      className="mt-0.5 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
