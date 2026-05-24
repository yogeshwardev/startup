import express from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Currently applying the `protect` middleware assuming users must be logged in to pay.
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);

export default router;
