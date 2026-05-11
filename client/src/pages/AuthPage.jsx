import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { X, GraduationCap, ArrowRight, Code2, Trophy, Users, BookOpen, Target } from "lucide-react";

const defaultRegister = {
  email: "",
  registrationNumber: "",
  password: "",
  department: "",
  year: 1,
  role: "STUDENT",
};

const AuthPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(defaultRegister);
  const [error, setError] = useState("");
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleOpenAuth = (authMode) => {
    setMode(authMode);
    setShowAuthModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Authentication failed.");
    }
  };

  return (
    <div className="min-h-screen font-body overflow-x-hidden" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Subtle product backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgba(47, 158, 68, 0.055) 0%, transparent 260px)"
        }}
      />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-[1200px] mx-auto w-full md:px-10 lg:px-14">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-[var(--text-primary)]" strokeWidth={2} />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">CampusArena</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleOpenAuth("login")}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/[0.04]"
            style={{ color: "var(--text-secondary)" }}>
            Login
          </button>
          <button onClick={() => handleOpenAuth("register")}
            className="btn-primary px-5 py-2.5 text-sm">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-[1200px] mx-auto px-6 py-14 md:py-18 md:px-10 lg:px-14 grid lg:grid-cols-[0.92fr_1.08fr] gap-10 lg:gap-14 items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-brand-400 animate-slide-up"
            style={{ background: "rgba(47, 158, 68, 0.12)", border: "1px solid rgba(81, 207, 102, 0.18)" }}>
            <GraduationCap className="w-3.5 h-3.5" />
            Coding, contests, placements
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-[4.1rem] font-extrabold leading-[1.08] tracking-tight animate-slide-up" style={{ animationDelay: "100ms" }}>
            CampusArena <br/>
            for serious <br/>
            <span className="gradient-text">coding prep.</span>
          </h1>

          <p className="text-base leading-relaxed max-w-lg font-medium animate-slide-up" style={{ animationDelay: "200ms", color: "var(--text-secondary)" }}>
            A dark, focused practice platform for problems, contests, submissions, mock tests, placement preparation, and role-based admin controls.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <button onClick={() => handleOpenAuth("register")}
              className="group btn-primary px-7 py-3.5 font-bold flex items-center gap-2 text-[15px]">
              Start practicing
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => handleOpenAuth("login")}
              className="btn-secondary px-7 py-3.5 font-bold text-[15px]">
              Login
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-8 pt-2 animate-slide-up" style={{ animationDelay: "400ms" }}>
            {[
              { icon: Code2, value: "500+", label: "Problems" },
              { icon: Trophy, value: "50+", label: "Contests" },
              { icon: Users, value: "10K+", label: "Students" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5">
                <stat.icon className="w-4 h-4 text-brand-400" strokeWidth={1.8} />
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
                  <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="relative z-10 lg:pl-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Code2, title: "Problem Bank", desc: "LeetCode-style practice workspace", color: "text-brand-400", bg: "bg-brand-500/10" },
              { icon: Trophy, title: "Live Contests", desc: "Ranked campus coding rounds", color: "text-brand-400", bg: "bg-brand-500/10" },
              { icon: Target, title: "Placement Prep", desc: "Company-wise preparation flow", color: "text-brand-400", bg: "bg-brand-500/10" },
              { icon: BookOpen, title: "Admin Control", desc: "Manage users, tests, and content", color: "text-brand-400", bg: "bg-brand-500/10" },
            ].map((feat) => (
              <div key={feat.title} className="card-interactive p-5 hover-lift">
                <div className={`w-10 h-10 rounded-md ${feat.bg} flex items-center justify-center mb-3`}>
                  <feat.icon className={`w-5 h-5 ${feat.color}`} strokeWidth={1.8} />
                </div>
                <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>{feat.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}>
          <div className="relative w-full max-w-md rounded-xl p-7 animate-scale-in"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5)",
            }}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-white/[0.06]"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold font-display" style={{ color: "var(--text-primary)" }}>
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {mode === "login" ? "Enter your details to access your dashboard" : "Join CampusArena today"}
              </p>
            </div>

            <div className="mb-5 flex gap-1 rounded-lg p-1" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)" }}>
              {["login", "register"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                    mode === item ? "bg-brand-500 text-[var(--text-primary)]" : "hover:text-[var(--text-primary)]"
                  }`}
                  style={mode !== item ? { color: "var(--text-secondary)" } : {}}
                  onClick={() => setMode(item)}
                >
                  {item === "login" ? "Login" : "Register"}
                </button>
              ))}
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <input
                className="w-full input-field px-4 py-3 text-sm"
                placeholder="College email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
              <input
                className="w-full input-field px-4 py-3 text-sm"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
              {mode === "register" && (
                <>
                  <input
                    className="w-full input-field px-4 py-3 uppercase text-sm"
                    placeholder="Registration number"
                    value={form.registrationNumber}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        registrationNumber: event.target.value.toUpperCase(),
                      }))
                    }
                  />
                  <input
                    className="w-full input-field px-4 py-3 text-sm"
                    placeholder="Department"
                    value={form.department}
                    onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="w-full input-field px-4 py-3 text-sm"
                      placeholder="Year"
                      type="number"
                      min="1"
                      max="6"
                      value={form.year}
                      onChange={(event) => setForm((current) => ({ ...current, year: Number(event.target.value) }))}
                    />
                    <select
                      className="w-full input-field px-4 py-3 text-sm appearance-none"
                      value={form.role}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, role: event.target.value }))
                      }
                    >
                      <option value="STUDENT">Student</option>
                    </select>
                  </div>
                </>
              )}
              {error && (
                <p className="text-sm text-rose-400 p-3 rounded-lg"
                  style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary px-4 py-3 text-sm font-bold disabled:opacity-70 mt-1"
              >
                {loading ? "Please wait..." : mode === "login" ? "Enter CampusArena" : "Create account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;



