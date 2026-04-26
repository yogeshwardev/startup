import { Department } from "../models/Department.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { User } from "../models/User.js";
import { MockTest } from "../models/MockTest.js";
import { Problem } from "../models/Problem.js";
import { getAdminAnalytics } from "../services/analyticsService.js";
import { logActivity } from "../services/activityLogService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

const normalizeDepartmentName = (name) => name.trim().toUpperCase();
const normalizeRegistrationNumber = (value) => value.trim().toUpperCase();

const buildDisplayName = (payload) =>
  payload.name?.trim() ||
  payload.registrationNumber?.trim().toUpperCase() ||
  payload.email.split("@")[0];

const canManageRole = (actorRole, targetRole) => {
  if (actorRole === "ADMIN") {
    return true;
  }

  return actorRole === "TEACHER" && targetRole === "STUDENT";
};

const buildUserFilter = (req) => {
  const filter = {};

  if (req.user.role === "TEACHER") {
    filter.role = "STUDENT";
    filter.department = normalizeDepartmentName(req.user.department);
  } else if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.department) {
    filter.department = normalizeDepartmentName(req.query.department);
  }

  if (req.query.year) {
    filter.year = Number(req.query.year);
  }

  if (req.query.status === "active") {
    filter.isBlocked = false;
  }

  if (req.query.status === "blocked") {
    filter.isBlocked = true;
  }

  if (req.query.search?.trim()) {
    filter.$or = [
      { name: { $regex: req.query.search.trim(), $options: "i" } },
      { email: { $regex: req.query.search.trim(), $options: "i" } },
      { department: { $regex: req.query.search.trim(), $options: "i" } },
    ];
  }

  return filter;
};

const sanitizeUser = (user) => {
  const object = user.toObject ? user.toObject() : { ...user };
  delete object.password;
  return object;
};

const sortMap = {
  name: { name: 1 },
  email: { email: 1 },
  role: { role: 1, name: 1 },
  department: { department: 1, name: 1 },
  year: { year: 1, name: 1 },
  createdAt: { createdAt: -1 },
  status: { isBlocked: 1, name: 1 },
};

export const getUsers = catchAsync(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const filter = buildUserFilter(req);
  const sort = sortMap[sortBy] ? { ...sortMap[sortBy] } : { createdAt: -1 };

  const firstSortKey = Object.keys(sort)[0];
  if (firstSortKey) {
    sort[firstSortKey] = sortOrder;
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
    filters: {
      role: req.query.role || "",
      department: req.query.department || "",
      year: req.query.year || "",
      status: req.query.status || "",
      search: req.query.search || "",
    },
  });
});

export const createUser = catchAsync(async (req, res) => {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Only admins can create users.");
  }

  const email = req.body.email.toLowerCase();
  const registrationNumber = normalizeRegistrationNumber(req.body.registrationNumber);
  const departmentName = normalizeDepartmentName(req.body.department);
  const [existingUser, existingRegistration, department] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ registrationNumber }),
    Department.findOne({ name: departmentName }),
  ]);

  if (existingUser) {
    throw new ApiError(409, "User already exists.");
  }

  if (existingRegistration) {
    throw new ApiError(409, "Registration number already exists.");
  }

  if (!department) {
    throw new ApiError(404, "Department not found.");
  }

  const user = await User.create({
    ...req.body,
    name: buildDisplayName(req.body),
    email,
    registrationNumber,
    department: department.name,
    permissions: req.body.permissions || [],
  });

  await logActivity({
    actorId: req.user._id,
    targetUserId: user._id,
    action: "USER_CREATED",
    message: `${req.user.name} created ${user.name}.`,
    metadata: { role: user.role, department: user.department },
  });

  res.status(201).json(sanitizeUser(user));
});

