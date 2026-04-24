import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const defaultRegister = {
  email: "",
  registrationNumber: "",
  password: "",
  department: "",
  year: 1,
  role: "STUDENT",
};

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(defaultRegister);
  const [error, setError] = useState("");
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-700/50 via-slate-900 to-orange-500/30 p-8 shadow-glow">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-100">College-exclusive coding arena</p>
          <h1 className="mt-4 max-w-xl font-display text-5xl font-bold leading-tight text-white">
            Competitive coding, placement prep, and department wars in one campus platform.
          </h1>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Daily coding problems with hidden test evaluation",
              "Live departmental leaderboards and weekly contests",
              "Mock placement tests plus senior interview archives",
              "Fitness and nutrition suggestions for student routines",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
          <div className="mb-6 flex gap-2 rounded-full bg-white/5 p-1">
            {["login", "register"].map((item) => (
              <button
                key={item}
                type="button"
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
                  mode === item ? "bg-brand-500 text-white" : "text-slate-300"
                }`}
                onClick={() => setMode(item)}
              >
                {item === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              placeholder="College email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
            {mode === "register" ? (
              <>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 uppercase outline-none"
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
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                  placeholder="Department"
                  value={form.department}
                  onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
                />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                  placeholder="Year"
                  type="number"
                  min="1"
                  max="6"
                  value={form.year}
                  onChange={(event) => setForm((current) => ({ ...current, year: Number(event.target.value) }))}
                />
                <select
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, role: event.target.value }))
                  }
                >
                  <option value="STUDENT">Student</option>
                </select>
              </>
            ) : null}
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white disabled:opacity-70"
            >
              {loading ? "Please wait..." : mode === "login" ? "Enter CampusArena" : "Create account"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AuthPage;
