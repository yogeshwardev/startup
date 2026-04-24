import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { Department } from "../models/Department.js";
import { DailyChallenge } from "../models/DailyChallenge.js";
import { Problem } from "../models/Problem.js";
import { User } from "../models/User.js";
import { ROLES } from "../constants/roles.js";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const starterCode = {
  python:
    "def solve():\n    # write your solution here\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
  cpp:
    "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n  \n  return 0;\n}\n",
  java:
    "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n  public static void main(String[] args) throws Exception {\n  }\n}\n",
};

const easyTitles = [
  ["Campus Two Sum", ["Array", "Hash Map"]],
  ["Attendance Streak Counter", ["Array"]],
  ["Hostel Room Maximum", ["Array"]],
  ["Library Fine Calculator", ["Math"]],
  ["Exam Hall Palindrome", ["String"]],
  ["Bus Route Frequency", ["Hash Map"]],
  ["Seminar Seat Rotation", ["Array"]],
  ["Notebook Page Sum", ["Prefix Sum"]],
  ["Lunch Token Checker", ["String"]],
  ["Placement Eligibility Count", ["Array"]],
  ["Campus WiFi Signal Peak", ["Array"]],
  ["Club Registration Match", ["Hash Map"]],
  ["Roll Number Reverse", ["Math"]],
  ["Lab Marks Average", ["Array"]],
  ["Department Name Sort", ["Sorting"]],
  ["Question Bank Merge", ["Array"]],
  ["Mess Menu Intersection", ["Hash Set"]],
  ["Project Deadline Gap", ["Math"]],
  ["ID Card Validator", ["String"]],
  ["Scholarship Threshold", ["Array"]],
  ["Parking Slot Count", ["Counting"]],
  ["Morning Run Tracker", ["Array"]],
  ["Event Banner Width", ["Greedy"]],
  ["Classroom Pair Count", ["Math"]],
  ["Assignment Queue Check", ["Queue"]],
  ["Simple GPA Builder", ["Array"]],
  ["Coding Club Votes", ["Hash Map"]],
  ["Internship Day Counter", ["Simulation"]],
  ["Result Sheet Cleaner", ["String"]],
  ["Campus Steps Distance", ["Array"]],
];

const mediumTitles = [
  ["Department Rank Compression", ["Array", "Sorting"]],
  ["Contest Penalty Tracker", ["Heap", "Sorting"]],
  ["Timetable Conflict Detector", ["Intervals"]],
  ["Placement Slot Allocation", ["Greedy"]],
  ["Campus Network Relay", ["Graph", "BFS"]],
  ["Research Paper Scheduler", ["Binary Search"]],
  ["Scholarship Segment Sum", ["Prefix Sum", "Hash Map"]],
  ["Lecture Hall Window", ["Sliding Window"]],
  ["Mock Test Ranking Engine", ["Sorting", "Hash Map"]],
  ["Hostel Corridor Pathfinder", ["Matrix", "BFS"]],
  ["Department Budget Planner", ["Dynamic Programming"]],
  ["Bus Route Transfers", ["Graph"]],
  ["Lab Pair Swaps", ["Greedy", "Array"]],
  ["Exam Revision Groups", ["Two Pointers"]],
  ["Campus Event Timeline", ["Intervals", "Sorting"]],
  ["Attendance Pattern Matcher", ["String", "Hash Map"]],
  ["Library Shelf Balancer", ["Stack"]],
  ["Mess Queue Optimizer", ["Queue", "Simulation"]],
  ["Placement Offer Merge", ["Intervals"]],
  ["Seminar Room Assignment", ["Heap"]],
  ["Code Submission Heatmap", ["Matrix", "Prefix Sum"]],
  ["Project Dependency Order", ["Graph", "Topological Sort"]],
  ["Elective Preference Matcher", ["Greedy"]],
  ["Weekly Streak Analyzer", ["Dynamic Programming"]],
  ["Department Attendance Window", ["Sliding Window"]],
  ["Contest Round Reducer", ["Recursion", "Memoization"]],
  ["Skill Badge Aggregator", ["Hash Map", "Array"]],
  ["Transcript Change Tracker", ["String", "Dynamic Programming"]],
  ["Lab Machine Rotation", ["Simulation"]],
  ["Internship Batch Split", ["Binary Search", "Greedy"]],
];

