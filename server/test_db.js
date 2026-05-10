import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/campusarena")
  .then(async () => {
    const db = mongoose.connection.db;
    const problems = await db.collection("problems").find({}).toArray();
    if (problems.length > 0) {
      console.log(problems[problems.length - 1].driverCode.cpp);
    } else {
      console.log("No problem found");
    }
    process.exit(0);
  });
