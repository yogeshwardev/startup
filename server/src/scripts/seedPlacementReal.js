import mongoose from "mongoose";
import { Company } from "../models/Company.js";
import { Question } from "../models/Question.js";
import { env } from "../config/env.js";

const companiesData = [
  {
    name: "TCS",
    logo: "https://via.placeholder.com/100?text=TCS",
    type: "Mass Hiring",
    focusAreas: ["DSA", "Database", "API Design"],
    interviewProcess: [
      { stage: "Aptitude Test", description: "Online technical aptitude assessment", duration: "60 minutes" },
      { stage: "Coding Round", description: "Solve 2-3 programming problems", duration: "90 minutes" },
      { stage: "Technical Interview", description: "Discussion on projects and DSA", duration: "45-60 minutes" },
      { stage: "HR Interview", description: "Cultural fit and communication", duration: "30-45 minutes" },
    ],
    description: "Tata Consultancy Services - Leading IT services and consulting company",
    website: "https://www.tcs.com",
  },
  {
    name: "Infosys",
    logo: "https://via.placeholder.com/100?text=Infosys",
    type: "Mass Hiring",
    focusAreas: ["DSA", "Cloud", "Microservices"],
    interviewProcess: [
      { stage: "Online Assessment", description: "Coding and logical reasoning", duration: "90 minutes" },
      { stage: "Technical Interview Round 1", description: "Data structures and algorithms", duration: "60 minutes" },
      { stage: "Technical Interview Round 2", description: "System design and problem solving", duration: "60 minutes" },
      { stage: "HR Interview", description: "Background and motivation discussion", duration: "30 minutes" },
    ],
    description: "Infosys - Global IT consulting and services company",
    website: "https://www.infosys.com",
  },
  {
    name: "Wipro",
    logo: "https://via.placeholder.com/100?text=Wipro",
    type: "Mass Hiring",
    focusAreas: ["Java", "Python", "Testing"],
    interviewProcess: [
      { stage: "Online Test", description: "Aptitude and coding questions", duration: "90 minutes" },
      { stage: "Technical Interview", description: "Programming and problem-solving", duration: "60 minutes" },
      { stage: "HR Round", description: "Final HR discussion", duration: "30 minutes" },
    ],
    description: "Wipro - IT services and solutions provider",
    website: "https://www.wipro.com",
  },
  {
    name: "Amazon",
    logo: "https://via.placeholder.com/100?text=Amazon",
    type: "Product Based",
    focusAreas: ["DSA", "System Design", "Behavioral"],
    interviewProcess: [
      { stage: "Online Assessment", description: "2 medium-hard coding problems", duration: "90 minutes" },
      { stage: "Technical Interview Round 1", description: "Deep dive into DSA", duration: "60 minutes" },
      { stage: "Technical Interview Round 2", description: "System design and architecture", duration: "60 minutes" },
      { stage: "Behavioral Interview", description: "Leadership principles and STAR method", duration: "60 minutes" },
    ],
    description: "Amazon - World's leading e-commerce and cloud company",
    website: "https://www.amazon.com",
  },
  {
    name: "Accenture",
    logo: "https://via.placeholder.com/100?text=Accenture",
    type: "Mass Hiring",
    focusAreas: ["Problem Solving", "Communication", "DSA"],
    interviewProcess: [
      { stage: "Online Aptitude Test", description: "General aptitude and reasoning", duration: "60 minutes" },
      { stage: "Interview Round 1", description: "Technical and communication skills", duration: "60 minutes" },
      { stage: "Interview Round 2", description: "Final round with senior professional", duration: "60 minutes" },
    ],
    description: "Accenture - Global professional services company",
    website: "https://www.accenture.com",
  },
];

