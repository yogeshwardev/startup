import { Department } from "../models/Department.js";
import { Submission } from "../models/Submission.js";
import { User } from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

const normalizeDepartmentName = (name) => name.trim().toUpperCase();

export const getStudents = catchAsync(async (req, res) => {
  const filter = { role: "STUDENT" };

  if (req.user.role === "TEACHER") {
    filter.department = normalizeDepartmentName(req.user.department);
  } else if (req.query.department) {
    filter.department = normalizeDepartmentName(req.query.department);
  }

  if (req.query.year) {
    filter.year = Number(req.query.year);
  }

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search.trim(), $options: "i" } },
      { email: { $regex: req.query.search.trim(), $options: "i" } },
    ];
  }

  const students = await User.find(filter).sort({ department: 1, year: 1, name: 1 });
  res.json(students);
});

export const getDepartments = catchAsync(async (_req, res) => {
  const usedDepartments = await User.distinct("department", { department: { $nin: ["", null] } });
  const normalizedDepartments = usedDepartments.map((department) => normalizeDepartmentName(department));

  if (normalizedDepartments.length) {
    await Department.bulkWrite(
      normalizedDepartments.map((name) => ({
        updateOne: {
          filter: { name },
          update: { $setOnInsert: { name } },
          upsert: true,
        },
      }))
    );
  }

  const departments = await Department.find().sort({ name: 1 });
  res.json(departments);
});

export const createDepartment = catchAsync(async (req, res) => {
  const name = normalizeDepartmentName(req.body.name);
  const existingDepartment = await Department.findOne({ name });

  if (existingDepartment) {
    throw new ApiError(409, "Department already exists.");
  }

  const department = await Department.create({ name });
  res.status(201).json(department);
});

export const getStudentById = catchAsync(async (req, res) => {
  const studentFilter = { _id: req.params.id, role: "STUDENT" };

  if (req.user.role === "TEACHER") {
    studentFilter.department = normalizeDepartmentName(req.user.department);
  }

  const student = await User.findOne(studentFilter);
  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  const submissions = await Submission.find({ userId: student._id }).sort({ createdAt: -1 });
  const solvedCount = submissions.filter((item) => item.status === "Accepted").length;
  const accuracy = submissions.length ? Math.round((solvedCount / submissions.length) * 100) : 0;

  res.json({
    student,
    metrics: {
      solvedCount,
      accuracy,
      submissionHistory: submissions,
    },
  });
});

export const manageStudent = catchAsync(async (req, res) => {
  const studentFilter = { _id: req.params.id, role: "STUDENT" };

  if (req.user.role === "TEACHER") {
    studentFilter.department = normalizeDepartmentName(req.user.department);
  }

  const student = await User.findOne(studentFilter);

  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  if (typeof req.body.isBlocked === "boolean") {
    student.isBlocked = req.body.isBlocked;
  }

  if (req.body.department) {
    const departmentName = normalizeDepartmentName(req.body.department);
    const department = await Department.findOne({ name: departmentName });

    if (!department) {
      throw new ApiError(404, "Department not found.");
    }

    student.department = department.name;
  }

  await student.save();
  res.json(student);
});

export const updateStudentDepartment = manageStudent;
