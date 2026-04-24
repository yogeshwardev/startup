import { useEffect, useState } from "react";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useToast } from "../../hooks/useToast";

const TeacherProblemsPage = () => {
  const toast = useToast();
  const [problems, setProblems] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ studentId: "", problemId: "", dueDate: "" });

  const loadData = async () => {
    const [problemRes, studentRes, assignmentRes] = await Promise.all([
      http.get("/problems"),
      http.get("/students"),
      http.get("/teacher/assignments"),
    ]);
    setProblems(problemRes.data);
    setStudents(studentRes.data);
    setAssignments(assignmentRes.data);
    setForm((current) => ({
      ...current,
      studentId: current.studentId || studentRes.data[0]?._id || "",
      problemId: current.problemId || problemRes.data[0]?._id || "",
    }));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (event) => {
    event.preventDefault();
    try {
      await http.post("/teacher/assignments", form);
      toast.success(
        "Problem assigned",
        "The assignment has been sent to the student."
      );
      await loadData();
    } catch (error) {
      toast.error(
        "Assignment failed",
        error.response?.data?.message || "Unable to assign problem."
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teacher panel"
        title="Assign practice sets"
        description="Teachers can review reportable 6-digit problem IDs while assigning practice."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Assign a problem">
          <form className="space-y-4" onSubmit={handleAssign}>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              value={form.studentId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  studentId: event.target.value,
                }))
              }
            >
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} • {student.department}
                </option>
              ))}
            </select>

            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              value={form.problemId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  problemId: event.target.value,
                }))
              }
            >
              {problems.map((problem) => (
                <option key={problem._id} value={problem._id}>
                  {problem.title} • ID {problem.problemCode} • {problem.difficulty}
                </option>
              ))}
            </select>

            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
              type="datetime-local"
              value={form.dueDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dueDate: event.target.value,
                }))
              }
            />

            <button
              type="submit"
              className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
            >
              Assign problem
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Assigned problems">
          {assignments.length ? (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="app-muted rounded-[1.5rem] p-4">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {assignment.problemId?.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    ID {assignment.problemId?.problemCode} • {assignment.studentId?.name} •{" "}
                    {assignment.studentId?.department} • {assignment.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No assignments yet"
              description="Create assignments to guide students toward targeted practice."
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default TeacherProblemsPage;