const hardTitles = [
  ["Campus Grid Escape", ["Graph", "Shortest Path"]],
  ["Department War Dominator", ["Dynamic Programming", "Greedy"]],
  ["Research Cluster Builder", ["Union Find", "Graph"]],
  ["Hostel Allocation Maximizer", ["Binary Search", "Greedy"]],
  ["Exam Seating Reconfiguration", ["Backtracking"]],
  ["Placement Season Optimizer", ["Dynamic Programming"]],
  ["Scholarship Flow Network", ["Graph", "Max Flow"]],
  ["Contest Hack Detection", ["String", "Rolling Hash"]],
  ["University Route Compression", ["Graph", "Tree"]],
  ["Library Archive Queries", ["Segment Tree"]],
  ["Adaptive Mock Test Planner", ["Dynamic Programming", "Bitmask"]],
  ["Course Chain Analyzer", ["Graph", "DFS"]],
  ["Attendance Matrix Flip", ["Matrix", "Greedy"]],
  ["Mess Supply Balancer", ["Binary Search", "Prefix Sum"]],
  ["Department Merge Cost", ["Heap", "Greedy"]],
  ["Placement Cell Matching", ["Dynamic Programming", "Graph"]],
  ["Highway to Campus", ["Shortest Path", "Graph"]],
  ["Seminar Hall Partition", ["Dynamic Programming"]],
  ["Project Team Cut", ["Graph", "Minimum Cut"]],
  ["Faculty Schedule Repair", ["Backtracking", "Constraint Solving"]],
  ["Academic Calendar Compression", ["Intervals", "Data Structures"]],
  ["Research Grant Distribution", ["Dynamic Programming", "Prefix Sum"]],
  ["Contest Round Trip Queries", ["Tree", "LCA"]],
  ["Campus Drone Delivery", ["Graph", "Dijkstra"]],
  ["Mentor Mapping Engine", ["Bitmask", "Dynamic Programming"]],
  ["Hostel Water Network", ["Graph", "MST"]],
  ["Library Pattern Search", ["Trie", "String"]],
  ["Department Rotation Strategy", ["Game Theory", "Dynamic Programming"]],
  ["Placement Statistics Engine", ["Segment Tree", "Fenwick Tree"]],
  ["Graduation Path Minimizer", ["Graph", "Dynamic Programming"]],
];

const buildProblem = (title, difficulty, tags, index, createdBy) => {
  const problemCode = String(100001 + index);
  const constraintsByDifficulty = {
    Easy: ["1 <= n <= 10^3", "Values fit in 32-bit signed integers"],
    Medium: ["1 <= n <= 10^5", "Aim for O(n log n) or better where possible"],
    Hard: ["1 <= n <= 2 * 10^5", "Naive solutions will time out"],
  };

  const visibleCaseByDifficulty = {
    Easy: { input: "5\n1 2 3 4 5\n", expectedOutput: "15" },
    Medium: { input: "6\n1 3 2 6 4 5\n", expectedOutput: "3" },
    Hard: { input: "7\n4 2 7 1 8 3 6\n", expectedOutput: "19" },
  };

  const hiddenCaseByDifficulty = {
    Easy: { input: "4\n8 1 2 9\n", expectedOutput: "20", isHidden: true },
    Medium: { input: "8\n2 5 1 7 3 9 4 6\n", expectedOutput: "4", isHidden: true },
    Hard: { input: "9\n9 1 8 2 7 3 6 4 5\n", expectedOutput: "25", isHidden: true },
  };

  return {
    problemCode,
    title,
    slug: slugify(`${title}-${problemCode}`),
    description: `${title} is a ${difficulty.toLowerCase()} difficulty practice problem for CampusArena. Read the input, apply the required logic, and print the expected output exactly as described.`,
    difficulty,
    tags,
    constraints: constraintsByDifficulty[difficulty],
    inputFormat: "The first line contains an integer n. The second line contains n space separated integers.",
    outputFormat: "Print the required answer on a single line.",
    examples: [
      {
        input: visibleCaseByDifficulty[difficulty].input,
        output: visibleCaseByDifficulty[difficulty].expectedOutput,
        explanation: `Sample walkthrough for ${title}.`,
      },
    ],
    visibleTestCases: [visibleCaseByDifficulty[difficulty]],
    hiddenTestCases: [hiddenCaseByDifficulty[difficulty]],
    starterCode,
    supportedLanguages: ["python", "cpp", "java"],
    timeLimitMs: difficulty === "Hard" ? 2500 : 2000,
    memoryLimitMb: difficulty === "Hard" ? 512 : 256,
    createdBy,
    isDailyEligible: true,
  };
};

const seed = async () => {
  await connectDb();
  await Promise.all([
    Problem.deleteMany({}),
    DailyChallenge.deleteMany({}),
  ]);

  for (const name of ["CSE", "IT", "ECE"]) {
    await Department.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }

  let admin = await User.findOne({ email: "admin@campusarena.edu" });

  if (!admin) {
    admin = await User.create({
      name: "Campus Admin",
      email: "admin@campusarena.edu",
      password: "Admin@123",
      role: ROLES.ADMIN,
      department: "CSE",
      year: 4,
    });
  }

  const easyProblems = easyTitles.map(([title, tags], index) =>
    buildProblem(title, "Easy", tags, index, admin._id)
  );
  const mediumProblems = mediumTitles.map(([title, tags], index) =>
    buildProblem(title, "Medium", tags, easyProblems.length + index, admin._id)
  );
  const hardProblems = hardTitles.map(([title, tags], index) =>
    buildProblem(
      title,
      "Hard",
      tags,
      easyProblems.length + mediumProblems.length + index,
      admin._id
    )
  );

  await Problem.insertMany([...easyProblems, ...mediumProblems, ...hardProblems]);

  console.log("Seed data created with 90 problems: 30 Easy, 30 Medium, 30 Hard.");
  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
