import mongoose from "mongoose";
import { Company } from "../models/Company.js";
import { Problem } from "../models/Problem.js";
import { Question } from "../models/Question.js";
import { User } from "../models/User.js";
import { env } from "../config/env.js";

const companies = [
  {
    name: "JP Morgan",
    logo: "https://logo.clearbit.com/jpmorganchase.com",
    type: "Product Based",
    focusAreas: ["DSA", "Java", "SQL", "System Design", "Finance Tech"],
    description:
      "JPMorgan Chase technology hiring track focused on coding, data structures, databases, object-oriented design, and engineering judgment.",
    website: "https://www.jpmorganchase.com",
    interviewProcess: [
      {
        stage: "Online Coding Assessment",
        description: "Timed coding round with data structures, strings, arrays, and implementation-heavy problems.",
        duration: "60-90 minutes",
        selectionRate: "25-35%",
        tags: ["Coding", "DSA", "Problem Solving"],
      },
      {
        stage: "HireVue / Behavioral Screen",
        description: "Recorded or live behavioral discussion covering communication, teamwork, ownership, and motivation.",
        duration: "20-30 minutes",
        selectionRate: "50-60%",
        tags: ["Behavioral", "Communication"],
      },
      {
        stage: "Technical Interview",
        description: "Deep dive into coding approach, OOP, SQL, projects, APIs, and debugging scenarios.",
        duration: "45-60 minutes",
        selectionRate: "35-45%",
        tags: ["Java", "SQL", "Projects", "OOP"],
      },
      {
        stage: "Bar Raiser / Manager Round",
        description: "Culture fit, engineering ownership, financial-domain interest, and scenario-based decision making.",
        duration: "45 minutes",
        selectionRate: "60-70%",
        tags: ["Leadership", "Ownership", "Domain Fit"],
      },
    ],
  },
  {
    name: "Capgemini",
    logo: "https://logo.clearbit.com/capgemini.com",
    type: "Consulting",
    focusAreas: ["Aptitude", "Pseudo Code", "DSA", "SQL", "Communication"],
    description:
      "Capgemini placement track covering aptitude, pseudo-code, coding fundamentals, communication, and service-consulting readiness.",
    website: "https://www.capgemini.com",
    interviewProcess: [
      {
        stage: "Online Aptitude Assessment",
        description: "Quantitative aptitude, logical reasoning, verbal ability, and game-based reasoning sections.",
        duration: "90 minutes",
        selectionRate: "35-45%",
        tags: ["Aptitude", "Reasoning", "Verbal"],
      },
      {
        stage: "Pseudo Code and Coding Round",
        description: "Programming logic, loops, arrays, strings, flow tracing, and basic implementation problems.",
        duration: "45-60 minutes",
        selectionRate: "45-55%",
        tags: ["Pseudo Code", "Coding", "DSA Basics"],
      },
      {
        stage: "Technical Interview",
        description: "Core CS fundamentals, DBMS, OOP, projects, internships, and technology stack discussion.",
        duration: "30-45 minutes",
        selectionRate: "50-60%",
        tags: ["OOP", "DBMS", "Projects"],
      },
      {
        stage: "HR and Communication Round",
        description: "Communication, flexibility, relocation, role expectations, teamwork, and long-term goals.",
        duration: "20-30 minutes",
        selectionRate: "70-80%",
        tags: ["HR", "Communication", "Consulting Fit"],
      },
    ],
  },
];

