import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLE_LIST, ROLES } from "../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ROLE_LIST,
      default: ROLES.STUDENT,
    },
    permissions: {
      type: [String],
      default: [],
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    following: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    profile: {
      goal: String,
      activity: String,
      bio: String,
      ingredients: [String],
      skills: {
        type: [String],
        default: [],
      },
      socialLinks: {
        github: String,
        linkedin: String,
        instagram: String,
        leetcode: String,
        twitter: String,
        portfolio: String,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
