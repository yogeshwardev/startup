import { Router } from "express";
import { body } from "express-validator";
import {
  assignProblem,
  getAdminPanelSummary,
  getDashboardSummary,
  getDailyChallenge,
  getDepartmentLeaderboard,
  getDepartmentWar,
  getLeaderboards,
  getTeacherAssignments,
} from "../controllers/platformController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);
router.get("/dashboard", getDashboardSummary);
router.get("/daily-challenge", getDailyChallenge);
router.get("/leaderboards", getLeaderboards);
router.get("/department-war", getDepartmentWar);
router.get("/department/leaderboard", getDepartmentLeaderboard);
router.get("/teacher/assignments", authorize("TEACHER", "ADMIN"), getTeacherAssignments);
router.post(
  "/teacher/assignments",
  authorize("TEACHER", "ADMIN"),
  validate([
    body("studentId").isMongoId().withMessage("studentId is required."),
    body("problemId").isMongoId().withMessage("problemId is required."),
    body("dueDate").optional().isISO8601().withMessage("dueDate must be valid."),
  ]),
  assignProblem
);
router.get("/admin/summary", authorize("ADMIN"), getAdminPanelSummary);

export default router;
