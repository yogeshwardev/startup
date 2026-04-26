import mongoose from "mongoose";
import { Question } from "./src/models/Question.js";
import { env } from "./src/config/env.js";

const debug = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB\n");

    // Get sample documents
    console.log("📋 SAMPLE QUESTIONS:");
    const samples = await Question.find({ companyName: "TCS", type: "coding" }).limit(3).lean();
    samples.forEach((q, i) => {
      console.log(`\nQuestion ${i+1}:`);
      console.log(`  _id: ${q._id}`);
      console.log(`  companyName: ${q.companyName}`);
      console.log(`  type: ${q.type}`);
      console.log(`  topic: ${q.topic}`);
      console.log(`  difficulty: ${q.difficulty}`);
      console.log(`  title: ${q.title}`);
    });

    console.log("\n---\n");

    // Check for TCS + coding questions
    const tcsQuery = { companyName: "TCS", type: "coding" };
    const tcsCodingCount = await Question.countDocuments(tcsQuery);
    console.log(`✅ TCS coding questions total: ${tcsCodingCount}\n`);

    // Check topics
    const topics = await Question.distinct("topic", { companyName: "TCS", type: "coding" });
    console.log(`✅ Topics for TCS coding:`, topics, "\n");

    // Check if Recursion exists
    const recursionExists = await Question.countDocuments({
      companyName: "TCS",
      type: "coding",
      topic: "Recursion"
    });
    console.log(`✅ Recursion questions in TCS: ${recursionExists}\n`);

    // Check Recursion + easy
    const recursionEasy = await Question.countDocuments({
      companyName: "TCS",
      type: "coding",
      topic: "Recursion",
      difficulty: "easy"
    });
    console.log(`✅ Recursion EASY questions: ${recursionEasy}\n`);

    // Try fetching with different queries
    console.log("🔍 TESTING QUERIES:\n");

    // Query 1: Just company
    const q1 = await Question.find({ companyName: "TCS" }).limit(1).lean();
    console.log(`1. companyName="TCS": ${q1.length} results`);

    // Query 2: Company + type
    const q2 = await Question.find({ companyName: "TCS", type: "coding" }).limit(1).lean();
    console.log(`2. companyName="TCS", type="coding": ${q2.length} results`);

    // Query 3: Company + type + topic
    const q3 = await Question.find({ companyName: "TCS", type: "coding", topic: "Recursion" }).limit(1).lean();
    console.log(`3. companyName="TCS", type="coding", topic="Recursion": ${q3.length} results`);

    // Query 4: Company + type + topic + difficulty
    const q4 = await Question.find({ companyName: "TCS", type: "coding", topic: "Recursion", difficulty: "easy" }).limit(1).lean();
    console.log(`4. All filters: ${q4.length} results`);

    console.log("\n---\n");
    
    // Get totals per company
    const companies = ["TCS", "Infosys", "Wipro", "Amazon", "Accenture"];
    console.log("📊 TOTALS PER COMPANY:\n");
    for (const company of companies) {
      const codingCount = await Question.countDocuments({ companyName: company, type: "coding" });
      const aptitudeCount = await Question.countDocuments({ companyName: company, type: "aptitude" });
      const interviewCount = await Question.countDocuments({ companyName: company, type: "interview" });
      console.log(`${company}: Coding=${codingCount}, Aptitude=${aptitudeCount}, Interview=${interviewCount}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error);
    process.exit(1);
  }
};

debug();
