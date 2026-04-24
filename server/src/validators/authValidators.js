import { body } from "express-validator";
import { ROLE_LIST } from "../constants/roles.js";

export const registerValidator = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required.")
    .custom((email) => {
      const collegeEmailPattern = /@([a-z0-9-]+\.)+(edu|edu\.[a-z]{2,}|ac\.[a-z]{2,})$/i;
      if (!collegeEmailPattern.test(email)) {
        throw new Error("College email is required.");
      }
      return true;
    }),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  body("registrationNumber")
    .trim()
    .notEmpty()
    .withMessage("Registration number is required."),
  body("role").optional().isIn(ROLE_LIST).withMessage("Invalid role."),
  body("department").trim().notEmpty().withMessage("Department is required."),
  body("year").isInt({ min: 1, max: 6 }).withMessage("Year must be between 1 and 6."),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required."),
  body("password").notEmpty().withMessage("Password is required."),
];
