import mongoose from "mongoose";
import { Problem } from "./src/models/Problem.js";

mongoose.connect("mongodb://localhost:27017/campusarena").then(async () => {
  try {
    console.log("Connected to database. Deleting all problems...");
    const result = await Problem.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} problems.`);
  } catch(e) {
    console.error("Error deleting problems:", e);
  } finally {
    process.exit(0);
  }
});
