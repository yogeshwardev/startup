import { Router } from "express";
import { body } from "express-validator";
import { createContest, getContestById, getContests } from "../controllers/platformController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);
router.get("/", getContests);
router.get("/:id", getContestById);
router.post(
  "/",
  authorize("ADMIN"),
  validate([
    body("title").trim().notEmpty().withMessage("title is required."),
    body("startTime").isISO8601().withMessage("startTime must be valid."),
    body("endTime").isISO8601().withMessage("endTime must be valid."),
    body("problems").isArray({ min: 1 }).withMessage("problems must include at least one item."),
  ]),
  createContest
);

export default router;
