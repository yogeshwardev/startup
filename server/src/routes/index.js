import { Router } from "express";
import adminProblemRoutes from "./adminProblemRoutes.js";
import authRoutes from "./authRoutes.js";
import contestRoutes from "./contestRoutes.js";
import executionRoutes from "./executionRoutes.js";
import messageRoutes from "./messageRoutes.js";
import platformRoutes from "./platformRoutes.js";
import problemRoutes from "./problemRoutes.js";
import practiceSessionRoutes from "./practiceSessionRoutes.js";
import profileRoutes from "./profileRoutes.js";
import submissionRoutes from "./submissionRoutes.js";
import teacherRoutes from "./teacherRoutes.js";
import adminRoutes from "./adminRoutes.js";

const router = Router();

router.use("/", authRoutes);
router.use("/", executionRoutes);
router.use("/", teacherRoutes);
router.use("/problems", problemRoutes);
router.use("/practice-sessions", practiceSessionRoutes);
router.use("/profiles", profileRoutes);
router.use("/admin/problems", adminProblemRoutes);
router.use("/contests", contestRoutes);
router.use("/submissions", submissionRoutes);
router.use("/", adminRoutes);
router.use("/", messageRoutes);
router.use("/", platformRoutes);

export default router;
