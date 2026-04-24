import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import SectionCard from "../../components/SectionCard";

const StudentsPage = () => {
  const [filters, setFilters] = useState({ department: "", year: "" });
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newDepartment, setNewDepartment] = useState("");
  const [pageError, setPageError] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [addingDepartment, setAddingDepartment] = useState(false);
  const [movingStudentId, setMovingStudentId] = useState("");

  const loadDepartments = async () => {
    const { data } = await http.get("/departments");
    setDepartments(data);
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      setPageError("");
      const params = {};
      if (filters.department) params.department = filters.department;
      if (filters.year) params.year = filters.year;
      const { data } = await http.get("/students", { params });
      setStudents(data);
    } catch (error) {
      setPageError(error.response?.data?.message || "Unable to load students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        await Promise.all([loadDepartments(), loadStudents()]);
      } catch (_error) {
        // Individual loaders already set page errors.
      }
    };

    loadPageData();
  }, []);

  const loadStudentDetails = async (studentId) => {
    try {
      setPageError("");
      const { data } = await http.get(`/student/${studentId}`);
      setSelected(data);
    } catch (error) {
      setPageError(error.response?.data?.message || "Unable to load student details.");
    }
  };

  const createDepartment = async (event) => {
    event.preventDefault();

    try {
      setAddingDepartment(true);
      setPageError("");
      setPageMessage("");
      await http.post("/departments", { name: newDepartment });
      setNewDepartment("");
      setPageMessage("Department added successfully.");
      await loadDepartments();
    } catch (error) {
      setPageError(error.response?.data?.message || "Unable to add department.");
    } finally {
      setAddingDepartment(false);
    }
  };

  const updateStudentDepartment = async (studentId, department) => {
    try {
      setMovingStudentId(studentId);
      setPageError("");
      setPageMessage("");
      const { data } = await http.patch(`/student/${studentId}/department`, { department });
      setStudents((current) => current.map((student) => (student._id === studentId ? data : student)));
      setSelected((current) =>
        current?.student?._id === studentId
          ? {
              ...current,
              student: { ...current.student, department: data.department },
            }
          : current
      );
      setPageMessage("Student department updated.");
    } catch (error) {
      setPageError(error.response?.data?.message || "Unable to update student department.");
    } finally {
      setMovingStudentId("");
    }
  };

  const groupedStudents = useMemo(() => {
    const groups = students.reduce((accumulator, student) => {
      const key = student.department || "UNASSIGNED";
      accumulator[key] = accumulator[key] || [];
      accumulator[key].push(student);
      return accumulator;
    }, {});

    return Object.entries(groups).sort(([left], [right]) => left.localeCompare(right));
  }, [students]);

  return (
    <div className="space-y-6">
      <SectionCard title="Departments">
        <form className="flex flex-col gap-3 md:flex-row" onSubmit={createDepartment}>
          <input
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            placeholder="Department name"
            value={newDepartment}
            onChange={(event) => setNewDepartment(event.target.value)}
          />
          <button
            type="submit"
            className="rounded-2xl bg-brand-500 px-4 py-3 font-semibold disabled:opacity-70"
            disabled={addingDepartment}
          >
            {addingDepartment ? "Adding..." : "Add Department"}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {departments.map((department) => (
            <span key={department._id} className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
              {department.name}
            </span>
          ))}
        </div>
      </SectionCard>

      {pageError ? <p className="text-sm text-red-300">{pageError}</p> : null}
      {pageMessage ? <p className="text-sm text-emerald-300">{pageMessage}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <SectionCard title="Student List">
          <div className="mb-4 flex flex-col gap-3 md:flex-row">
            <select
              className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
              value={filters.department}
              onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value }))}
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department._id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 md:w-28"
              placeholder="Year"
              value={filters.year}
              onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value }))}
            />
            <button type="button" className="rounded-2xl bg-brand-500 px-4 py-3 font-semibold" onClick={loadStudents}>
              Filter
            </button>
          </div>
          {loadingStudents ? <p className="text-sm text-slate-300">Loading students...</p> : null}
          <div className="space-y-4">
            {groupedStudents.map(([department, departmentStudents]) => (
              <div key={department} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">{department}</p>
                <div className="space-y-3">
                  {departmentStudents.map((student) => (
                    <div key={student._id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <button type="button" className="w-full text-left" onClick={() => loadStudentDetails(student._id)}>
                        <p className="font-semibold text-white">{student.name}</p>
                        <p className="text-sm text-slate-400">
                          {student.department} • Year {student.year}
                        </p>
                      </button>
                      <div className="mt-3 flex flex-col gap-2 md:flex-row">
                        <select
                          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
                          value={student.department}
                          onChange={(event) => updateStudentDepartment(student._id, event.target.value)}
                          disabled={movingStudentId === student._id}
                        >
                          {departments.map((item) => (
                            <option key={item._id} value={item.name}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                          onClick={() => loadStudentDetails(student._id)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!loadingStudents && students.length === 0 ? (
              <p className="text-sm text-slate-400">No students found for the selected filters.</p>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Performance Analysis">
          {selected ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-lg font-semibold text-white">{selected.student.name}</p>
                <p className="text-sm text-slate-400">
                  {selected.student.department} • Year {selected.student.year}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Accuracy {selected.metrics.accuracy}% • Solved {selected.metrics.solvedCount}
                </p>
              </div>
              {selected.metrics.submissionHistory.map((submission) => (
                <div key={submission._id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-semibold text-white">{submission.language.toUpperCase()}</p>
                  <p className="text-sm text-slate-300">Status: {submission.result.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Select a student to inspect solved counts, accuracy, and submission history.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default StudentsPage;
