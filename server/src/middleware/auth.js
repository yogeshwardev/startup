import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { verifyToken } from "../utils/jwt.js";

export const protect = catchAsync(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    throw new ApiError(401, "Authentication required.");
  }

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id);

  if (!user || user.isBlocked) {
    throw new ApiError(401, "Account is unavailable.");
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have access to this resource."));
  }

  return next();
};