export const updateUser = catchAsync(async (req, res) => {
  const target = await User.findById(req.params.id).select("+password");
  if (!target) {
    throw new ApiError(404, "User not found.");
  }

  if (!canManageRole(req.user.role, target.role)) {
    throw new ApiError(403, "You do not have permission to edit this user.");
  }

  if (req.user.role === "TEACHER" && normalizeDepartmentName(target.department) !== normalizeDepartmentName(req.user.department)) {
    throw new ApiError(403, "Teachers can only edit students in their department.");
  }

  if (req.body.department) {
    const departmentName = normalizeDepartmentName(req.body.department);
    const department = await Department.findOne({ name: departmentName });

    if (!department) {
      throw new ApiError(404, "Department not found.");
    }

    target.department = department.name;
  }

  if (req.body.name) {
    target.name = req.body.name;
  }

  if (req.body.email) {
    target.email = req.body.email.toLowerCase();
  }

  if (req.body.registrationNumber) {
    const registrationNumber = normalizeRegistrationNumber(req.body.registrationNumber);
    const existingRegistration = await User.findOne({
      registrationNumber,
      _id: { $ne: target._id },
    }).select("_id");

    if (existingRegistration) {
      throw new ApiError(409, "Registration number already exists.");
    }

    target.registrationNumber = registrationNumber;
  }

  if (typeof req.body.year === "number") {
    target.year = req.body.year;
  }

  if (typeof req.body.isBlocked === "boolean") {
    target.isBlocked = req.body.isBlocked;
  }

  if (req.user.role === "ADMIN") {
    if (req.body.role) {
      target.role = req.body.role;
    }
    if (Array.isArray(req.body.permissions)) {
      target.permissions = req.body.permissions;
    }
  }

  await target.save();

  await logActivity({
    actorId: req.user._id,
    targetUserId: target._id,
    action: typeof req.body.isBlocked === "boolean" ? "USER_STATUS_CHANGED" : "USER_UPDATED",
    message: `${req.user.name} updated ${target.name}.`,
    metadata: {
      changedFields: Object.keys(req.body),
    },
  });

  res.json(sanitizeUser(target));
});

export const bulkCreateUsers = catchAsync(async (req, res) => {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Only admins can bulk create users.");
  }

  const users = req.body.users || [];
  if (!Array.isArray(users) || !users.length) {
    throw new ApiError(400, "At least one user is required.");
  }

  const normalizedUsers = users.map((entry) => ({
    name: buildDisplayName(entry),
    email: entry.email.toLowerCase(),
    registrationNumber: normalizeRegistrationNumber(entry.registrationNumber),
    password: entry.password,
    role: entry.role,
    department: normalizeDepartmentName(entry.department),
    year: Number(entry.year),
    permissions: Array.isArray(entry.permissions) ? entry.permissions : [],
  }));

  const duplicateEmails = normalizedUsers.filter(
    (entry, index, array) => array.findIndex((item) => item.email === entry.email) !== index
  );
  if (duplicateEmails.length) {
    throw new ApiError(409, "Bulk upload contains duplicate emails.");
  }

  const duplicateRegistrations = normalizedUsers.filter(
    (entry, index, array) =>
      array.findIndex((item) => item.registrationNumber === entry.registrationNumber) !== index
  );
  if (duplicateRegistrations.length) {
    throw new ApiError(409, "Bulk upload contains duplicate registration numbers.");
  }

  const departmentNames = [...new Set(normalizedUsers.map((entry) => entry.department))];
  const departments = await Department.find({ name: { $in: departmentNames } }).select("name");
  if (departments.length !== departmentNames.length) {
    throw new ApiError(404, "One or more departments were not found.");
  }

  const [existingEmails, existingRegistrations] = await Promise.all([
    User.find({ email: { $in: normalizedUsers.map((entry) => entry.email) } }).select("email"),
    User.find({
      registrationNumber: { $in: normalizedUsers.map((entry) => entry.registrationNumber) },
    }).select("registrationNumber"),
  ]);

  if (existingEmails.length) {
    throw new ApiError(409, `Users already exist for: ${existingEmails.map((entry) => entry.email).join(", ")}`);
  }

  if (existingRegistrations.length) {
    throw new ApiError(
      409,
      `Registration numbers already exist: ${existingRegistrations
        .map((entry) => entry.registrationNumber)
        .join(", ")}`
    );
  }

  const createdUsers = await User.create(normalizedUsers);

  await logActivity({
    actorId: req.user._id,
    action: "USER_BULK_CREATED",
    message: `${req.user.name} created ${createdUsers.length} users in bulk.`,
    metadata: {
      createdUserIds: createdUsers.map((entry) => entry._id),
      departments: [...new Set(createdUsers.map((entry) => entry.department))],
    },
  });

  res.status(201).json({
    createdCount: createdUsers.length,
    users: createdUsers.map((entry) => sanitizeUser(entry)),
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Only admins can delete users.");
  }

  const target = await User.findById(req.params.id);
  if (!target) {
    throw new ApiError(404, "User not found.");
  }

  await target.deleteOne();
  await logActivity({
    actorId: req.user._id,
    targetUserId: target._id,
    action: "USER_DELETED",
    message: `${req.user.name} deleted ${target.name}.`,
    metadata: { email: target.email },
  });

  res.status(204).send();
});

