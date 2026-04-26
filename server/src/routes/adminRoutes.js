import { Router } from "express";
import { body } from "express-validator";
import {
  bulkCreateUsers,
  bulkDeleteUsers,
  createUser,
  deleteUser,
  getAuditLogs,
  getAnalytics,
  getUsers,
  resetUserPassword,
  updateUser,
  getAllMockTests,
  createMockTest,
  updateMockTest,
  deleteMockTest,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { ROLE_LIST } from "../constants/roles.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

router.get(
  "/users",
  protect,
  authorize("ADMIN", "TEACHER"),
  rateLimit({ windowMs: 60_000, max: 120, keyPrefix: "users-read" }),
  getUsers
);
router.post(
  "/users",
  protect,
  authorize("ADMIN"),
  rateLimit({ windowMs: 60_000, max: 20, keyPrefix: "users-create" }),
  validate([
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
    body("registrationNumber")
      .trim()
      .notEmpty()
      .withMessage("Registration number is required."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
    body("role").isIn(ROLE_LIST).withMessage("Invalid role."),
    body("permissions").optional().isArray().withMessage("Permissions must be an array."),
    body("name").optional().trim(),
    body("department").trim().notEmpty().withMessage("Department is required."),
    body("year").isInt({ min: 1, max: 6 }).withMessage("Year must be between 1 and 6."),
  ]),
  createUser
);
router.post(
  "/users/bulk",
  protect,
  authorize("ADMIN"),
  rateLimit({ windowMs: 60_000, max: 10, keyPrefix: "users-bulk-create" }),
  validate([
    body("users").isArray({ min: 1 }).withMessage("Users must be a non-empty array."),
    body("users.*.email")
      .isEmail()
      .withMessage("Valid email is required.")
      .custom((email) => {
        const collegeEmailPattern = /@([a-z0-9-]+\.)+(edu|edu\.[a-z]{2,}|ac\.[a-z]{2,})$/i;
        if (!collegeEmailPattern.test(email)) {
          throw new Error("College email is required.");
        }
        return true;
      }),
    body("users.*.registrationNumber")
      .trim()
      .notEmpty()
      .withMessage("Registration number is required."),
    body("users.*.password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters."),
    body("users.*.role").isIn(ROLE_LIST).withMessage("Invalid role."),
    body("users.*.permissions").optional().isArray().withMessage("Permissions must be an array."),
    body("users.*.name").optional().trim(),
    body("users.*.department").trim().notEmpty().withMessage("Department is required."),
    body("users.*.year")
      .isInt({ min: 1, max: 6 })
      .withMessage("Year must be between 1 and 6."),
  ]),
  bulkCreateUsers
);
router.put(
  "/users/:id",
  protect,
  authorize("ADMIN", "TEACHER"),
  rateLimit({ windowMs: 60_000, max: 40, keyPrefix: "users-update" }),
  validate([
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty."),
    body("email").optional().isEmail().withMessage("Valid email is required."),
    body("registrationNumber")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Registration number is required."),
    body("role").optional().isIn(ROLE_LIST).withMessage("Invalid role."),
    body("permissions").optional().isArray().withMessage("Permissions must be an array."),
    body("department").optional().trim().notEmpty().withMessage("Department is required."),
    body("year").optional().isInt({ min: 1, max: 6 }).withMessage("Year must be between 1 and 6."),
    body("isBlocked").optional().isBoolean().withMessage("isBlocked must be boolean."),
  ]),
  updateUser
);
router.delete("/users/:id", protect, authorize("ADMIN"), deleteUser);
router.post(
  "/users/bulk-delete",
  protect,
  authorize("ADMIN"),
  validate([body("ids").isArray({ min: 1 }).withMessage("ids must be a non-empty array.")]),
  bulkDeleteUsers
);
router.patch(
  "/users/:id/password",
  protect,
  authorize("ADMIN"),
  validate([body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")]),
  resetUserPassword
);
router.get("/analytics", protect, authorize("ADMIN", "TEACHER"), getAnalytics);
router.get("/audit-logs", protect, authorize("ADMIN", "TEACHER"), getAuditLogs);

// Mock Test Management routes
router.get(
  "/mock-tests",
  protect,
  authorize("ADMIN", "TEACHER"),
  getAllMockTests
);

router.post(
  "/mock-tests",
  protect,
  authorize("ADMIN", "TEACHER"),
  validate([
    body("title").trim().notEmpty().withMessage("Title is required."),
    body("durationMinutes").isInt({ min: 1, max: 480 }).withMessage("Duration must be between 1 and 480 minutes."),
    body("company").optional().trim(),
    body("problemIds").isArray({ min: 1 }).withMessage("At least one problem is required."),
  ]),
  createMockTest
);

router.put(
  "/mock-tests/:id",
  protect,
  authorize("ADMIN", "TEACHER"),
  validate([
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty."),
    body("durationMinutes").optional().isInt({ min: 1, max: 480 }).withMessage("Duration must be between 1 and 480 minutes."),
    body("company").optional().trim(),
    body("problemIds").optional().isArray({ min: 1 }).withMessage("At least one problem is required."),
  ]),
  updateMockTest
);

router.delete(
  "/mock-tests/:id",
  protect,
  authorize("ADMIN", "TEACHER"),
  deleteMockTest
);

export default router;
