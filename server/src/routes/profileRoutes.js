import { Router } from "express";
import { body, param } from "express-validator";
import {
  getMyProfile,
  getProfileConnections,
  getProfileChat,
  getUserProfile,
  searchProfiles,
  sendProfileChatMessage,
  toggleFollowUser,
  updateMySkills,
  updateMySocialLinks,
  updateMyBio,
} from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.get("/me", getMyProfile);
router.get("/search", searchProfiles);
router.get(
  "/:id/connections",
  validate([param("id").isMongoId().withMessage("Valid user id is required.")]),
  getProfileConnections
);
router.patch(
  "/me/skills",
  validate([
    body("skills").isArray().withMessage("Skills must be an array."),
    body("skills.*").trim().notEmpty().withMessage("Skill cannot be empty."),
  ]),
  updateMySkills
);
router.get(
  "/:id",
  validate([param("id").isMongoId().withMessage("Valid user id is required.")]),
  getUserProfile
);
router.post(
  "/:id/follow",
  validate([param("id").isMongoId().withMessage("Valid user id is required.")]),
  toggleFollowUser
);
router.get(
  "/:id/chat",
  validate([param("id").isMongoId().withMessage("Valid user id is required.")]),
  getProfileChat
);
router.post(
  "/:id/chat",
  validate([
    param("id").isMongoId().withMessage("Valid user id is required."),
    body("message").trim().notEmpty().withMessage("Message is required."),
  ]),
  sendProfileChatMessage
);
router.patch(
  "/me/bio",
  validate([
    body("bio").trim().isLength({ max: 500 }).withMessage("Bio cannot exceed 500 characters."),
  ]),
  updateMyBio
);
router.patch(
  "/me/social-links",
  validate([
    body("socialLinks").isObject().withMessage("Social links must be an object."),
  ]),
  updateMySocialLinks
);

export default router;
