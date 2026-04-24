import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { loginValidator, registerValidator } from "../validators/authValidators.js";

const router = Router();

router.post("/register", validate(registerValidator), register);
router.post("/login", validate(loginValidator), login);

export default router;
