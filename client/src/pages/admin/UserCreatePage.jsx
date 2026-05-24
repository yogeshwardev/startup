import { FileDown, FileUp, RefreshCcw, Upload, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useToast } from "../../hooks/useToast";

const defaultNewUser = {
  email: "",
  registrationNumber: "",
  password: "",
  role: "STUDENT",
  department: "",
  year: 1,
};

const generateStrongPassword = () => {
  const charset =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  return Array.from({ length: 12 }, () =>
    charset[Math.floor(Math.random() * charset.length)]
  ).join("");
};

const validateEmail = (email) =>
  /@([a-z0-9-]+\.)+(edu|edu\.[a-z]{2,}|ac\.[a-z]{2,})$/i.test(email);

const validatePassword = (password) =>
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);

const parseBulkUsers = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (line, index) =>
        !(
          index === 0 &&
          line.toLowerCase() ===
            "email,registrationnumber,password,department,year,role"
        )
    )
    .map((line) => {
      const [email, registrationNumber, password, department, year, role] =
        line.split(",").map((item) => item.trim());

      return {
        email,
        registrationNumber,
        password,
        department,
        year: Number(year),
        role: role?.toUpperCase(),
      };
    });

const UserCreatePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [newUser, setNewUser] = useState(defaultNewUser);
  const [departments, setDepartments] = useState([]);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkFileName, setBulkFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      const { data } = await http.get("/departments");
      setDepartments(data);
      setNewUser((current) => ({
        ...current,
        department: current.department || data[0]?.name || "",
      }));
    };

    loadDepartments();
  }, []);

  const bulkPreview = useMemo(() => parseBulkUsers(bulkInput), [bulkInput]);

  const validateManualUser = () => {
    if (!validateEmail(newUser.email)) {
      toast.error("Invalid college email", "Use a valid academic email address.");
      return false;
    }

    if (!newUser.registrationNumber.trim()) {
      toast.error(
        newUser.role === "TEACHER" ? "Teacher ID required" : "Registration number required",
        newUser.role === "TEACHER" ? "Enter a valid Teacher ID." : "Enter a valid registration number."
      );
      return false;
    }

    if (!validatePassword(newUser.password)) {
      toast.error(
        "Weak password",
        "Include uppercase, lowercase, number, symbol, and at least 8 characters."
      );
      return false;
    }

    return true;
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (!validateManualUser()) {
      return;
    }

    try {
      setSubmitting(true);
      await http.post("/users", newUser);
      toast.success(
        "User created",
        `${newUser.registrationNumber} has been added successfully.`
      );
      navigate("/admin/users");
    } catch (error) {
      toast.error(
        "Creation failed",
        error.response?.data?.message || "Unable to create user."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkCreate = async () => {
    const users = parseBulkUsers(bulkInput);

    if (!users.length) {
      toast.error("No users found", "Paste at least one user row before uploading.");
      return;
    }

    const invalidRow = users.find(
      (entry) =>
        !validateEmail(entry.email) ||
        !entry.registrationNumber ||
        !validatePassword(entry.password) ||
        !entry.department ||
        !entry.role ||
        !Number.isInteger(entry.year) ||
        entry.year < 1 ||
        entry.year > 6
    );

    if (invalidRow) {
      toast.error(
        "Invalid bulk row",
        "Each row must be email, registration number, password, department, year, role."
      );
      return;
    }

    try {
      setBulkSubmitting(true);
      const { data } = await http.post("/users/bulk", { users });
      toast.success(
        "Bulk users created",
        `${data.createdCount} users were added successfully.`
      );
      navigate("/admin/users");
    } catch (error) {
      toast.error(
        "Bulk upload failed",
        error.response?.data?.message || "Unable to create users in bulk."
      );
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleBulkFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      setBulkInput(content);
      setBulkFileName(file.name);
    } catch (_error) {
      toast.error("Unable to read file", "Please upload a valid CSV file.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin user management"
        title="Create users"
        description="Add a single account manually or create many accounts in one bulk upload."
        action={
          <Link
            to="/admin/users"
            className="rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--text-primary)] dark:bg-white"
          >
            Back to users
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          title="Manual user creation"
          action={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
              onClick={() =>
                setNewUser((current) => ({
                  ...current,
                  password: generateStrongPassword(),
                }))
              }
            >
              <RefreshCcw className="h-4 w-4" />
              Generate password
            </button>
          }
        >
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateUser}>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                College email
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
                value={newUser.email}
                onChange={(event) =>
                  setNewUser((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="student@college.edu"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {newUser.role === "TEACHER" ? "Teacher ID" : "Registration number"}
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none uppercase dark:border-white/10 dark:bg-white/5"
                value={newUser.registrationNumber}
                onChange={(event) =>
                  setNewUser((current) => ({
                    ...current,
                    registrationNumber: event.target.value.toUpperCase(),
                  }))
                }
                placeholder={newUser.role === "TEACHER" ? "T12345" : "23CSE1021"}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Temporary password
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
                value={newUser.password}
                onChange={(event) =>
                  setNewUser((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Use a strong temporary password"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Department
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
                value={newUser.department}
                onChange={(event) =>
                  setNewUser((current) => ({ ...current, department: event.target.value }))
                }
              >
                {departments.map((department) => (
                  <option key={department._id} value={department.name}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
            {newUser.role !== "TEACHER" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Year
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
                  type="number"
                  min="1"
                  max="6"
                  value={newUser.year}
                  onChange={(event) =>
                    setNewUser((current) => ({
                      ...current,
                      year: Number(event.target.value),
                    }))
                  }
                />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
                value={newUser.role}
                onChange={(event) =>
                  setNewUser((current) => ({ ...current, role: event.target.value }))
                }
              >
                <option value="ADMIN">Admin</option>
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--text-primary)] disabled:opacity-70 dark:bg-white md:col-span-2"
            >
              <UserPlus className="h-4 w-4" />
              {submitting ? "Creating..." : "Create user"}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Bulk user creation"
          action={
            <div className="flex flex-wrap gap-2">
              <a
                href="/samples/bulk-users-template.csv"
                download
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10"
              >
                <FileDown className="h-4 w-4" />
                Sample CSV
              </a>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
                onClick={handleBulkCreate}
                disabled={bulkSubmitting}
              >
                <FileUp className="h-4 w-4" />
                {bulkSubmitting ? "Uploading..." : "Create bulk users"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-6 text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-500 dark:border-white/10">
              <Upload className="h-4 w-4" />
              <span>
                {bulkFileName ? `Loaded ${bulkFileName}` : "Upload CSV file"}
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleBulkFileChange}
              />
            </label>

            {bulkPreview.length ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  {bulkPreview.length} users ready for upload.
                </p>
                <div className="space-y-2">
                  {bulkPreview.slice(0, 5).map((entry, index) => (
                    <div
                      key={`${entry.email}-${index}`}
                      className="card-surface flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-slate-900">
                        {entry.registrationNumber || "Missing registration number"}
                      </span>
                      <span className="text-slate-500">
                        {entry.email || "Missing email"} · {entry.department || "No dept"} ·{" "}
                        {entry.role || "No role"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No bulk users yet"
                description="Upload a CSV file using email, registration number, password, department, year, role."
              />
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default UserCreatePage;



