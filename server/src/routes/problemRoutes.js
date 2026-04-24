import { Router } from "express";
import {
  getProblemBySlug,
  getProblems,
  toggleBookmark,
} from "../controllers/problemController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getProblems);
router.get("/:slug", protect, getProblemBySlug);
router.post("/:id/bookmark", protect, toggleBookmark);

export default router;
