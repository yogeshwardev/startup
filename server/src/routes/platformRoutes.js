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
import {
  createAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
  getManagedAnnouncements,
  updateAnnouncement,
} from "../controllers/announcementController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);
router.get("/dashboard", getDashboardSummary);
router.get("/daily-challenge", getDailyChallenge);
router.get("/leaderboards", getLeaderboards);
router.get("/department-war", getDepartmentWar);
router.get("/department/leaderboard", getDepartmentLeaderboard);
router.get("/announcements", getActiveAnnouncements);
router.get("/announcements/manage", authorize("TEACHER", "ADMIN"), getManagedAnnouncements);
router.post(
  "/announcements",
  authorize("TEACHER", "ADMIN"),
  validate([
    body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 120 }).withMessage("Title is too long."),
    body("message").trim().notEmpty().withMessage("Message is required.").isLength({ max: 1200 }).withMessage("Message is too long."),
    body("priority").optional().isIn(["normal", "important", "urgent"]).withMessage("Priority is invalid."),
    body("isActive").optional().isBoolean().withMessage("isActive must be true or false."),
  ]),
  createAnnouncement
);
router.patch(
  "/announcements/:id",
  authorize("TEACHER", "ADMIN"),
  validate([
    body("title").optional().trim().notEmpty().withMessage("Title is required.").isLength({ max: 120 }).withMessage("Title is too long."),
    body("message").optional().trim().notEmpty().withMessage("Message is required.").isLength({ max: 1200 }).withMessage("Message is too long."),
    body("priority").optional().isIn(["normal", "important", "urgent"]).withMessage("Priority is invalid."),
    body("isActive").optional().isBoolean().withMessage("isActive must be true or false."),
  ]),
  updateAnnouncement
);
router.delete("/announcements/:id", authorize("TEACHER", "ADMIN"), deleteAnnouncement);
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
