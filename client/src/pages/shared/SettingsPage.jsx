import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Workspace preferences" description="A focused control area for appearance, identity details, and future panel-level preferences." />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Appearance">
          <div className="app-muted rounded-[1.75rem] p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Current theme</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{theme === "dark" ? "Dark mode" : "Light mode"}</h3>
            <button type="button" className="mt-4 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white" onClick={toggleTheme}>
              Toggle theme
            </button>
          </div>
        </SectionCard>
        <SectionCard title="Account context">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="app-muted rounded-[1.75rem] p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            </div>
            <div className="app-muted rounded-[1.75rem] p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Role</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{user?.role}</p>
            </div>
            <div className="app-muted rounded-[1.75rem] p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Department</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{user?.department}</p>
            </div>
            <div className="app-muted rounded-[1.75rem] p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Year</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{user?.year}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default SettingsPage;
