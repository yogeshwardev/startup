import { Router } from "express";
import { query, param, body } from "express-validator";
import {
  getAllCompanies,
  getCompanyDetails,
  getCompanyQuestions,
  getCompanyProblems,
  getQuestion,
  getQuestionsByTopic,
  getCompanyTopics,
  markQuestionSolved,
  toggleBookmarkQuestion,
  getUserProgress,
  submitPlacementSolution,
  getPlacementSubmissions,
  createCompany,
  updateCompany,
  deleteCompany,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getCompanyQuestionsAdmin,
  searchProblemsForCompany,
  updateCompanyProblemAssignments,
} from "../controllers/placementController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { SUPPORTED_LANGUAGES } from "../constants/languages.js";

const router = Router();

// Public routes
router.get("/companies", getAllCompanies);

router.get(
  "/companies/:name",
  validate([param("name").trim().notEmpty().withMessage("Company name is required.")]),
  getCompanyDetails
);

router.get(
  "/companies/:name/questions",
  validate([param("name").trim().notEmpty().withMessage("Company name is required.")]),
  getCompanyQuestions
);

router.get(
  "/companies/:name/problems",
  validate([param("name").trim().notEmpty().withMessage("Company name is required.")]),
  getCompanyProblems
);

router.get(
  "/companies/:name/topics",
  validate([param("name").trim().notEmpty().withMessage("Company name is required.")]),
  getCompanyTopics
);

router.get(
  "/companies/:name/topic/:topic",
  validate([
    param("name").trim().notEmpty().withMessage("Company name is required."),
    param("topic").trim().notEmpty().withMessage("Topic is required."),
  ]),
  getQuestionsByTopic
);

router.get(
  "/question/:id",
  validate([param("id").isMongoId().withMessage("Valid question ID is required.")]),
  getQuestion
);

// Protected routes
router.use(protect);

router.post(
  "/mark-solved",
  validate([body("questionId").isMongoId().withMessage("Valid question ID is required.")]),
  markQuestionSolved
);

router.post(
  "/toggle-bookmark",
  validate([body("questionId").isMongoId().withMessage("Valid question ID is required.")]),
  toggleBookmarkQuestion
);

router.get("/progress/me", getUserProgress);

router.post(
  "/submit-solution",
  validate([
    body("questionId").isMongoId().withMessage("Valid question ID is required."),
    body("code").trim().notEmpty().withMessage("Code is required."),
    body("language").isIn(SUPPORTED_LANGUAGES).withMessage("Invalid language."),
  ]),
  submitPlacementSolution
);

router.get(
  "/question/:id/submissions",
  validate([param("id").isMongoId().withMessage("Valid question ID is required.")]),
  getPlacementSubmissions
);

// Admin routes
router.post(
  "/admin/companies",
  validate([
    body("name").trim().notEmpty().withMessage("Company name is required."),
    body("type").isIn(["Mass Hiring", "Product Based", "Startup", "Consulting"]).withMessage("Invalid company type."),
  ]),
  createCompany
);

router.patch(
  "/admin/companies/:name",
  validate([param("name").trim().notEmpty().withMessage("Company name is required.")]),
  updateCompany
);

router.delete(
  "/admin/companies/:name",
  validate([param("name").trim().notEmpty().withMessage("Company name is required.")]),
  deleteCompany
);

router.post(
  "/admin/questions",
  validate([
    body("companyName").trim().notEmpty().withMessage("Company name is required."),
    body("type").isIn(["coding", "aptitude", "interview"]).withMessage("Invalid question type."),
    body("difficulty").isIn(["easy", "medium", "hard"]).withMessage("Invalid difficulty level."),
    body("title").trim().notEmpty().withMessage("Question title is required."),
  ]),
  addQuestion
);

router.patch(
  "/admin/questions/:id",
  validate([param("id").isMongoId().withMessage("Valid question ID is required.")]),
  updateQuestion
);

router.delete(
  "/admin/questions/:id",
  validate([param("id").isMongoId().withMessage("Valid question ID is required.")]),
  deleteQuestion
);

router.get(
  "/admin/companies/:name/questions",
  validate([param("name").trim().notEmpty().withMessage("Company name is required.")]),
  getCompanyQuestionsAdmin
);

router.get(
  "/admin/companies/:name/problems",
  validate([param("name").trim().notEmpty().withMessage("Company name is required.")]),
  searchProblemsForCompany
);

router.patch(
  "/admin/companies/:name/problems",
  validate([
    param("name").trim().notEmpty().withMessage("Company name is required."),
    body("problemIds").isArray({ min: 1 }).withMessage("At least one problem is required."),
    body("problemIds.*").isMongoId().withMessage("Valid problem IDs are required."),
    body("action").optional().isIn(["add", "remove"]).withMessage("Invalid assignment action."),
  ]),
  updateCompanyProblemAssignments
);

export default router;
