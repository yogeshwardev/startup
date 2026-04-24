import { Router } from "express";
import { body } from "express-validator";
import {
  createDepartment,
  getDepartments,
  getStudentById,
  getStudents,
  manageStudent,
  updateStudentDepartment,
} from "../controllers/teacherController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/departments", protect, getDepartments);
router.post(
  "/departments",
  protect,
  authorize("TEACHER", "ADMIN"),
  validate([body("name").trim().notEmpty().withMessage("Department name is required.")]),
  createDepartment
);
router.get("/students", protect, authorize("TEACHER", "ADMIN"), getStudents);
router.get("/student/:id", protect, authorize("TEACHER", "ADMIN"), getStudentById);
router.patch(
  "/student/:id/manage",
  protect,
  authorize("TEACHER", "ADMIN"),
  validate([
    body("department").optional().trim().notEmpty().withMessage("Department is required."),
    body("isBlocked").optional().isBoolean().withMessage("isBlocked must be boolean."),
  ]),
  manageStudent
);
router.patch(
  "/student/:id/department",
  protect,
  authorize("TEACHER", "ADMIN"),
  validate([body("department").trim().notEmpty().withMessage("Department is required.")]),
  updateStudentDepartment
);

export default router;
