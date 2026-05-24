import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLE_LIST, ROLES } from "../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    userCode: {
      type: String,
      unique: true,
      sparse: true,
      match: /^\d{6}$/,
    },
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
    phone: {
      type: String,
      required: true,
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
    isPaid: {
      type: Boolean,
      default: false,
    },
    planType: {
      type: String,
      enum: ['FREE', 'SEMESTER', 'YEARLY', 'GRADUATION'],
      default: 'FREE',
    },
    paymentId: {
      type: String,
    },
    paymentTime: {
      type: Date,
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
  // Generate userCode if not exists
  if (!this.userCode) {
    try {
      // Import Problem model here to avoid circular dependencies
      const { Problem } = await import("./Problem.js");
      
      // Get highest problem code
      const highestProblem = await Problem.findOne().sort({ problemCode: -1 }).select("problemCode");
      let problemCodeNum = 0;
      if (highestProblem?.problemCode) {
        const digits = highestProblem.problemCode.replace(/\D/g, "");
        problemCodeNum = parseInt(digits, 10) || 0;
      }
      
      // Get highest user code
      const highestUser = await this.constructor.findOne().sort({ userCode: -1 }).select("userCode");
      const userCodeNum = highestUser?.userCode ? parseInt(highestUser.userCode, 10) : problemCodeNum;
      
      // Generate next user code
      const nextCode = userCodeNum + 1;
      this.userCode = String(nextCode).padStart(6, "0");
    } catch (error) {
      console.error("Error generating userCode:", error);
      next(error);
      return;
    }
  }

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
