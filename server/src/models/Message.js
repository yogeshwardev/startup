import mongoose from "mongoose";
import { ROLE_LIST } from "../constants/roles.js";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true, trim: true },
    role: { type: String, enum: ROLE_LIST, required: true },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
