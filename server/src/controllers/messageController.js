import { Message } from "../models/Message.js";
import { catchAsync } from "../utils/catchAsync.js";

export const contactAdmin = catchAsync(async (req, res) => {
  const message = await Message.create({
    senderId: req.user._id,
    message: req.body.message,
    role: req.user.role,
  });

  res.status(201).json(message);
});

export const getMessages = catchAsync(async (_req, res) => {
  const messages = await Message.find().populate("senderId", "name email role").sort({ createdAt: -1 });
  res.json(messages);
});
