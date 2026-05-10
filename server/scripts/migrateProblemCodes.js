import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import { Problem } from "../src/models/Problem.js";

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const problems = await Problem.find({});
    let updatedCount = 0;

    for (const p of problems) {
      let updated = false;

      if (!p.problemCode) {
        p.problemCode = "CC" + String(Math.floor(100000 + Math.random() * 900000));
        updated = true;
      } else if (/^\d{6}$/.test(p.problemCode)) {
        p.problemCode = "CC" + p.problemCode;
        updated = true;
      }

      if (updated) {
        await p.save();
        updatedCount++;
        console.log(`Updated problem ${p._id} to ${p.problemCode}`);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} problems.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
};

migrate();