const codingTemplates = {
  Easy: [
    ["Array Sum", "Compute the sum of all integers in an array.", ["array", "iteration"]],
    ["Maximum Element", "Find the largest element in an unsorted array.", ["array", "linear scan"]],
    ["Count Even Numbers", "Count how many values in an array are even.", ["array", "math"]],
    ["Reverse String", "Reverse a string without using a library reverse helper.", ["string", "two pointers"]],
    ["Palindrome Check", "Check whether a string reads the same forward and backward.", ["string", "two pointers"]],
    ["Vowel Counter", "Count vowels in a lowercase English string.", ["string", "frequency"]],
    ["Missing Number", "Find the missing value from 1 to n in an array of n-1 values.", ["array", "math"]],
    ["First Non-Repeating Character", "Return the first character that occurs only once.", ["string", "hash map"]],
    ["Merge Two Sorted Lists", "Merge two sorted arrays into one sorted array.", ["array", "two pointers"]],
    ["Binary Search", "Find the index of a target value in a sorted array.", ["binary search", "array"]],
    ["Factorial", "Compute n factorial using iteration.", ["math", "implementation"]],
    ["Prime Number Check", "Determine whether a number is prime.", ["math", "number theory"]],
    ["Fibonacci Number", "Return the nth Fibonacci number.", ["dynamic programming", "math"]],
    ["Remove Duplicates", "Remove duplicates from a sorted array in place.", ["array", "two pointers"]],
    ["Valid Parentheses Basic", "Validate a string containing only round brackets.", ["stack", "string"]],
  ],
  Medium: [
    ["Two Sum Indices", "Return indices of two numbers that add to the target.", ["hash map", "array"]],
    ["Longest Substring Without Repeat", "Find the length of the longest substring without repeated characters.", ["sliding window", "string"]],
    ["Rotate Array", "Rotate an array to the right by k steps.", ["array", "in-place"]],
    ["Group Anagrams", "Group strings that are anagrams of each other.", ["hash map", "string"]],
    ["Product Except Self", "Build an array where each value is product of all other values.", ["prefix", "array"]],
    ["Subarray Sum Equals K", "Count subarrays whose sum equals k.", ["prefix sum", "hash map"]],
    ["Merge Intervals", "Merge all overlapping intervals.", ["sorting", "intervals"]],
    ["Kth Largest Element", "Find the kth largest value in an unsorted array.", ["heap", "selection"]],
    ["Linked List Cycle", "Detect whether a linked list contains a cycle.", ["linked list", "two pointers"]],
    ["Reverse Linked List", "Reverse a singly linked list.", ["linked list", "pointers"]],
    ["Level Order Traversal", "Return level order traversal of a binary tree.", ["tree", "bfs"]],
    ["Coin Change Minimum", "Find the minimum number of coins needed for an amount.", ["dynamic programming", "array"]],
    ["Course Schedule", "Determine if all courses can be completed.", ["graph", "topological sort"]],
    ["Search Rotated Array", "Search target in a rotated sorted array.", ["binary search", "array"]],
    ["LRU Cache Operations", "Design get and put operations for an LRU cache.", ["design", "hash map"]],
  ],
  Hard: [
    ["Median of Two Sorted Arrays", "Find the median of two sorted arrays in logarithmic time.", ["binary search", "array"]],
    ["Trapping Rain Water", "Calculate how much rain water can be trapped.", ["two pointers", "array"]],
    ["Minimum Window Substring", "Find the smallest substring containing all target characters.", ["sliding window", "string"]],
    ["Largest Rectangle in Histogram", "Find the largest rectangle area in a histogram.", ["stack", "array"]],
    ["Merge K Sorted Lists", "Merge k sorted linked lists.", ["heap", "linked list"]],
    ["Word Ladder", "Find the shortest transformation sequence between words.", ["bfs", "graph"]],
    ["Serialize Binary Tree", "Serialize and deserialize a binary tree.", ["tree", "design"]],
    ["Edit Distance", "Find the minimum edit operations between two strings.", ["dynamic programming", "string"]],
    ["Regular Expression Matching", "Implement simplified regex matching with dot and star.", ["dynamic programming", "string"]],
    ["Max Profit With Cooldown", "Find max stock profit with cooldown after selling.", ["dynamic programming", "state machine"]],
    ["Alien Dictionary", "Infer character order from a sorted alien dictionary.", ["graph", "topological sort"]],
    ["Sliding Window Maximum", "Return maximum value in every window of size k.", ["deque", "sliding window"]],
    ["N Queens Count", "Count all valid placements of n queens.", ["backtracking", "recursion"]],
    ["Critical Connections", "Find all bridges in an undirected graph.", ["graph", "tarjan"]],
    ["Distributed Rate Limiter", "Design the core logic for a distributed API rate limiter.", ["system design", "hashing"]],
  ],
};

