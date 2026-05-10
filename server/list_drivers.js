import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/campusarena")
  .then(async () => {
    const db = mongoose.connection.db;
    const problems = await db.collection("problems").find({}).toArray();
    problems.forEach(p => {
      console.log(`\n\n--- Problem: ${p.title} ---`);
      console.log(p.driverCode?.cpp);
    });
    process.exit(0);
  });
