import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, FileText } from "lucide-react";
import http from "../../api/http";
import Skeleton from "../../components/Skeleton";
import Modal from "../../components/Modal";

const AdminQuestionManagementPage = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    type: "coding",
    category: "",
    topic: "",
    difficulty: "easy",
    title: "",
    description: "",
    constraints: "",
    tags: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchQuestions();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const { data } = await http.get("/placement/companies");
      setCompanies(data);
      if (data.length > 0) {
        setSelectedCompany(data[0].name);
      }
    } catch (error) {
      console.error("Failed to load companies:", error);
    }
  };

  const fetchQuestions = async () => {
    if (!selectedCompany) return;
    try {
      setLoading(true);
      const { data } = await http.get(`/placement/admin/companies/${selectedCompany}/questions`);
      setQuestions(data.questions);
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        constraints: formData.constraints.split("\n").filter((c) => c.trim()),
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        companyName: selectedCompany,
      };

      if (editingQuestion) {
        await http.patch(`/placement/admin/questions/${editingQuestion._id}`, payload);
      } else {
        await http.post("/placement/admin/questions", payload);
      }

      setShowModal(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: selectedCompany,
      type: "coding",
      category: "",
      topic: "",
      difficulty: "easy",
      title: "",
      description: "",
      constraints: "",
      tags: "",
    });
    setEditingQuestion(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await http.delete(`/placement/admin/questions/${id}`);
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      companyName: question.companyName,
      type: question.type,
      category: question.category,
      topic: question.topic,
      difficulty: question.difficulty,
      title: question.title,
      description: question.description,
      constraints: question.constraints?.join("\n") || "",
      tags: question.tags?.join(", ") || "",
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  if (!selectedCompany) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No companies available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-[var(--text-primary)]">
            <FileText className="h-8 w-8 text-brand-500" />
            Manage Questions
          </h1>
          <p className="mt-1 text-slate-400">Add, edit, or delete questions for companies</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-brand-600 transition"
        >
          <Plus className="h-5 w-5" />
          Add Question
        </button>
      </div>

      <div className="rounded-lg bg-white/5 border border-white/10 p-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">Select Company</label>
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
        >
          {companies.map((company) => (
            <option key={company._id} value={company.name}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <div
              key={question._id}
              className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-start justify-between hover:border-white/20 transition"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text-primary)]">{question.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-300">
                    {question.type}
                  </span>
                  <span className="inline-block rounded-full bg-purple-500/20 px-2.5 py-1 text-xs font-medium text-purple-300">
                    {question.difficulty}
                  </span>
                  <span className="inline-block rounded-full bg-gray-500/20 px-2.5 py-1 text-xs font-medium text-gray-300">
                    {question.topic}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(question)}
                  className="rounded-lg p-2 hover:bg-white/10 transition"
                >
                  <Edit2 className="h-5 w-5 text-blue-400" />
                </button>
                <button
                  onClick={() => handleDelete(question._id)}
                  className="rounded-lg p-2 hover:bg-white/10 transition"
                >
                  <Trash2 className="h-5 w-5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editingQuestion ? "Edit Question" : "Add New Question"}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                >
                  <option value="coding">Coding</option>
                  <option value="aptitude">Aptitude</option>
                  <option value="interview">Interview</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                  placeholder="e.g., Arrays, Strings"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                  placeholder="e.g., Array Manipulation"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition h-20 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[var(--text-primary)] outline-none focus:border-brand-500 transition"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-lg border border-white/20 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-[var(--text-primary)] hover:bg-brand-600 transition"
              >
                {editingQuestion ? "Update" : "Add"} Question
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminQuestionManagementPage;



