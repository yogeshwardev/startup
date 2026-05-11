import { Edit2, Megaphone, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import Skeleton from "../../components/Skeleton";

const defaultForm = {
  title: "",
  message: "",
  priority: "normal",
  isActive: true,
};

const priorityStyles = {
  normal: "badge-info",
  important: "badge-warning",
  urgent: "badge-danger",
};

const AnnouncementManagementPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/announcements/manage");
      setAnnouncements(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setError("");
    setStatus("");
    setModalOpen(true);
  };

  const openEdit = (announcement) => {
    setEditing(announcement);
    setForm({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority,
      isActive: announcement.isActive,
    });
    setError("");
    setStatus("");
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");

    try {
      if (editing) {
        await http.patch(`/announcements/${editing._id}`, form);
      } else {
        await http.post("/announcements", form);
      }

      setModalOpen(false);
      setEditing(null);
      setForm(defaultForm);
      await loadAnnouncements();
      setStatus(editing ? "Announcement updated." : "Announcement published.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        requestError.message ||
        "Unable to save announcement."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (announcement) => {
    if (!window.confirm(`Delete announcement "${announcement.title}"?`)) return;
    try {
      await http.delete(`/announcements/${announcement._id}`);
      await loadAnnouncements();
      setStatus("Announcement deleted.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete announcement.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Announcements"
        title="Campus announcements"
        description="Publish short updates that appear on the student dashboard."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <Plus className="h-4 w-4" />
            New Announcement
          </button>
        }
      />

      {error && !modalOpen ? (
        <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {status}
        </p>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : announcements.length ? (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <article
              key={announcement._id}
              className="card p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`badge ${priorityStyles[announcement.priority] || "badge-info"}`}>
                      {announcement.priority}
                    </span>
                    <span
                      className={`badge ${announcement.isActive ? "badge-success" : "badge-danger"}`}
                    >
                      {announcement.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    {announcement.title}
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                    {announcement.message}
                  </p>
                  <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    {announcement.createdBy?.name || "Staff"} · {new Date(announcement.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(announcement)}
                    className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(announcement)}
                    className="inline-flex items-center gap-2 rounded-md border border-rose-500/20 px-3 py-2 text-sm font-bold text-rose-300 transition hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No announcements yet"
          description="Create the first message to show updates on the student dashboard."
        />
      )}

      {modalOpen && (
        <Modal
          title={editing ? "Edit Announcement" : "New Announcement"}
          onClose={() => setModalOpen(false)}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error ? (
              <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
                {error}
              </p>
            ) : null}

            <div>
              <label className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                Title
              </label>
              <input
                className="input-field w-full px-3 py-2.5 text-sm"
                value={form.title}
                maxLength={120}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Example: Aptitude test on Friday"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                Message
              </label>
              <textarea
                className="input-field min-h-36 w-full resize-none px-3 py-2.5 text-sm leading-6"
                value={form.message}
                maxLength={1200}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Write the announcement students should see."
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Priority
                </label>
                <select
                  className="input-field w-full px-3 py-2.5 text-sm"
                  value={form.priority}
                  onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <label className="flex items-end gap-3 rounded-lg border px-3 py-2.5" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  className="h-4 w-4 accent-brand-500"
                />
                <span className="text-sm font-semibold">Visible to students</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
              <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-sm">
                {saving ? "Saving..." : editing ? "Update" : "Publish"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AnnouncementManagementPage;