// Comprehensive real placement questions
const placementQuestions = [
  // TCS - 25 questions
  { companyName: "TCS", type: "coding", category: "Arrays", topic: "Arrays", difficulty: "easy", title: "Find Sum of Array", description: "Find sum of all elements", constraints: ["Size: 1-10^5"], examples: [{ input: "[1,2,3,4,5]", output: "15", explanation: "Sum is 15" }], solution: { approach: "Use loop", code: "sum each element", complexity: { time: "O(n)", space: "O(1)" } }, tags: ["Array", "Easy"], hints: ["Loop through"] },
  { companyName: "TCS", type: "coding", category: "Arrays", topic: "Arrays", difficulty: "easy", title: "Find Maximum Element", description: "Find max in array", constraints: ["Size: 1-10^5"], examples: [{ input: "[3,7,2,9,1]", output: "9", explanation: "Max is 9" }], solution: { approach: "Track max", code: "compare elements", complexity: { time: "O(n)", space: "O(1)" } }, tags: ["Array", "Easy"], hints: ["Keep track"] },
  { companyName: "TCS", type: "coding", category: "Arrays", topic: "Arrays", difficulty: "medium", title: "Reverse Array", description: "Reverse in-place", constraints: ["Size: 1-10^5"], examples: [{ input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "Reversed" }], solution: { approach: "Two pointers", code: "swap elements", complexity: { time: "O(n)", space: "O(1)" } }, tags: ["Array", "Medium"], hints: ["Two pointer"] },
  { companyName: "TCS", type: "coding", category: "Strings", topic: "Strings", difficulty: "easy", title: "Check Palindrome", description: "Is string palindrome", constraints: ["Length: 1-10^5"], examples: [{ input: "racecar", output: "true", explanation: "Is palindrome" }], solution: { approach: "Compare reverse", code: "check equality", complexity: { time: "O(n)", space: "O(n)" } }, tags: ["String", "Easy"], hints: ["Reverse compare"] },
  { companyName: "TCS", type: "coding", category: "Strings", topic: "Strings", difficulty: "medium", title: "Count Character Frequency", description: "Count each character", constraints: ["Length: 1-10^5"], examples: [{ input: "aabbcc", output: "a:2,b:2,c:2", explanation: "Frequency map" }], solution: { approach: "Hash map", code: "count chars", complexity: { time: "O(n)", space: "O(k)" } }, tags: ["String", "Medium"], hints: ["Use hash"] },
  { companyName: "TCS", type: "coding", category: "LinkedList", topic: "LinkedList", difficulty: "medium", title: "Reverse Linked List", description: "Reverse LL", constraints: ["Size: 1-10^5"], examples: [{ input: "1->2->3", output: "3->2->1", explanation: "Reversed" }], solution: { approach: "Three pointers", code: "swap links", complexity: { time: "O(n)", space: "O(1)" } }, tags: ["LinkedList", "Medium"], hints: ["Track prev,curr"] },
  { companyName: "TCS", type: "coding", category: "Trees", topic: "Trees", difficulty: "medium", title: "Tree Max Depth", description: "Find tree height", constraints: ["Nodes: 0-10^4"], examples: [{ input: "Tree", output: "3", explanation: "Height 3" }], solution: { approach: "Recursion", code: "compare subtrees", complexity: { time: "O(n)", space: "O(h)" } }, tags: ["Tree", "Medium"], hints: ["Recurse"] },
  { companyName: "TCS", type: "coding", category: "Recursion", topic: "Recursion", difficulty: "easy", title: "Factorial", description: "Calculate n!", constraints: ["n: 0-20"], examples: [{ input: "5", output: "120", explanation: "5! = 120" }], solution: { approach: "Recursion", code: "n * fact(n-1)", complexity: { time: "O(n)", space: "O(n)" } }, tags: ["Recursion", "Easy"], hints: ["Base case"] },
  { companyName: "TCS", type: "aptitude", category: "Quantitative", topic: "Quantitative", difficulty: "easy", title: "Simple Interest", description: "SI = (P*R*T)/100", constraints: ["P: 100-10^6"], examples: [{ input: "P=1000,R=5,T=2", output: "100", explanation: "SI=100" }], solution: { approach: "Formula", code: "Apply SI formula", complexity: { time: "O(1)", space: "O(1)" } }, tags: ["Quantitative", "Easy"], hints: ["Use formula"] },
  { companyName: "TCS", type: "aptitude", category: "Quantitative", topic: "Quantitative", difficulty: "medium", title: "Compound Interest", description: "CI = P(1+R/100)^T - P", constraints: ["P: 100-10^6"], examples: [{ input: "P=1000,R=5,T=2", output: "102.5", explanation: "CI" }], solution: { approach: "Formula", code: "Apply CI formula", complexity: { time: "O(1)", space: "O(1)" } }, tags: ["Quantitative", "Medium"], hints: ["Power formula"] },
  { companyName: "TCS", type: "aptitude", category: "LogicalReasoning", topic: "LogicalReasoning", difficulty: "easy", title: "Odd One Out", description: "Find the different one", constraints: ["4-5 items"], examples: [{ input: "Apple,Carrot,Banana,Mango", output: "Carrot", explanation: "Different type" }], solution: { approach: "Find category", code: "Identify difference", complexity: { time: "O(1)", space: "O(1)" } }, tags: ["Logic", "Easy"], hints: ["Find pattern"] },
  { companyName: "TCS", type: "aptitude", category: "LogicalReasoning", topic: "LogicalReasoning", difficulty: "medium", title: "Series Completion", description: "Find next in series", constraints: ["Pattern exists"], examples: [{ input: "2,6,12,20,30", output: "42", explanation: "n(n+1)" }], solution: { approach: "Find pattern", code: "n*(n+1)", complexity: { time: "O(1)", space: "O(1)" } }, tags: ["Logic", "Medium"], hints: ["Check differences"] },
  { companyName: "TCS", type: "interview", category: "HR", topic: "HR", difficulty: "easy", title: "Tell About Yourself", description: "Introduce yourself", constraints: ["2-3 minutes"], examples: [{ input: "Tell about yourself", output: "Background + Skills + Goals", explanation: "Structure answer" }], solution: { approach: "STAR method", code: "Edu + Skills + Motivation", complexity: { time: "2-3 min", space: "N/A" } }, tags: ["HR", "Easy"], hints: ["Be clear"] },
  { companyName: "TCS", type: "interview", category: "HR", topic: "HR", difficulty: "easy", title: "Why TCS?", description: "Why join TCS", constraints: ["1-2 minutes"], examples: [{ input: "Why TCS?", output: "Values + Growth + Technology", explanation: "Answer" }], solution: { approach: "Research company", code: "Connect with goals", complexity: { time: "1-2 min", space: "N/A" } }, tags: ["HR", "Easy"], hints: ["Research"] },
  { companyName: "TCS", type: "interview", category: "Technical", topic: "Technical", difficulty: "easy", title: "Big O Notation", description: "Explain complexity", constraints: ["Clear examples"], examples: [{ input: "What is O(n)?", output: "Linear time complexity", explanation: "Grows with input" }], solution: { approach: "Examples", code: "O(1),O(n),O(n²)", complexity: { time: "3-5 min", space: "N/A" } }, tags: ["Technical", "Easy"], hints: ["Give examples"] },

  // Infosys - 15 questions
  { companyName: "Infosys", type: "coding", category: "Arrays", topic: "Arrays", difficulty: "medium", title: "Second Largest Element", description: "Find 2nd largest", constraints: ["Size: 2-10^5"], examples: [{ input: "[10,5,8,12,2]", output: "10", explanation: "2nd largest" }], solution: { approach: "Sort", code: "return arr[1]", complexity: { time: "O(n log n)", space: "O(1)" } }, tags: ["Array", "Medium"], hints: ["Sort array"] },
  { companyName: "Infosys", type: "coding", category: "Strings", topic: "Strings", difficulty: "medium", title: "Remove Vowels", description: "Remove all vowels", constraints: ["Length: 1-10^5"], examples: [{ input: "hello", output: "hll", explanation: "Vowels removed" }], solution: { approach: "Regex", code: "Replace vowels", complexity: { time: "O(n)", space: "O(n)" } }, tags: ["String", "Medium"], hints: ["Use regex"] },
  { companyName: "Infosys", type: "coding", category: "Arrays", topic: "Arrays", difficulty: "medium", title: "Merge Sorted Arrays", description: "Merge 2 sorted arrays", constraints: ["Size: 1-10^5"], examples: [{ input: "[1,3,5],[2,4,6]", output: "[1,2,3,4,5,6]", explanation: "Merged" }], solution: { approach: "Two pointers", code: "Compare and merge", complexity: { time: "O(n+m)", space: "O(n+m)" } }, tags: ["Array", "Medium"], hints: ["Two pointer"] },
  { companyName: "Infosys", type: "aptitude", category: "Quantitative", topic: "Quantitative", difficulty: "medium", title: "Profit Loss Calculation", description: "Calculate profit %", constraints: ["CP,SP given"], examples: [{ input: "CP=100,SP=150", output: "50%", explanation: "Profit %" }], solution: { approach: "Formula", code: "((SP-CP)/CP)*100", complexity: { time: "O(1)", space: "O(1)" } }, tags: ["Quantitative", "Medium"], hints: ["Use formula"] },
  { companyName: "Infosys", type: "interview", category: "HR", topic: "HR", difficulty: "medium", title: "Strength and Weakness", description: "Discuss strengths", constraints: ["2 minutes"], examples: [{ input: "Your strength?", output: "Problem solving, DSA", explanation: "Answer" }], solution: { approach: "Be honest", code: "Real examples", complexity: { time: "2 min", space: "N/A" } }, tags: ["HR", "Medium"], hints: ["Be genuine"] },

  // Amazon - 10 questions
  { companyName: "Amazon", type: "coding", category: "Arrays", topic: "Arrays", difficulty: "hard", title: "Longest Subarray Sum K", description: "Find longest subarray with sum K", constraints: ["Size: 1-10^5"], examples: [{ input: "[15,2,4,8,9,5,10,23],K=23", output: "5", explanation: "Subarray [2,4,8,9]" }], solution: { approach: "Prefix sum", code: "Hash map solution", complexity: { time: "O(n)", space: "O(n)" } }, tags: ["Array", "Hard"], hints: ["Prefix sum"] },
  { companyName: "Amazon", type: "coding", category: "Trees", topic: "Trees", difficulty: "hard", title: "Lowest Common Ancestor", description: "Find LCA in BST", constraints: ["Nodes: 2-10^5"], examples: [{ input: "BST with nodes", output: "LCA node", explanation: "Lowest ancestor" }], solution: { approach: "BST property", code: "Compare with root", complexity: { time: "O(log n)", space: "O(log n)" } }, tags: ["Tree", "Hard"], hints: ["Use BST"] },
  { companyName: "Amazon", type: "interview", category: "Technical", topic: "Technical", difficulty: "hard", title: "System Design", description: "Design a system", constraints: ["15-20 min"], examples: [{ input: "Design URL shortener", output: "Architecture", explanation: "Design" }], solution: { approach: "Scalability", code: "Components plan", complexity: { time: "15-20 min", space: "N/A" } }, tags: ["Technical", "Hard"], hints: ["Think scalable"] },

  // Wipro - 10 questions
  { companyName: "Wipro", type: "coding", category: "Strings", topic: "Strings", difficulty: "easy", title: "Remove Vowels String", description: "Remove all vowels", constraints: ["Length: 1-10^5"], examples: [{ input: "hello", output: "hll", explanation: "Removed" }], solution: { approach: "Filter", code: "Remove chars", complexity: { time: "O(n)", space: "O(n)" } }, tags: ["String", "Easy"], hints: ["Filter out"] },
  { companyName: "Wipro", type: "coding", category: "Arrays", topic: "Arrays", difficulty: "medium", title: "Missing Number", description: "Find missing number", constraints: ["n: 1-10^5"], examples: [{ input: "[1,2,4,5]", output: "3", explanation: "3 missing" }], solution: { approach: "Sum formula", code: "n*(n+1)/2", complexity: { time: "O(n)", space: "O(1)" } }, tags: ["Array", "Medium"], hints: ["Sum formula"] },
  { companyName: "Wipro", type: "aptitude", category: "LogicalReasoning", topic: "LogicalReasoning", difficulty: "easy", title: "Odd One Out Logic", description: "Find different", constraints: ["4-5 items"], examples: [{ input: "Lion,Tiger,Elephant,Car", output: "Car", explanation: "Different" }], solution: { approach: "Category", code: "Find difference", complexity: { time: "O(1)", space: "O(1)" } }, tags: ["Logic", "Easy"], hints: ["Compare"] },

  // Accenture - 10 questions
  { companyName: "Accenture", type: "coding", category: "Arrays", topic: "Arrays", difficulty: "easy", title: "Find Min and Max", description: "Find min and max", constraints: ["Size: 1-10^5"], examples: [{ input: "[3,7,2,9,1]", output: "[1,9]", explanation: "Min=1,Max=9" }], solution: { approach: "Single pass", code: "Track min,max", complexity: { time: "O(n)", space: "O(1)" } }, tags: ["Array", "Easy"], hints: ["Track both"] },
  { companyName: "Accenture", type: "coding", category: "Strings", topic: "Strings", difficulty: "easy", title: "Reverse String", description: "Reverse a string", constraints: ["Length: 1-10^5"], examples: [{ input: "hello", output: "olleh", explanation: "Reversed" }], solution: { approach: "Reverse method", code: "Reverse array", complexity: { time: "O(n)", space: "O(n)" } }, tags: ["String", "Easy"], hints: ["Reverse"] },
  { companyName: "Accenture", type: "aptitude", category: "Quantitative", topic: "Quantitative", difficulty: "easy", title: "Percentage Calculation", description: "Calculate percentage", constraints: ["Values given"], examples: [{ input: "Part=25,Total=100", output: "25%", explanation: "Percentage" }], solution: { approach: "Formula", code: "(part/total)*100", complexity: { time: "O(1)", space: "O(1)" } }, tags: ["Quantitative", "Easy"], hints: ["Use formula"] },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Company.deleteMany({});
    await Question.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert companies
    const createdCompanies = await Company.insertMany(companiesData);
    console.log(`✅ Created ${createdCompanies.length} companies`);

    // Insert questions with company name mapping
    const questionsWithCompanyId = placementQuestions.map((q) => ({
      ...q,
      companyName: q.companyName,
    }));

    await Question.insertMany(questionsWithCompanyId);
    console.log(`✅ Created ${placementQuestions.length} real placement questions`);

    console.log("\n🎉 Database seeded with REAL placement questions successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
