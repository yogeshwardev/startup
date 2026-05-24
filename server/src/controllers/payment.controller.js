import Razorpay from "razorpay";
import crypto from "crypto";
import { User } from "../models/User.js";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc Create a new Razorpay order
 * @route POST /api/payment/create-order
 * @access Private
 */
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    // Validate amount >= 100 paise
    if (!amount || amount < 100) {
      return res.status(400).json({ error: "Amount must be at least 100 paise (₹1)" });
    }

    const options = {
      amount, // amount in the smallest currency unit
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ error: "Failed to create Razorpay order" });
    }

    res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ error: "Failed to process payment request" });
  }
};

/**
 * @desc Verify Razorpay payment signature
 * @route POST /api/payment/verify-payment
 * @access Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment fields" });
    }

    // Verify signature using HMAC-SHA256
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Determine plan based on amount or just default to YEARLY for now based on prompt context
      // In a robust system we would pass planType in notes
      let planType = 'YEARLY';
      
      await User.findByIdAndUpdate(req.user.id, {
        isPaid: true,
        planType: planType,
        paymentId: razorpay_payment_id,
        paymentTime: new Date()
      });

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        planType: planType
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Invalid payment signature",
      });
    }
  } catch (error) {
    console.error("Razorpay Verify Signature Error:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};
