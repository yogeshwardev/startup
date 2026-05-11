import mongoose from "mongoose";
import { getAdminAnalytics } from "./src/services/analyticsService.js";

mongoose.connect("mongodb://localhost:27017/campusarena").then(async () => {
  try {
    const analytics = await getAdminAnalytics();
    console.log("Analytics:", JSON.stringify(analytics, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
});