const aptitudeBank = [
  ["Percentage Change", "A value increases from 240 to 300. What is the percentage increase?", ["20%", "25%", "30%", "35%"], 1, "Quantitative"],
  ["Profit and Loss", "A product bought for 800 is sold for 920. Find profit percentage.", ["10%", "12%", "15%", "20%"], 2, "Quantitative"],
  ["Simple Interest", "Find SI on 5000 at 8% for 2 years.", ["600", "700", "800", "900"], 2, "Quantitative"],
  ["Compound Interest", "Find CI on 10000 at 10% for 2 years.", ["2000", "2100", "2200", "2300"], 1, "Quantitative"],
  ["Time and Work", "A can finish work in 12 days, B in 18 days. Together they finish in?", ["6.2 days", "7.2 days", "8.2 days", "9.2 days"], 1, "Quantitative"],
  ["Pipes and Cisterns", "One pipe fills in 6 hours and another empties in 12 hours. Net fill time?", ["8 hours", "10 hours", "12 hours", "14 hours"], 2, "Quantitative"],
  ["Speed Distance", "A train covers 180 km in 3 hours. Speed?", ["50 km/h", "55 km/h", "60 km/h", "65 km/h"], 2, "Quantitative"],
  ["Average Speed", "Travel 60 km at 30 km/h and 60 km at 60 km/h. Average speed?", ["36", "40", "45", "48"], 1, "Quantitative"],
  ["Ratio", "If A:B = 3:5 and total is 64, find A.", ["20", "22", "24", "26"], 2, "Quantitative"],
  ["Mixture", "How much water in 40L of 25% milk solution?", ["10L", "20L", "30L", "35L"], 2, "Quantitative"],
  ["Permutation", "How many ways to arrange ABCD?", ["12", "16", "20", "24"], 3, "Quantitative"],
  ["Combination", "Choose 2 from 8 people.", ["24", "28", "32", "36"], 1, "Quantitative"],
  ["Probability", "Probability of head in one fair coin toss?", ["1/4", "1/3", "1/2", "1"], 2, "Quantitative"],
  ["Number Series", "2, 6, 12, 20, 30, ?", ["36", "40", "42", "44"], 2, "Logical Reasoning"],
  ["Odd One Out", "Apple, Mango, Carrot, Banana", ["Apple", "Mango", "Carrot", "Banana"], 2, "Logical Reasoning"],
  ["Coding Pattern", "If CAT is DBU, then DOG is?", ["EPH", "EPI", "FQH", "CPG"], 0, "Logical Reasoning"],
  ["Direction", "Walk north 5 km, east 3 km. Direction from start?", ["North", "North-East", "East", "South-East"], 1, "Logical Reasoning"],
  ["Blood Relation", "A is B's father and C is A's mother. C is B's?", ["Mother", "Grandmother", "Aunt", "Sister"], 1, "Logical Reasoning"],
  ["Syllogism", "All banks are firms. Some firms are tech companies. Which is definite?", ["All banks are tech", "Some firms are banks", "No bank is firm", "All tech are banks"], 1, "Logical Reasoning"],
  ["Clock Angle", "Angle between hands at 3:00?", ["60", "75", "90", "120"], 2, "Logical Reasoning"],
  ["Calendar", "If today is Monday, what day after 45 days?", ["Tuesday", "Wednesday", "Thursday", "Friday"], 1, "Logical Reasoning"],
  ["Data Interpretation", "Sales rose from 50 to 75 units. Increase?", ["20", "25", "30", "35"], 1, "Quantitative"],
  ["Verbal Analogy", "Bank is to Money as Library is to?", ["Books", "Cards", "People", "Roads"], 0, "Verbal Ability"],
  ["Synonym", "Choose synonym of rapid.", ["Slow", "Fast", "Late", "Weak"], 1, "Verbal Ability"],
  ["Antonym", "Choose antonym of scarce.", ["Rare", "Limited", "Plenty", "Empty"], 2, "Verbal Ability"],
];

