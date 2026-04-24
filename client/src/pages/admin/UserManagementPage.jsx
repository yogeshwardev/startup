import {
  ChevronLeft,
  ChevronRight,
  Eye,
  KeyRound,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import Skeleton from "../../components/Skeleton";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

const defaultFilters = {
  search: "",
  role: "",
  department: "",
  year: "",
  status: "",
};

const availablePermissions = [
  "manage-users",
  "assign-problems",
  "view-analytics",
  "reset-passwords",
];

const generateStrongPassword = () => {
  const charset =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  return Array.from({ length: 12 }, () =>
    charset[Math.floor(Math.random() * charset.length)]
  ).join("");
};

const validatePassword = (password) =>
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);

const UserManagementPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === "ADMIN";
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tableBusy, setTableBusy] = useState(false);

  const loadDepartments = async () => {
    const { data } = await http.get("/departments");
    setDepartments(data);
  };

  const loadUsers = async (page = pagination.page) => {
    setTableBusy(true);

    try {
      const { data } = await http.get("/users", {
        params: {
          page,
          limit: pagination.limit,
          sortBy,
          sortOrder,
          ...filters,
        },
      });

      setUsers(data.items);
      setPagination(data.pagination);
      setSelectedIds([]);
    } finally {
      setLoading(false);
      setTableBusy(false);
    }
  };

  const loadSupportingData = async () => {
    try {
      const requests = [loadDepartments(), loadUsers(1)];

      if (isAdmin) {
        requests.push(
          http.get("/analytics").then((response) => setAnalytics(response.data))
        );
        requests.push(
          http
            .get("/audit-logs", { params: { limit: 6 } })
            .then((response) => setAuditLogs(response.data))
        );
      }

      await Promise.all(requests);
    } catch (error) {
      toast.error(
        "Unable to load dashboard",
        error.response?.data?.message || "Please refresh and try again."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupportingData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadUsers(1);
    }
  }, [filters, sortBy, sortOrder]);

  const selectedUsers = useMemo(
    () => users.filter((entry) => selectedIds.includes(entry._id)),
    [selectedIds, users]
  );

  const upsertUserInList = (nextUser) => {
    setUsers((current) =>
      current.map((entry) => (entry._id === nextUser._id ? nextUser : entry))
    );
  };

  const handleUpdateUser = async () => {
    try {
      setSubmitting(true);
      const { data } = await http.put(`/users/${editingUser._id}`, editingUser);
      toast.success("User updated", `${data.name} has been updated.`);
      setEditingUser(null);
      upsertUserInList(data);
      await loadUsers(pagination.page);
      if (isAdmin) {
        await http
          .get("/audit-logs", { params: { limit: 6 } })
          .then((response) => setAuditLogs(response.data));
      }
    } catch (error) {
      toast.error(
        "Update failed",
        error.response?.data?.message || "Unable to update user."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setSubmitting(true);
      await http.delete(`/users/${deleteTarget._id}`);
      toast.success("User deleted", `${deleteTarget.name} was removed.`);
      setDeleteTarget(null);
      await loadUsers(pagination.page);
    } catch (error) {
      toast.error(
        "Delete failed",
        error.response?.data?.message || "Unable to delete user."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setTableBusy(true);
      await http.post("/users/bulk-delete", { ids: selectedIds });
      toast.success(
        "Users deleted",
        `${selectedIds.length} selected users were removed.`
      );
      await loadUsers(pagination.page);
    } catch (error) {
      toast.error(
        "Bulk delete failed",
        error.response?.data?.message || "Unable to delete selected users."
      );
    } finally {
      setTableBusy(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword(resetPasswordValue)) {
      toast.error(
        "Weak password",
        "Reset password must meet strength requirements."
      );
      return;
    }

    try {
      setSubmitting(true);
      await http.patch(`/users/${resetTarget._id}/password`, {
        password: resetPasswordValue,
      });
      toast.success(
        "Password reset",
        `Password was reset for ${resetTarget.name}.`
      );
      setResetTarget(null);
      setResetPasswordValue("");
    } catch (error) {
      toast.error(
        "Reset failed",
        error.response?.data?.message || "Unable to reset password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (entry) => {
    try {
      const { data } = await http.put(`/users/${entry._id}`, {
        isBlocked: !entry.isBlocked,
      });
      upsertUserInList(data);
      toast.success(
        "Status updated",
        `${data.name} is now ${data.isBlocked ? "blocked" : "active"}.`
      );
    } catch (error) {
      toast.error(
        "Status update failed",
        error.response?.data?.message || "Unable to update status."
      );
    }
  };

  const onSort = (column) => {
    if (sortBy === column) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(column);
    setSortOrder("asc");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isAdmin ? "Admin user management" : "Teacher user management"}
        title={
          isAdmin
            ? "Professional user operations dashboard"
            : "Student roster management dashboard"
        }
        description={
          isAdmin
            ? "Review users, enforce access controls, and monitor audit activity from one structured workspace."
            : "Review students in your scope, inspect profiles, and coordinate status updates without exposing administrator-only actions."
        }
        action={
          <div className="flex flex-wrap gap-3">
            {isAdmin ? (
              <Link
                to="/admin/users/new"
                className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
              >
                Create user
              </Link>
            ) : null}
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
              onClick={() => loadUsers(pagination.page)}
            >
              Refresh data
            </button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard title="Total visible users" className="p-5">
          <p className="text-4xl font-bold text-slate-900 dark:text-white">
            {pagination.total}
          </p>
        </SectionCard>
        <SectionCard title="Selected rows" className="p-5">
          <p className="text-4xl font-bold text-slate-900 dark:text-white">
            {selectedIds.length}
          </p>
        </SectionCard>
        <SectionCard title="Departments" className="p-5">
          <p className="text-4xl font-bold text-slate-900 dark:text-white">
            {departments.length}
          </p>
        </SectionCard>
        <SectionCard
          title={isAdmin ? "Active students" : "Active visible students"}
          className="p-5"
        >
          <p className="text-4xl font-bold text-slate-900 dark:text-white">
            {analytics?.activeStudents ??
              users.filter((entry) => !entry.isBlocked).length}
          </p>
        </SectionCard>
      </section>

      <SectionCard
        title="User Table"
        action={
          <div className="flex flex-wrap gap-2">
            {isAdmin && selectedIds.length ? (
              <button
                type="button"
                className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
                onClick={handleBulkDelete}
              >
                Delete selected
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
              onClick={() => loadUsers(pagination.page)}
            >
              Refresh
            </button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="app-muted flex items-center gap-3 rounded-2xl px-4 py-3 xl:col-span-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Search name, email, department"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
            />
          </label>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
            value={filters.role}
            onChange={(event) =>
              setFilters((current) => ({ ...current, role: event.target.value }))
            }
          >
            <option value="">All roles</option>
            {isAdmin ? <option value="ADMIN">Admin</option> : null}
            {isAdmin ? <option value="TEACHER">Teacher</option> : null}
            <option value="STUDENT">Student</option>
          </select>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
            value={filters.department}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                department: event.target.value,
              }))
            }
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department._id} value={department.name}>
                {department.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
            value={filters.year}
            onChange={(event) =>
              setFilters((current) => ({ ...current, year: event.target.value }))
            }
          >
            <option value="">All years</option>
            {[1, 2, 3, 4, 5, 6].map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-slate-200 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={users.length > 0 && selectedIds.length === users.length}
                      onChange={(event) =>
                        setSelectedIds(
                          event.target.checked ? users.map((entry) => entry._id) : []
                        )
                      }
                    />
                  </th>
                  {[
                    ["name", "Name"],
                    ["email", "Email"],
                    ["role", "Role"],
                    ["department", "Dept"],
                    ["year", "Year"],
                    ["status", "Status"],
                  ].map(([key, label]) => (
                    <th key={key} className="px-4 py-3">
                      <button
                        type="button"
                        className="font-semibold text-slate-700 dark:text-slate-200"
                        onClick={() => onSort(key)}
                      >
                        {label}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading || tableBusy ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr
                      key={index}
                      className="border-t border-slate-200 dark:border-white/5"
                    >
                      <td className="px-4 py-4" colSpan={8}>
                        <Skeleton className="h-12 w-full" />
                      </td>
                    </tr>
                  ))
                ) : users.length ? (
                  users.map((entry) => (
                    <tr
                      key={entry._id}
                      className="border-t border-slate-200/80 dark:border-white/5"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(entry._id)}
                          onChange={(event) =>
                            setSelectedIds((current) =>
                              event.target.checked
                                ? [...current, entry._id]
                                : current.filter((id) => id !== entry._id)
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">
                        {entry.name}
                      </td>
                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                        {entry.email}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={entry.role}>{entry.role}</Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                        {entry.department}
                      </td>
                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                        {entry.year}
                      </td>
                      <td className="px-4 py-4">
                        <button type="button" onClick={() => toggleStatus(entry)}>
                          <Badge variant={entry.isBlocked ? "blocked" : "active"}>
                            {entry.isBlocked ? "Blocked" : "Active"}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/profile/${entry._id}`}
                            className="rounded-xl border border-slate-200 p-2 dark:border-white/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            className="rounded-xl border border-slate-200 p-2 dark:border-white/10"
                            onClick={() => setEditingUser({ ...entry })}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {isAdmin ? (
                            <>
                              <button
                                type="button"
                                className="rounded-xl border border-slate-200 p-2 dark:border-white/10"
                                onClick={() => {
                                  setResetTarget(entry);
                                  setResetPasswordValue(generateStrongPassword());
                                }}
                              >
                                <KeyRound className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="rounded-xl border border-red-300 p-2 text-red-500 dark:border-red-500/20"
                                onClick={() => setDeleteTarget(entry)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6">
                      <EmptyState
                        title="No users match these filters"
                        description="Try widening the search or clearing the active filters."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing page {pagination.page} of {pagination.totalPages} •{" "}
            {pagination.total} total users
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-white/10"
              disabled={pagination.page <= 1}
              onClick={() => loadUsers(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-white/10"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadUsers(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SectionCard>

      {isAdmin ? (
        <SectionCard title="Recent Activity Logs">
          {auditLogs.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {auditLogs.map((entry) => (
                <div key={entry._id} className="app-muted rounded-[1.75rem] p-5">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {entry.message}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {entry.actorId?.name || "System"} •{" "}
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No activity logs yet"
              description="Audit trail entries will appear after user actions are performed."
            />
          )}
        </SectionCard>
      ) : null}

      <Modal
        open={Boolean(profileUser)}
        title="User profile"
        onClose={() => setProfileUser(null)}
      >
        {profileUser ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="app-muted rounded-[1.75rem] p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {profileUser.name}
              </p>
            </div>
            <div className="app-muted rounded-[1.75rem] p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {profileUser.email}
              </p>
            </div>
            <div className="app-muted rounded-[1.75rem] p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Registration number
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {profileUser.registrationNumber || "Not set"}
              </p>
            </div>
            <div className="app-muted rounded-[1.75rem] p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Role</p>
              <div className="mt-2">
                <Badge variant={profileUser.role}>{profileUser.role}</Badge>
              </div>
            </div>
            <div className="app-muted rounded-[1.75rem] p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <div className="mt-2">
                <Badge variant={profileUser.isBlocked ? "blocked" : "active"}>
                  {profileUser.isBlocked ? "Blocked" : "Active"}
                </Badge>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(editingUser)}
        title="Edit user"
        onClose={() => setEditingUser(null)}
        footer={
          <>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-white/10"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              onClick={handleUpdateUser}
              disabled={submitting}
            >
              Save changes
            </button>
          </>
        }
      >
        {editingUser ? (
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              value={editingUser.name}
              onChange={(event) =>
                setEditingUser((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              value={editingUser.email}
              onChange={(event) =>
                setEditingUser((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase dark:border-white/10 dark:bg-white/5"
              value={editingUser.registrationNumber || ""}
              onChange={(event) =>
                setEditingUser((current) => ({
                  ...current,
                  registrationNumber: event.target.value.toUpperCase(),
                }))
              }
              placeholder="Registration number"
            />
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              value={editingUser.role}
              disabled={!isAdmin}
              onChange={(event) =>
                setEditingUser((current) => ({
                  ...current,
                  role: event.target.value,
                }))
              }
            >
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
            </select>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              value={editingUser.department}
              onChange={(event) =>
                setEditingUser((current) => ({
                  ...current,
                  department: event.target.value,
                }))
              }
            >
              {departments.map((department) => (
                <option key={department._id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              type="number"
              min="1"
              max="6"
              value={editingUser.year}
              onChange={(event) =>
                setEditingUser((current) => ({
                  ...current,
                  year: Number(event.target.value),
                }))
              }
            />
            <label className="app-muted flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={!editingUser.isBlocked}
                onChange={() =>
                  setEditingUser((current) => ({
                    ...current,
                    isBlocked: !current.isBlocked,
                  }))
                }
              />
              Keep account active
            </label>
            {isAdmin ? (
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Permissions
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  {availablePermissions.map((permission) => (
                    <label
                      key={permission}
                      className="app-muted flex items-center gap-3 rounded-2xl px-4 py-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={editingUser.permissions?.includes(permission)}
                        onChange={(event) =>
                          setEditingUser((current) => ({
                            ...current,
                            permissions: event.target.checked
                              ? [...(current.permissions || []), permission]
                              : (current.permissions || []).filter(
                                  (item) => item !== permission
                                ),
                          }))
                        }
                      />
                      {permission}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete user"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-white/10"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white"
              onClick={handleDeleteUser}
              disabled={submitting}
            >
              Confirm delete
            </button>
          </>
        }
      >
        <div className="app-muted rounded-[1.75rem] p-5">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            This action will permanently remove{" "}
            <span className="font-semibold">{deleteTarget?.name}</span> and is
            tracked in the audit trail.
          </p>
        </div>
      </Modal>

      <Modal
        open={Boolean(resetTarget)}
        title="Reset password"
        onClose={() => setResetTarget(null)}
        footer={
          <>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-white/10"
              onClick={() => setResetTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              onClick={handleResetPassword}
              disabled={submitting}
            >
              Reset password
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="app-muted rounded-[1.75rem] p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Target account
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {resetTarget?.name}
            </p>
          </div>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
            value={resetPasswordValue}
            onChange={(event) => setResetPasswordValue(event.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
