import { body } from "express-validator";

export const runCodeValidator = [
  body("code").trim().notEmpty().withMessage("Code is required."),
  body("language").isIn(["python", "cpp", "java"]).withMessage("Unsupported language."),
  body("stdin").optional().isString().withMessage("stdin must be a string."),
  body("problemId").optional().isMongoId().withMessage("problemId must be valid."),
];

export const submitValidator = [
  ...runCodeValidator,
  body("problemId").isMongoId().withMessage("Valid problemId is required."),
  body("contestId").optional().isMongoId().withMessage("contestId must be valid."),
  body("practiceSessionId")
    .optional()
    .isMongoId()
    .withMessage("practiceSessionId must be valid."),
];