const interviewPrompts = [
  ["Tell me about yourself.", "HR", "Structure your answer around education, projects, strengths, and role fit."],
  ["Why do you want to join this company?", "HR", "Connect company domain, learning goals, and role expectations."],
  ["Describe a difficult project you completed.", "Behavioral", "Use situation, task, action, result, and learning."],
  ["Explain OOP pillars with examples.", "Technical", "Cover encapsulation, inheritance, polymorphism, and abstraction."],
  ["What happens when you type a URL in the browser?", "Technical", "Discuss DNS, TCP/TLS, HTTP, server, and rendering."],
  ["Explain normalization in DBMS.", "Technical", "Cover redundancy, anomalies, and normal forms."],
  ["Difference between process and thread.", "Technical", "Compare memory isolation, scheduling, and communication."],
  ["How do you debug a production issue?", "Technical", "Mention logs, metrics, reproduction, rollback, and root cause."],
  ["Describe a time you worked in a team conflict.", "Behavioral", "Show listening, tradeoffs, and resolution."],
  ["Where do you see yourself in three years?", "HR", "Keep it growth-oriented and realistic."],
  ["Explain REST API principles.", "Technical", "Cover resources, methods, status codes, statelessness."],
  ["What is indexing in SQL?", "Technical", "Explain read performance and write/storage tradeoffs."],
  ["How would you improve a slow application?", "Technical", "Discuss profiling, database queries, caching, and code paths."],
  ["What are your strengths and weaknesses?", "HR", "Use evidence and improvement plan."],
  ["Explain your best project architecture.", "Technical", "Cover modules, data flow, database, APIs, and challenges."],
  ["How do you learn a new technology?", "Behavioral", "Mention documentation, prototypes, practice, and feedback."],
  ["Why should we hire you?", "HR", "Map skills, attitude, and evidence to role requirements."],
  ["Explain exception handling.", "Technical", "Cover try/catch/finally, error boundaries, and logging."],
  ["Describe a leadership moment.", "Behavioral", "Show initiative, coordination, and measurable result."],
  ["Do you have questions for us?", "HR", "Ask about role expectations, team practices, and learning path."],
];

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const starterCode = {
  python: "def solve():\n    # Write your logic here\n    pass\n\nsolve()\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  // Write your logic here\n  return 0;\n}\n",
  java: "class Main {\n  public static void main(String[] args) {\n    // Write your logic here\n  }\n}\n",
  javascript: "function solve(input) {\n  // Write your logic here\n}\n",
  c: "#include <stdio.h>\n\nint main() {\n  // Write your logic here\n  return 0;\n}\n",
};

const getCode = async () => {
  let code;
  do {
    code = `CC${Math.floor(100000 + Math.random() * 900000)}`;
  } while (await Problem.exists({ problemCode: code }));
  return code;
};

const getAuthor = async () => {
  const existing = await User.findOne({ role: "ADMIN" }).select("_id");
  if (existing) return existing._id;

  const anyUser = await User.findOne().select("_id");
  if (anyUser) return anyUser._id;

  const admin = await User.create({
    name: "Seed Admin",
    email: "seed-admin@campusarena.edu",
    phone: "9999999999",
    registrationNumber: "SEEDADMIN",
    password: "SeedAdmin123",
    role: "ADMIN",
    department: "CSE",
    year: 4,
  });
  return admin._id;
};

const makeProblem = async ({ company, companyKey, difficulty, index, template, createdBy }) => {
  const [title, description, tags] = template;
  const brandedTitle = `${company.name} ${title}`;
  const code = await getCode();

  return {
    problemCode: code,
    title: brandedTitle,
    slug: `${companyKey}-${slugify(title)}-${difficulty.toLowerCase()}-${index + 1}`,
    description: `${description}\n\nThis is a ${company.name} placement-style ${difficulty.toLowerCase()} problem. Focus on clean input handling, edge cases, and explaining complexity.`,
    difficulty,
    tags: [company.name, ...tags],
    constraints: ["1 <= n <= 100000", "Use efficient time complexity for larger inputs.", "Return or print the required result exactly."],
    inputFormat: "Input follows the format described in the problem statement.",
    outputFormat: "Output the computed answer.",
    examples: [
      { input: "5\n1 2 3 4 5", output: "15", explanation: "Sample output for the expected operation." },
      { input: "3\n2 2 2", output: "6", explanation: "Handles repeated values." },
    ],
    visibleTestCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "15", explanation: "Basic case", isHidden: false },
      { input: "3\n2 2 2", expectedOutput: "6", explanation: "Repeated values", isHidden: false },
    ],
    hiddenTestCases: [
      { input: "1\n10", expectedOutput: "10", explanation: "Single value", isHidden: true },
    ],
    starterCode,
    hint: `Start with the core ${tags[0]} pattern and verify edge cases before optimizing.`,
    createdBy,
    category: "Placement",
    companyId: String(company._id),
    isDailyEligible: false,
    editorial: `Use the standard ${tags.join(", ")} approach. Explain the invariant and complexity in the interview.`,
  };
};