export const bulkDeleteUsers = catchAsync(async (req, res) => {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Only admins can bulk delete users.");
  }

  const ids = req.body.ids || [];
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "At least one user id is required.");
  }

  const users = await User.find({ _id: { $in: ids } });
  await User.deleteMany({ _id: { $in: ids } });

  await logActivity({
    actorId: req.user._id,
    action: "USER_BULK_DELETED",
    message: `${req.user.name} deleted ${users.length} users.`,
    metadata: {
      ids,
      emails: users.map((user) => user.email),
    },
  });

  res.json({ deletedCount: users.length });
});

export const resetUserPassword = catchAsync(async (req, res) => {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Only admins can reset passwords.");
  }

  const user = await User.findById(req.params.id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.password = req.body.password;
  await user.save();

  await logActivity({
    actorId: req.user._id,
    targetUserId: user._id,
    action: "USER_PASSWORD_RESET",
    message: `${req.user.name} reset the password for ${user.name}.`,
  });

  res.json({ message: "Password reset successfully." });
});

export const getAuditLogs = catchAsync(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 50);
  const logs = await ActivityLog.find()
    .populate("actorId", "name role")
    .populate("targetUserId", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(logs);
});

export const getAnalytics = catchAsync(async (_req, res) => {
  const analytics = await getAdminAnalytics();
  res.json(analytics);
});

// Mock Test Management
export const getAllMockTests = catchAsync(async (req, res) => {
  const mockTests = await MockTest.find({})
    .populate("questions.problemId", "title difficulty slug problemCode")
    .sort({ createdAt: -1 });

  res.json(mockTests);
});

export const createMockTest = catchAsync(async (req, res) => {
  const { title, durationMinutes, company, problemIds } = req.body;

  if (!title || !durationMinutes || !problemIds || problemIds.length === 0) {
    throw new ApiError(400, "Title, duration, and at least one problem are required.");
  }

  const problems = await Problem.find({ _id: { $in: problemIds } }).select("_id");

  if (problems.length !== problemIds.length) {
    throw new ApiError(400, "Some problems were not found.");
  }

  const mockTest = await MockTest.create({
    title,
    durationMinutes,
    company: company || "",
    questions: problemIds.map((problemId, index) => ({
      type: "coding",
      prompt: "",
      problemId,
      order: index + 1,
    })),
  });

  await mockTest.populate("questions.problemId", "title difficulty slug problemCode");
  res.status(201).json(mockTest);
});

export const updateMockTest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, durationMinutes, company, problemIds } = req.body;

  const mockTest = await MockTest.findById(id);
  if (!mockTest) {
    throw new ApiError(404, "Mock test not found.");
  }

  if (title) mockTest.title = title;
  if (durationMinutes) mockTest.durationMinutes = durationMinutes;
  if (company !== undefined) mockTest.company = company;

  if (problemIds && problemIds.length > 0) {
    const problems = await Problem.find({ _id: { $in: problemIds } }).select("_id");
    if (problems.length !== problemIds.length) {
      throw new ApiError(400, "Some problems were not found.");
    }

    mockTest.questions = problemIds.map((problemId, index) => ({
      type: "coding",
      prompt: "",
      problemId,
      order: index + 1,
    }));
  }

  await mockTest.save();
  await mockTest.populate("questions.problemId", "title difficulty slug problemCode");

  res.json(mockTest);
});

export const deleteMockTest = catchAsync(async (req, res) => {
  const { id } = req.params;

  const mockTest = await MockTest.findByIdAndDelete(id);
  if (!mockTest) {
    throw new ApiError(404, "Mock test not found.");
  }

  res.json({ message: "Mock test deleted successfully." });
});
