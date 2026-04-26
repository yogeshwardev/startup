import mongoose from "mongoose";
import { Company } from "./src/models/Company.js";
import { Question } from "./src/models/Question.js";
import { env } from "./src/config/env.js";

const verifySeed = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB");
    
    const companies = await Company.find();
    console.log(`\nTotal Companies: ${companies.length}\n`);
    
    for (const company of companies) {
      const totalQuestions = await Question.countDocuments({ companyName: company.name });
      const codingQuestions = await Question.countDocuments({ companyName: company.name, type: "coding" });
      const aptitudeQuestions = await Question.countDocuments({ companyName: company.name, type: "aptitude" });
      const interviewQuestions = await Question.countDocuments({ companyName: company.name, type: "interview" });
      
      console.log(`${company.name}:`);
      console.log(`  Total: ${totalQuestions}`);
      console.log(`  - Coding: ${codingQuestions}`);
      console.log(`  - Aptitude: ${aptitudeQuestions}`);
      console.log(`  - Interview: ${interviewQuestions}`);
      console.log();
    }
    
    const totalAllQuestions = await Question.countDocuments();
    console.log(`Grand Total Questions: ${totalAllQuestions}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

verifySeed();