const makeAptitudeQuestions = (companyName) =>
  Array.from({ length: 50 }, (_, index) => {
    const [title, description, options, correctOptionIndex, topic] = aptitudeBank[index % aptitudeBank.length];
    const round = Math.floor(index / aptitudeBank.length) + 1;
    return {
      companyName,
      type: "aptitude",
      category: topic,
      topic,
      difficulty: index % 5 === 0 ? "hard" : index % 2 === 0 ? "medium" : "easy",
      title: `${companyName} Aptitude ${index + 1}: ${title}`,
      description,
      options,
      correctOptionIndex,
      constraints: ["Choose the best option.", "Solve without a calculator unless specified."],
      examples: [{ input: description, output: options[correctOptionIndex], explanation: "Selected option follows the standard formula or reasoning pattern." }],
      solution: {
        approach: `Apply ${topic.toLowerCase()} fundamentals and eliminate impossible options.`,
        code: options[correctOptionIndex],
        language: "reasoning",
        complexity: { time: "O(1)", space: "O(1)" },
      },
      tags: [companyName, topic, `Set ${round}`],
      hints: ["Write the given values clearly.", "Eliminate options that violate the pattern."],
    };
  });

const makeInterviewQuestions = (companyName) =>
  interviewPrompts.map(([title, topic, description], index) => ({
    companyName,
    type: "interview",
    category: topic,
    topic,
    difficulty: index % 4 === 0 ? "hard" : index % 2 === 0 ? "medium" : "easy",
    title: `${companyName}: ${title}`,
    description,
    constraints: ["Keep your answer structured.", "Use examples from projects, internships, coursework, or teamwork."],
    examples: [{ input: title, output: "Structured answer with context, action, and outcome.", explanation: "Interviewers look for clarity and evidence." }],
    solution: {
      approach: topic === "Technical" ? "Define the concept, give an example, then discuss tradeoffs." : "Use a concise STAR-style answer with measurable impact.",
      code: "Prepare bullet points, not a memorized script.",
      language: "communication",
      complexity: { time: "2-5 minutes", space: "N/A" },
    },
    tags: [companyName, topic],
    hints: ["Be specific.", "Tie the answer back to the role."],
  }));

const run = async () => {
  await mongoose.connect(env.mongoUri);
  const createdBy = await getAuthor();
  const summary = [];

  for (const companyData of companies) {
    const company = await Company.findOneAndUpdate(
      { name: companyData.name },
      companyData,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const companyKey = slugify(company.name);
    await Question.deleteMany({ companyName: company.name });
    await Problem.deleteMany({
      $or: [
        { companyId: { $in: [String(company._id), company.name] } },
        { slug: { $regex: `^${companyKey}-` } },
      ],
    });

    const problemDocs = [];
    for (const difficulty of ["Easy", "Medium", "Hard"]) {
      for (let index = 0; index < codingTemplates[difficulty].length; index += 1) {
        problemDocs.push(await makeProblem({
          company,
          companyKey,
          difficulty,
          index,
          template: codingTemplates[difficulty][index],
          createdBy,
        }));
      }
    }

    const questionDocs = [
      ...makeAptitudeQuestions(company.name),
      ...makeInterviewQuestions(company.name),
    ];

    await Problem.insertMany(problemDocs);
    await Question.insertMany(questionDocs);
    summary.push({
      company: company.name,
      codingProblems: problemDocs.length,
      aptitudeQuestions: questionDocs.filter((item) => item.type === "aptitude").length,
      interviewQuestions: questionDocs.filter((item) => item.type === "interview").length,
    });
  }

  console.table(summary);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
