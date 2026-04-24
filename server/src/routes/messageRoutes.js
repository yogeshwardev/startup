import { Router } from "express";
import { contactAdmin, getMessages } from "../controllers/messageController.js";
import { authorize, protect } from "../middleware/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/contact-admin",
  protect,
  authorize("TEACHER", "ADMIN"),
  validate([body("message").trim().notEmpty().withMessage("Message is required.")]),
  contactAdmin
);
router.get("/messages", protect, authorize("ADMIN"), getMessages);

export default router;
