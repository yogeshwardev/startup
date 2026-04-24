import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const validate = (validations) => async (req, res, next) => {
  for (const validation of validations) {
    await validation.run(req);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, errors.array()[0].msg));
  }

  return next();
};
