import { ApiError } from "../utils/ApiError.js";

const store = new Map();

export const rateLimit = ({ windowMs, max, keyPrefix = "global" }) => (req, _res, next) => {
  const key = `${keyPrefix}:${req.ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.expiresAt < now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return next();
  }

  if (entry.count >= max) {
    return next(new ApiError(429, "Too many requests. Please try again shortly."));
  }

  entry.count += 1;
  return next();
};
