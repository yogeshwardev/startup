import { Router } from "express";
import { getSubmissionsByProblem, getSubmissionsByUser } from "../controllers/submissionController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/problem/:problemId", protect, getSubmissionsByProblem);
router.get("/:userId", protect, getSubmissionsByUser);

export default router;
