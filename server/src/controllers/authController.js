import { User } from "../models/User.js";
import { ROLES } from "../constants/roles.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";

const buildAuthResponse = (user) => ({
  token: signToken({ id: user._id, role: user.role }),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    registrationNumber: user.registrationNumber,
    role: user.role,
    department: user.department,
    year: user.year,
  },
});

export const register = catchAsync(async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "User already exists.");
  }

  const registrationNumber = req.body.registrationNumber.trim().toUpperCase();
  const existingRegistration = await User.findOne({ registrationNumber });
  if (existingRegistration) {
    throw new ApiError(409, "Registration number already exists.");
  }

  // Self-registration is intentionally locked to students. Elevated roles must be assigned by admin.
  const user = await User.create({
    ...req.body,
    name: req.body.name?.trim() || registrationNumber,
    registrationNumber,
    role: ROLES.STUDENT,
  });
  res.status(201).json(buildAuthResponse(user));
});

export const login = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account is blocked.");
  }

  res.json(buildAuthResponse(user));
});
