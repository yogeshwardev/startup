import { Router } from "express";
import { runCode, submitSolution } from "../controllers/executionController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { runCodeValidator, submitValidator } from "../validators/executionValidators.js";

const router = Router();

router.post("/run-code", protect, validate(runCodeValidator), runCode);
router.post("/submit", protect, validate(submitValidator), submitSolution);

export default router;
