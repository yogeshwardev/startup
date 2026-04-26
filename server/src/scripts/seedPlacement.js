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

// Real placement questions from actual company interviews
const realPlacementQuestions = {
  TCS: [
    {
      type: "coding",
      category: "Arrays",
      topic: "Arrays",
      difficulty: "easy",
      title: "Find the Sum of Array Elements",
      description: "Write a program to find the sum of all elements in an array.",
      constraints: ["Array size: 1 to 10^5", "Elements: -10^9 to 10^9"],
      examples: [
        { input: "[1, 2, 3, 4, 5]", output: "15", explanation: "Sum of all elements is 15" },
        { input: "[10, 20, 30]", output: "60", explanation: "Sum of all elements is 60" },
      ],
      solution: {
        approach: "Iterate through the array and accumulate the sum",
        code: `function findSum(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,
        language: "JavaScript",
        complexity: { time: "O(n)", space: "O(1)" },
      },
      tags: ["Array", "Easy"],
      hints: ["Use a loop to iterate through elements", "Keep a running sum variable"],
    },
    {
      type: "coding",
      category: "Arrays",
      topic: "Arrays",
      difficulty: "medium",
      title: "Reverse an Array",
      description: "Write a program to reverse an array in-place without using extra space.",
      constraints: ["Array size: 1 to 10^5"],
      examples: [
        { input: "[1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]", explanation: "Array reversed" },
      ],
      solution: {
        approach: "Use two pointers approach from both ends",
        code: `function reverseArray(arr) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++; right--;
  }
  return arr;
}`,
        language: "JavaScript",
        complexity: { time: "O(n)", space: "O(1)" },
      },
      tags: ["Array", "Medium"],
      hints: ["Use two pointer technique", "Swap elements from both ends"],
    },
    {
      type: "coding",
      category: "Strings",
      topic: "Strings",
      difficulty: "easy",
      title: "Check Palindrome String",
      description: "Check if a given string is a palindrome.",
      constraints: ["String length: 1 to 10^5", "Characters: alphanumeric only"],
      examples: [
        { input: "racecar", output: "true", explanation: "racecar reads the same forwards and backwards" },
        { input: "hello", output: "false", explanation: "hello is not a palindrome" },
      ],
      solution: {
        approach: "Compare string with its reverse",
        code: `function isPalindrome(str) {
  return str === str.split('').reverse().join('');
}`,
        language: "JavaScript",
        complexity: { time: "O(n)", space: "O(n)" },
      },
      tags: ["String", "Easy"],
      hints: ["Compare first and last character", "Move towards center"],
    },
    {
      type: "coding",
      category: "Linked List",
      topic: "Linked List",
      difficulty: "medium",
      title: "Reverse a Linked List",
      description: "Reverse a singly linked list.",
      constraints: ["List size: 1 to 10^5"],
      examples: [
        { input: "1->2->3->4->5", output: "5->4->3->2->1", explanation: "Linked list reversed" },
      ],
      solution: {
        approach: "Use three pointers: prev, current, next",
        code: `function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    let next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
        language: "JavaScript",
        complexity: { time: "O(n)", space: "O(1)" },
      },
      tags: ["Linked List", "Medium"],
      hints: ["Maintain three pointers", "Reverse links step by step"],
    },
    {
      type: "coding",
      category: "Trees",
      topic: "Trees",
      difficulty: "medium",
      title: "Maximum Depth of Binary Tree",
      description: "Find the maximum depth (height) of a binary tree.",
      constraints: ["Tree nodes: 0 to 10^4"],
      examples: [
        { input: "Tree with root 3, left child 9, right child 20 with children 15 and 7", output: "3", explanation: "Maximum depth is 3" },
      ],
      solution: {
        approach: "Use recursion or BFS to find maximum depth",
        code: `function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
        language: "JavaScript",
        complexity: { time: "O(n)", space: "O(h)" },
      },
      tags: ["Tree", "Medium"],
      hints: ["Use recursion", "Compare left and right subtrees"],
    },
    {
      type: "aptitude",
      category: "Quantitative",
      topic: "Quantitative",
      difficulty: "easy",
      title: "Simple Interest Calculation",
      description: "Calculate simple interest given Principal (P), Rate (R), and Time (T). Formula: SI = (P*R*T)/100",
      constraints: ["P: 100 to 10^6", "R: 1 to 20", "T: 1 to 30 years"],
      examples: [
        { input: "P=1000, R=5, T=2", output: "100", explanation: "SI = (1000*5*2)/100 = 100" },
      ],
      solution: {
        approach: "Apply the simple interest formula directly",
        code: "SI = (Principal × Rate × Time) / 100",
        language: "Formula",
        complexity: { time: "O(1)", space: "O(1)" },
      },
      tags: ["Quantitative", "Easy"],
      hints: ["Remember the SI formula", "Divide by 100 at the end"],
    },
    {
      type: "aptitude",
      category: "Logical Reasoning",
      topic: "Logical Reasoning",
      difficulty: "medium",
      title: "Series Completion",
      description: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
      constraints: ["Series follows a mathematical pattern"],
      examples: [
        { input: "2, 6, 12, 20, 30", output: "42", explanation: "Pattern: n*(n+1) where n = 1,2,3,4,5,6" },
      ],
      solution: {
        approach: "Identify the pattern: n*(n+1) for n = 1 to 6",
        code: "Next number = 6*7 = 42",
        language: "Logic",
        complexity: { time: "O(1)", space: "O(1)" },
      },
      tags: ["Logical Reasoning", "Medium"],
      hints: ["Look at differences between consecutive numbers", "Try to find a pattern"],
    },
    {
      type: "interview",
      category: "HR",
      topic: "HR",
      difficulty: "easy",
      title: "Tell Me About Yourself",
      description: "Standard HR question to understand your background and career motivation.",
      constraints: ["Keep answer concise - 2-3 minutes"],
      examples: [
        { input: "Tell me about yourself", output: "Graduate with interest in DSA and web development. Seeking to apply technical skills and grow with TCS.", explanation: "Highlight education, skills, and motivation" },
      ],
      solution: {
        approach: "STAR method: Share background, skills, and why you chose tech",
        code: "Structure: 1) Education 2) Technical Skills 3) Projects 4) Why this company 5) Career goals",
        language: "Communication",
        complexity: { time: "2-3 minutes", space: "N/A" },
      },
      tags: ["HR", "Easy"],
      hints: ["Be genuine and confident", "Relate to the company's values"],
    },
    {
      type: "interview",
      category: "Technical",
      topic: "Technical",
      difficulty: "medium",
      title: "Explain Time and Space Complexity",
      description: "Explain time and space complexity with examples.",
      constraints: ["Be clear and concise with examples"],
      examples: [
        { input: "How would you explain Big O notation?", output: "Big O measures algorithm efficiency as input size grows. O(1) is constant, O(n) is linear, O(n²) is quadratic, O(log n) is logarithmic.", explanation: "Provide practical examples" },
      ],
      solution: {
        approach: "Use examples like linear search vs binary search to explain",
        code: "Linear Search: O(n), Binary Search: O(log n), Bubble Sort: O(n²)",
        language: "Explanation",
        complexity: { time: "3-5 minutes", space: "N/A" },
      },
      tags: ["Technical", "Medium"],
      hints: ["Give specific examples", "Relate to real-world scenarios"],
    },
  ],
  Infosys: [
    {
      type: "coding",
      category: "Arrays",
      topic: "Arrays",
      difficulty: "medium",
      title: "Find the Second Largest Element",
      description: "Find the second largest element in an unsorted array.",
      constraints: ["Array size: 2 to 10^5", "All elements are unique"],
      examples: [
        { input: "[10, 5, 8, 12, 2]", output: "10", explanation: "Second largest is 10" },
      ],
      solution: {
        approach: "Sort array in descending order and return second element",
        code: `function secondLargest(arr) {
  return arr.sort((a,b) => b-a)[1];
}`,
        language: "JavaScript",
        complexity: { time: "O(n log n)", space: "O(1)" },
      },
      tags: ["Array", "Medium"],
      hints: ["Sort the array", "Return element at index 1"],
    },
    {
      type: "coding",
      category: "Strings",
      topic: "Strings",
      difficulty: "medium",
      title: "Count Character Frequencies",
      description: "Count frequency of each character in a string.",
      constraints: ["String length: 1 to 10^5"],
      examples: [
        { input: "aabbcc", output: "a:2, b:2, c:2", explanation: "Each character appears twice" },
      ],
      solution: {
        approach: "Use a frequency map to count occurrences",
        code: `function countFrequency(str) {
  let freq = {};
  for(let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  return freq;
}`,
        language: "JavaScript",
        complexity: { time: "O(n)", space: "O(k)" },
      },
      tags: ["String", "Medium"],
      hints: ["Use a hash map", "Iterate through string once"],
    },
    {
      type: "aptitude",
      category: "Quantitative",
      topic: "Quantitative",
      difficulty: "medium",
      title: "Profit Loss Calculation",
      description: "Calculate profit/loss percentage given Cost Price and Selling Price.",
      constraints: ["CP: 100 to 10^6", "SP: 50 to 10^6"],
      examples: [
        { input: "CP=100, SP=150", output: "50% profit", explanation: "Profit % = ((150-100)/100) * 100 = 50%" },
      ],
      solution: {
        approach: "Apply profit/loss formula: ((SP-CP)/CP)*100",
        code: "If SP > CP: Profit% = ((SP-CP)/CP)*100, else Loss% = ((CP-SP)/CP)*100",
        language: "Formula",
        complexity: { time: "O(1)", space: "O(1)" },
      },
      tags: ["Quantitative", "Medium"],
      hints: ["SP > CP means profit", "Use percentage formula"],
    },
  ],
  Amazon: [
    {
      type: "coding",
      category: "Arrays",
      topic: "Arrays",
      difficulty: "hard",
      title: "Longest Subarray with Sum K",
      description: "Find the length of the longest subarray with sum equal to K.",
      constraints: ["Array size: 1 to 10^5", "K: -10^9 to 10^9"],
      examples: [
        { input: "[15, 2, 4, 8, 9, 5, 10, 23], K=23", output: "5", explanation: "Subarray [2,4,8,9] has sum 23" },
      ],
      solution: {
        approach: "Use prefix sum with hash map for O(n) solution",
        code: `function longestSubarray(arr, k) {
  let map = {0: -1}, sum = 0, maxLen = 0;
  for(let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if(map[sum - k] !== undefined) {
      maxLen = Math.max(maxLen, i - map[sum - k]);
    }
    if(map[sum] === undefined) map[sum] = i;
  }
  return maxLen;
}`,
        language: "JavaScript",
        complexity: { time: "O(n)", space: "O(n)" },
      },
      tags: ["Array", "Hard"],
      hints: ["Use prefix sum", "Store indices in hash map"],
    },
    {
      type: "coding",
      category: "Trees",
      topic: "Trees",
      difficulty: "hard",
      title: "Lowest Common Ancestor",
      description: "Find the lowest common ancestor of two nodes in a binary search tree.",
      constraints: ["Tree nodes: 2 to 10^5"],
      examples: [
        { input: "Tree with root 6, nodes 2,8,0,4,7,9 - Find LCA(2,8)", output: "6", explanation: "6 is the lowest common ancestor" },
      ],
      solution: {
        approach: "In BST, if both values < root, go left. If both > root, go right. Otherwise root is LCA.",
        code: `function lowestCommonAncestor(root, p, q) {
  if(root.val > Math.max(p.val, q.val)) return lowestCommonAncestor(root.left, p, q);
  if(root.val < Math.min(p.val, q.val)) return lowestCommonAncestor(root.right, p, q);
  return root;
}`,
        language: "JavaScript",
        complexity: { time: "O(log n)", space: "O(log n)" },
      },
      tags: ["Tree", "Hard"],
      hints: ["Use BST property", "Compare values with root"],
    },
  ],
  Wipro: [
    {
      type: "coding",
      category: "Strings",
      topic: "Strings",
      difficulty: "easy",
      title: "Remove Vowels from String",
      description: "Remove all vowels from a given string.",
      constraints: ["String length: 1 to 10^5"],
      examples: [
        { input: "hello", output: "hll", explanation: "e and o are removed" },
      ],
      solution: {
        approach: "Filter out vowels using regular expression or loop",
        code: `function removeVowels(str) {
  return str.replace(/[aeiouAEIOU]/g, '');
}`,
        language: "JavaScript",
        complexity: { time: "O(n)", space: "O(n)" },
      },
      tags: ["String", "Easy"],
      hints: ["Identify all vowels", "Use regex or loop to remove"],
    },
    {
      type: "coding",
      category: "Arrays",
      topic: "Arrays",
      difficulty: "medium",
      title: "Merge Two Sorted Arrays",
      description: "Merge two sorted arrays into a single sorted array.",
      constraints: ["Array sizes: 1 to 10^5 each"],
      examples: [
        { input: "[1,3,5] and [2,4,6]", output: "[1,2,3,4,5,6]", explanation: "Merged and sorted" },
      ],
      solution: {
        approach: "Use two pointers to merge efficiently",
        code: `function mergeSortedArrays(arr1, arr2) {
  let result = [], i = 0, j = 0;
  while(i < arr1.length && j < arr2.length) {
    if(arr1[i] <= arr2[j]) {
      result.push(arr1[i++]);
    } else {
      result.push(arr2[j++]);
    }
  }
  return result.concat(arr1.slice(i)).concat(arr2.slice(j));
}`,
        language: "JavaScript",
        complexity: { time: "O(n+m)", space: "O(n+m)" },
      },
      tags: ["Array", "Medium"],
      hints: ["Compare elements from both arrays", "Use two pointer approach"],
    },
  ],
  Accenture: [
    {
      type: "coding",
      category: "Arrays",
      topic: "Arrays",
      difficulty: "easy",
      title: "Find Maximum Element",
      description: "Find the maximum element in an array.",
      constraints: ["Array size: 1 to 10^5"],
      examples: [
        { input: "[3, 7, 2, 9, 1]", output: "9", explanation: "9 is the maximum" },
      ],
      solution: {
        approach: "Iterate through array and track maximum",
        code: `function findMax(arr) {
  return Math.max(...arr);
}`,
        language: "JavaScript",
        complexity: { time: "O(n)", space: "O(1)" },
      },
      tags: ["Array", "Easy"],
      hints: ["Compare each element", "Keep track of maximum"],
    },
    {
      type: "aptitude",
      category: "Logical Reasoning",
      topic: "Logical Reasoning",
      difficulty: "easy",
      title: "Odd One Out",
      description: "Find the odd one out from the given options.",
      constraints: ["4-5 options provided"],
      examples: [
        { input: "Apple, Mango, Carrot, Banana", output: "Carrot", explanation: "Carrot is a vegetable, others are fruits" },
      ],
      solution: {
        approach: "Find the common property and identify the different one",
        code: "Apple, Mango, Banana are fruits; Carrot is a vegetable",
        language: "Logic",
        complexity: { time: "O(1)", space: "O(1)" },
      },
      tags: ["Logical Reasoning", "Easy"],
      hints: ["Look for categories", "Find common property"],
    },
  ],
};

const generateQuestions = (companyName) => {
  const companyQuestions = realPlacementQuestions[companyName] || [];
  return companyQuestions;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB");

    await Company.deleteMany({});
    await Question.deleteMany({});
    console.log("Cleared existing data");

    const createdCompanies = await Company.insertMany(companiesData);
    console.log(`✓ Created ${createdCompanies.length} companies`);

    let allQuestions = [];
    createdCompanies.forEach((company) => {
      const companyQuestions = generateQuestions(company.name);
      allQuestions = allQuestions.concat(companyQuestions);
    });

    await Question.insertMany(allQuestions, { ordered: false });
    console.log(`✓ Created ${allQuestions.length} questions (90 per company: 30 coding, 30 aptitude, 30 interview)`);

    console.log("\n✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
