import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, XCircle, Search, Clock, DollarSign, Calendar } from "lucide-react";
import http from "../../api/http";

const PaymentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("paid"); // 'paid' or 'unpaid'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [overrideForm, setOverrideForm] = useState({
    planType: "YEARLY",
    paymentId: "",
    paymentTime: "",
  });
  const [updating, setUpdating] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/users", {
        params: { role: "STUDENT", limit: 1000 },
      });
      setStudents(data.items || []);
    } catch (err) {
      setError("Failed to load students.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenOverride = (student) => {
    setSelectedStudent(student);
    setOverrideForm({
      planType: "YEARLY",
      paymentId: "",
      paymentTime: new Date().toISOString().slice(0, 16), // datetime-local format
    });
    setShowModal(true);
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!overrideForm.paymentId.trim()) return alert("Payment ID is required.");
    
    try {
      setUpdating(true);
      await http.put(`/users/${selectedStudent._id}`, {
        isPaid: true,
        planType: overrideForm.planType,
        paymentId: overrideForm.paymentId,
        paymentTime: new Date(overrideForm.paymentTime).toISOString(),
      });
      setShowModal(false);
      fetchStudents(); // refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to override payment");
    } finally {
      setUpdating(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.registrationNumber?.toLowerCase().includes(search.toLowerCase());
    
    const matchesTab = activeTab === "paid" ? s.isPaid : !s.isPaid;
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-400" />
            Payment Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track student registrations, plan statuses, and manually override failed payments.
          </p>
        </div>
      </div>

      <div className="card-interactive p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex gap-2 p-1 bg-surface-50 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("paid")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === "paid" ? "bg-brand-500/20 text-brand-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Paid Students
            </button>
            <button
              onClick={() => setActiveTab("unpaid")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === "unpaid" ? "bg-rose-500/20 text-rose-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Unpaid / Failed
            </button>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full input-field pl-9 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-surface-50/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Student</th>
                  <th className="px-4 py-3">Registration</th>
                  <th className="px-4 py-3">Plan Type</th>
                  <th className="px-4 py-3">Payment Info</th>
                  <th className="px-4 py-3 rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No {activeTab} students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-surface-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{s.name || s.email}</div>
                        <div className="text-xs text-gray-500">{s.email}</div>
                        <div className="text-xs text-gray-500">Ph: {s.phone || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs">{s.registrationNumber || 'N/A'}</div>
                        <div className="text-xs text-brand-400">{s.department} (Yr {s.year})</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                          s.isPaid ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {s.isPaid ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {s.planType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.isPaid ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="font-mono">{s.paymentId || 'N/A'}</span>
                            </div>
                            {s.paymentTime && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(s.paymentTime).toLocaleString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">No payment record</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!s.isPaid && (
                          <button
                            onClick={() => handleOpenOverride(s)}
                            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-md transition-colors"
                          >
                            Manual Override
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Override Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-md rounded-xl border border-border shadow-2xl p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-white mb-1">Manual Payment Override</h3>
            <p className="text-sm text-gray-400 mb-6">
              Mark <span className="font-semibold text-white">{selectedStudent.name || selectedStudent.email}</span> as paid.
            </p>
            
            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Plan Type</label>
                <select
                  value={overrideForm.planType}
                  onChange={(e) => setOverrideForm({...overrideForm, planType: e.target.value})}
                  className="w-full input-field px-3 py-2 text-sm"
                >
                  <option value="SEMESTER">Semester Pass (₹499)</option>
                  <option value="YEARLY">Yearly Pass (₹799)</option>
                  <option value="GRADUATION">Graduation Pass (₹1599)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Payment Reference ID</label>
                <input
                  type="text"
                  placeholder="e.g. UPI_ref_123 or Cash_Receipt_45"
                  value={overrideForm.paymentId}
                  onChange={(e) => setOverrideForm({...overrideForm, paymentId: e.target.value})}
                  className="w-full input-field px-3 py-2 text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Date & Time of Payment</label>
                <input
                  type="datetime-local"
                  value={overrideForm.paymentTime}
                  onChange={(e) => setOverrideForm({...overrideForm, paymentTime: e.target.value})}
                  className="w-full input-field px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-surface-50 hover:bg-surface-100 text-gray-300 text-sm font-semibold rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-md transition-colors disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagementPage;
