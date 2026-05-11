import mongoose from "mongoose";
import { User } from "./src/models/User.js";

mongoose.connect("mongodb://localhost:27017/campusarena").then(async () => {
  try {
    const users = await User.find({ role: "ADMIN" });
    console.log("Admins:", users.map(u => ({ email: u.email, role: u.role })));
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
});
