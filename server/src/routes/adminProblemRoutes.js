import { Router } from "express";
import { body } from "express-validator";
import { createProblem, deleteProblem, updateProblem } from "../controllers/problemController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createProblemValidator, updateProblemValidator } from "../validators/problemValidators.js";

const router = Router();

router.use(protect, authorize("ADMIN"));
router.post("/", validate(createProblemValidator), createProblem);
router.put("/:id", validate(updateProblemValidator), updateProblem);
router.delete("/:id", deleteProblem);

export default router;
