import { Router } from "express";
import { body, param } from "express-validator";
import {
  getPracticeSessionByProblem,
  reportPracticeViolation,
  startPracticeSession,
} from "../controllers/practiceSessionController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.get(
  "/problem/:problemId",
  validate([param("problemId").isMongoId().withMessage("Valid problemId is required.")]),
  getPracticeSessionByProblem
);

router.post(
  "/start",
  validate([
    body("problemId").isMongoId().withMessage("Valid problemId is required."),
  ]),
  startPracticeSession
);

router.post(
  "/:id/violation",
  validate([
    body("reason").trim().notEmpty().withMessage("Violation reason is required."),
    body("eventType")
      .trim()
      .notEmpty()
      .withMessage("Violation eventType is required."),
  ]),
  reportPracticeViolation
);

export default router;
