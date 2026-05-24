import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, Code2, Trophy, Target, Sparkles, CheckCircle2, XCircle, ChevronRight, Mail, Phone, Shield, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const defaultRegister = {
  email: "",
  registrationNumber: "",
  password: "",
  department: "",
  year: 1,
  role: "STUDENT",
  phone: "",
};

const LandingPage = () => {
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
    <div className="min-h-screen bg-surface text-gray-100 font-display selection:bg-brand-500/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-border/50 bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-8 h-8 text-brand-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-emerald-300 bg-clip-text text-transparent">
              CampusArena
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => handleOpenAuth('login')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Log in
            </button>
            <button onClick={() => handleOpenAuth('register')} className="text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-all shadow-glow-sm hover:shadow-glow">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Your Journey to Tech Excellence Starts Here</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            Learn. Grow. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">Upskill.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Master coding, crack placements, and compete with peers in a powerful environment built for the modern student. Stop just reading, start building.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => handleOpenAuth('register')} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-glow hover:scale-105">
              Start Learning Now
              <ChevronRight className="w-5 h-5" />
            </button>
            <a href="#pricing" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-surface-200 hover:bg-surface-300 text-white px-8 py-4 rounded-xl font-medium transition-colors border border-border">
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-surface-50 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-400">Integrated tools designed specifically for students to ace their tech journey.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Code2,
                title: "Advanced Compiler",
                desc: "Write, test, and debug code in multiple languages right from your browser.",
              },
              {
                icon: Target,
                title: "Placement Preparation",
                desc: "Company-specific questions and timed mock tests to make you interview-ready.",
              },
              {
                icon: Trophy,
                title: "Department Wars",
                desc: "Compete on leaderboards and prove your department is the best on campus.",
              },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-surface border border-border hover:border-brand-500/30 transition-colors shadow-card group">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Invest in Your Future</h2>
            <p className="text-gray-400">Choose the plan that fits your graduation timeline. Unlimited access.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* 6 Months Plan */}
            <div className="rounded-3xl bg-surface-100 border border-border p-8 hover:border-brand-500/20 transition-all flex flex-col shadow-card">
              <h3 className="text-xl font-medium text-gray-300 mb-2">Semester Pass</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold">₹499</span>
                <span className="text-gray-500">/ 6 months</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Full Platform Access', 'Placement Mock Tests', 'Daily Coding Challenges', 'Leaderboard Participation'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => handleOpenAuth('register')} className="w-full text-center py-3 rounded-xl bg-surface-200 hover:bg-surface-300 font-medium transition-colors border border-border">
                Choose Plan
              </button>
            </div>

            {/* 12 Months Plan (Popular) */}
            <div className="rounded-3xl bg-surface-50 border-2 border-brand-500 p-8 transform md:-translate-y-4 shadow-glow flex flex-col relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-500 text-white px-4 py-1 rounded-full text-sm font-medium tracking-wide">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-medium text-brand-400 mb-2">Yearly Pass</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-white">₹799</span>
                <span className="text-gray-400">/ 12 months</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Everything in Semester Pass', 'Priority Support', 'Advanced Analytics', 'Resume Building Tools'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />
                    <span className="text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => handleOpenAuth('register')} className="w-full text-center py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium transition-all shadow-glow-sm hover:shadow-glow">
                Get Yearly Pass
              </button>
            </div>

            {/* 3 Years Plan */}
            <div className="rounded-3xl bg-surface-100 border border-border p-8 hover:border-brand-500/20 transition-all flex flex-col shadow-card">
              <h3 className="text-xl font-medium text-gray-300 mb-2">Graduation Pass</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold">₹1799</span>
                <span className="text-gray-500">/ 3 years</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Everything in Yearly Pass', 'Lifetime Profile Access', 'Alumni Network Access', '1-on-1 Mentorship Sessions'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="w-full text-center py-3 rounded-xl bg-surface-200 hover:bg-surface-300 font-medium transition-colors border border-border">
                Choose Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-50 border-t border-border/50 pt-16 pb-8 px-4 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand & Contact */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Terminal className="w-8 h-8 text-brand-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-emerald-300 bg-clip-text text-transparent">
                CampusArena
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Contact Us</h4>
                <a href="mailto:yogeshwarnd.dev@gmail.com" className="flex items-center gap-2 text-gray-400 hover:text-brand-400 transition-colors text-sm">
                  <Mail className="w-4 h-4" /> yogeshwarnd.dev@gmail.com
                </a>
                <p className="flex items-center gap-2 text-gray-400 mt-2 text-sm">
                  <Phone className="w-4 h-4" /> +91 7569363309
                </p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Registered Office</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  CC Solutions, Chittoor<br />
                  Andhra Pradesh<br />
                  India - 517001
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Contact Us', path: 'mailto:yogeshwarnd.dev@gmail.com' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Refund Policy', path: '/refund' },
                { name: 'Blog', path: '#' }
              ].map((link, i) => (
                <li key={i}>
                  {link.path.startsWith('mailto:') ? (
                    <a href={link.path} className="text-gray-400 hover:text-brand-400 transition-colors text-sm flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-brand-500" /> {link.name}
                    </a>
                  ) : (
                    <Link to={link.path} className="text-gray-400 hover:text-brand-400 transition-colors text-sm flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-brand-500" /> {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Programs & Offerings */}
          <div>
            <h3 className="text-white font-semibold mb-6">Our Programs</h3>
            <ul className="space-y-3">
              {[
                'Semester Pass (6 Months)',
                'Yearly Pass (12 Months)',
                'Graduation Pass (3 Years)',
                'Placement Preparation',
                'Guaranteed Interview Track'
              ].map((link, i) => (
                <li key={i}>
                  <Link to="#" className="text-gray-400 hover:text-brand-400 transition-colors text-sm flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-brand-500" /> {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Features */}
          <div>
            <h3 className="text-white font-semibold mb-6">Features & Tools</h3>
            <ul className="space-y-3">
              {[
                'Advanced Code Compiler',
                'Company Specific Mock Tests',
                'Daily Coding Challenges',
                'Department Wars',
                'Alumni Network'
              ].map((link, i) => (
                <li key={i}>
                  <Link to="#" className="text-gray-400 hover:text-brand-400 transition-colors text-sm flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-brand-500" /> {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal Footer Bottom */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-border/30 flex flex-col items-center">
          <p className="font-bold text-gray-400 text-center mb-2">
            © {new Date().getFullYear()} CC Solutions. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 text-center flex flex-col sm:flex-row items-center gap-1 justify-center mb-4">
            <Shield className="w-4 h-4 hidden sm:block" /> 
            <span>Governed by the laws of India. Jurisdiction: Chittoor, Andhra Pradesh.</span>
          </p>
          <p className="text-xs text-gray-600 text-center max-w-4xl mx-auto">
            This platform collects data to improve your experience. By using this website, you agree to our terms of service and acknowledge that any misuse of our intellectual property may result in strict legal action under the Information Technology Act.
          </p>
        </div>
      </footer>

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
                placeholder="College email "
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
                    placeholder="Phone number"
                    type="tel"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
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

export default LandingPage;
