import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Building2, BookOpen } from "lucide-react";
import http from "../../api/http";
import Skeleton from "../../components/Skeleton";
import Modal from "../../components/Modal";
import { useToast } from "../../hooks/useToast";

const AdminCompanyManagementPage = () => {
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  
  // Question Modal state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    title: "",
    description: "",
    type: "coding",
    difficulty: "easy",
    topic: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "Mass Hiring",
    focusAreas: "",
    description: "",
    website: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/placement/companies");
      setCompanies(data);
    } catch (error) {
      console.error("Failed to load companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        focusAreas: formData.focusAreas.split(",").map((area) => area.trim()),
      };

      if (editingCompany) {
        await http.patch(`/placement/admin/companies/${editingCompany.name}`, payload);
      } else {
        await http.post("/placement/admin/companies", payload);
      }

      setShowModal(false);
      setFormData({ name: "", type: "Mass Hiring", focusAreas: "", description: "", website: "" });
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      console.error("Error saving company:", error);
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete company "${name}"?`)) return;
    try {
      await http.delete(`/placement/admin/companies/${name}`);
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      type: company.type,
      focusAreas: company.focusAreas.join(", "),
      description: company.description,
      website: company.website,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCompany(null);
    setFormData({ name: "", type: "Mass Hiring", focusAreas: "", description: "", website: "" });
    setShowModal(true);
  };

  const handleManageQuestions = (company) => {
    setSelectedCompany(company);
    setQuestionForm({
      title: "",
      description: "",
      type: "coding",
      difficulty: "easy",
      topic: "",
    });
    setShowQuestionModal(true);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await http.post("/placement/admin/questions", {
        companyName: selectedCompany.name,
        ...questionForm
      });
      toast.success("Question Added", "The question was successfully assigned to the company.");
      setShowQuestionModal(false);
    } catch (error) {
      toast.error("Error", error.response?.data?.message || "Failed to add question.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-[var(--text-primary)]">
            <Building2 className="h-8 w-8 text-brand-500" />
            Manage Companies
          </h1>
          <p className="mt-1 text-slate-400">Add, edit, or delete companies for placement prep</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-brand-600 transition"
        >
          <Plus className="h-5 w-5" />
          Add Company
        </button>
      </div>

      <div className="space-y-3">
        {companies.map((company) => (
          <div
            key={company._id}
            className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-center justify-between hover:border-white/20 transition"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{company.name}</h3>
              <div className="mt-2 flex items-center gap-4">
                <span className="inline-block rounded-full bg-brand-500/20 px-3 py-1 text-xs font-medium text-brand-300">
                  {company.type}
                </span>
                <span className="text-sm text-slate-400">
                  {company.focusAreas?.length || 0} focus areas
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleManageQuestions(company)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-white/10 transition mr-2"
              >
                <BookOpen className="h-4 w-4" />
                Assign Problems
              </button>
              <button
                onClick={() => handleEdit(company)}
                className="rounded-lg p-2 hover:bg-white/10 transition"
              >
                <Edit2 className="h-5 w-5 text-blue-400" />
              </button>
              <button
                onClick={() => handleDelete(company.name)}
                className="rounded-lg p-2 hover:bg-white/10 transition"
              >
                <Trash2 className="h-5 w-5 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal
          title={editingCompany ? "Edit Company" : "Add New Company"}
          onClose={() => {
            setShowModal(false);
            setEditingCompany(null);
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!!editingCompany}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
              >
                <option value="Mass Hiring">Mass Hiring</option>
                <option value="Product Based">Product Based</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Focus Areas (comma separated)
              </label>
              <input
                type="text"
                value={formData.focusAreas}
                onChange={(e) => setFormData({ ...formData, focusAreas: e.target.value })}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                placeholder="DSA, Database, API Design"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition h-24 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingCompany(null);
                }}
                className="rounded-lg border border-white/20 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-brand-600 transition"
              >
                {editingCompany ? "Update" : "Create"} Company
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showQuestionModal && (
        <Modal
          title={`Assign Problem to ${selectedCompany?.name}`}
          onClose={() => setShowQuestionModal(false)}
        >
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Problem Title</label>
              <input
                type="text"
                value={questionForm.title}
                onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={questionForm.type}
                  onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                >
                  <option value="coding">Coding</option>
                  <option value="aptitude">Aptitude</option>
                  <option value="interview">Interview</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Level (Difficulty)</label>
                <select
                  value={questionForm.difficulty}
                  onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                >
                  <option value="easy">Fundamentals</option>
                  <option value="medium">Advanced Problems</option>
                  <option value="hard">Hardcore Algorithms</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Topic</label>
              <input
                type="text"
                value={questionForm.topic}
                onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                placeholder="e.g., Arrays, Dynamic Programming"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                value={questionForm.description}
                onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition h-32 resize-none"
                required
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="rounded-lg border border-white/20 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-brand-600 transition"
              >
                Assign Problem
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminCompanyManagementPage;



