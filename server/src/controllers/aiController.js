import { GoogleGenAI } from "@google/genai";
import { Problem } from "../models/Problem.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, "GEMINI_API_KEY is missing. Add a fresh Gemini key to server/.env and restart the backend.");
  }
  return new GoogleGenAI({ apiKey });
};

const getGeminiModel = () => process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getGeminiErrorMessage = (error) => {
  const rawMessage = error?.message || "";
  try {
    const parsed = JSON.parse(rawMessage);
    return parsed.error?.message || rawMessage;
  } catch {
    return rawMessage;
  }
};

const isQuotaError = (error) => {
  const message = getGeminiErrorMessage(error).toLowerCase();
  return error?.status === 429 || error?.code === 429 || message.includes("quota") || message.includes("rate-limit");
};

const isLeakedKeyError = (error) => getGeminiErrorMessage(error).toLowerCase().includes("reported as leaked");

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const generateProblemCode = () =>
  "CC" + String(Math.floor(100000 + Math.random() * 900000));

const normalizeDifficulty = (difficulty = "Easy") => {
  const normalized = String(difficulty || "Easy").trim().toLowerCase();
  if (normalized === "medium") return "Medium";
  if (normalized === "hard") return "Hard";
  return "Easy";
};

const toArray = (value) => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || "")
    .split(/[,|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const safeStringify = (value) => (typeof value === "string" ? value : JSON.stringify(value));

const parseGeneratedJson = (responseText) => {
  const cleaned = String(responseText || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleaned);
};

const validateGeneratedAssets = (assets) => {
  if (!assets.description || !assets.templateCode || !assets.driverCode) {
    throw new ApiError(500, "Gemini returned incomplete problem assets.");
  }

  if (!Array.isArray(assets.hiddenTestCases) || assets.hiddenTestCases.length < 10) {
    throw new ApiError(500, "Gemini must return at least 10 hidden test cases.");
  }

  const templates = Object.values(assets.templateCode);
  const drivers = Object.values(assets.driverCode);

  if (!templates.length || templates.some((template) => !String(template).includes("__INSERT_BODY_HERE__"))) {
    throw new ApiError(500, "Gemini returned skeletons without the required insertion marker.");
  }

  if (!drivers.length || drivers.some((driver) => !String(driver).includes("__USER_CODE_HERE__"))) {
    throw new ApiError(500, "Gemini returned drivers without the required user-code marker.");
  }

  const parameterCount = Array.isArray(assets.parameters) ? assets.parameters.length : null;
  const testCases = [...(assets.examples || []), ...assets.hiddenTestCases];
  for (const testCase of testCases) {
    const parsedInput = JSON.parse(safeStringify(testCase.input));
    if (!Array.isArray(parsedInput)) {
      throw new ApiError(500, "Gemini test input must be a JSON array of function arguments.");
    }
    if (parameterCount !== null && parsedInput.length !== parameterCount) {
      throw new ApiError(500, "Gemini test input argument count does not match the skeleton signature.");
    }
    JSON.parse(safeStringify(testCase.expectedOutput ?? testCase.output));
  }
};

const buildProblemPrompt = ({ title, difficulty, tags, description, constraints }) => `You are a senior competitive-programming problem setter and online judge engineer.
Generate polished coding-problem judge assets as strict JSON only.

Problem:
Title: ${title}
Difficulty: ${difficulty || "easy"}
Tags: ${tags || ""}
Raw admin description:
${description || "Infer a clear, original coding problem from the title."}

Raw admin constraints:
${constraints || "Not provided"}

Return exactly this JSON shape, with no markdown fences:
{
  "description": "professional problem statement written in clear online-judge style",
  "constraints": "clean newline-separated constraints with realistic numeric bounds appropriate for easy-to-medium difficulty",
  "inputFormat": "state that stdin is a JSON array of function arguments",
  "outputFormat": "state that stdout is the JSON-compatible function return value",
  "functionName": "camelCaseName",
  "parameters": ["param1", "param2"],
  "parameterTypes": {
    "param1": {
      "semantic": "integer | string | integer array | string array | matrix | boolean",
      "javascript": "number",
      "python": "int",
      "cpp": "int",
      "java": "int",
      "c": "int"
    }
  },
  "returnType": "integer | long integer | boolean | string | integer array | string array",
  "hint": "a helpful 1-2 sentence algorithmic hint to guide the user towards the solution without giving away the exact code",
  "examples": [
    { "input": "[JSON array of function arguments]", "output": "JSON expected return value", "explanation": "short optional explanation" }
  ],
  "hiddenTestCases": [
    { "input": "[JSON array of function arguments]", "output": "JSON expected return value" }
  ],
  "templateCode": {
    "javascript": "function signature {\\n// __INSERT_BODY_HERE__\\n}",
    "python": "from typing import *\\nfrom collections import defaultdict, Counter, deque\\nimport sys, json, bisect, functools, heapq, itertools, math, re\\n\\nclass Solution:\\n    def method(self, ...) -> int:\\n        # __INSERT_BODY_HERE__",
    "cpp": "#include <bits/stdc++.h>\\nusing namespace std;\\n\\nclass Solution {\\npublic:\\n    int method(...) {\\n        // __INSERT_BODY_HERE__\\n    }\\n};",
    "java": "import java.io.*;\\nimport java.util.*;\\n\\nclass Solution {\\n    public int method(...) {\\n        // __INSERT_BODY_HERE__\\n    }\\n}",
    "c": "#include <stdio.h>\\n#include <stdlib.h>\\n#include <string.h>\\n#include <stdbool.h>\\n#include <math.h>\\n\\nint method(...) {\\n    // __INSERT_BODY_HERE__\\n}"
  },
  "driverCode": {
    "javascript": "complete executable JavaScript driver source containing // __USER_CODE_HERE__",
    "python": "complete executable Python driver source containing # __USER_CODE_HERE__",
    "cpp": "complete executable C++17 driver source containing // __USER_CODE_HERE__",
    "java": "complete executable Java Main driver source containing // __USER_CODE_HERE__",
    "c": "complete executable C driver source containing // __USER_CODE_HERE__"
  }
}

CRITICAL RULES — follow every rule exactly:

TEST CASE DIFFICULTY:
- ALL hidden test cases must be EASY to MODERATE only. Do NOT generate hard, adversarial, extreme-scale, or tricky edge cases.
- Input values must be small and human-readable (arrays ≤ 10 elements, numbers ≤ 1000, strings ≤ 20 characters).
- Test cases should cover: typical inputs, empty/zero inputs, single-element inputs, small varied cases, and basic boundary values only.
- NEVER generate massive inputs, maximum-constraint stress tests, adversarial patterns, or inputs that require advanced algorithms to solve.

LIBRARIES (MANDATORY):
- Include ONLY the imports/headers that this specific problem actually needs — do not dump every possible library.
- Never omit a needed import, and never add a comment like "assume library available". Every import must be a real, explicit statement.
- Python: include only the specific modules this problem uses (e.g. import math only if math is needed, from collections import deque only if a deque is used). Always include import sys and import json in driverCode since they are always needed for I/O. Always include from typing import List, Optional, etc. only if those types are used in the signature.
- JavaScript: use only built-in Node.js modules. Include require() only for modules actually used (e.g. const readline = require('readline') for stdin reading).
- Java templateCode AND driverCode: always include import java.io.*; and import java.util.*; (these are needed for I/O and common data structures). Add extra imports (e.g. import java.util.stream.*) only if actually used.
- C templateCode AND driverCode: always include #include <stdio.h> and #include <stdlib.h>. Add #include <string.h>, #include <math.h>, #include <stdbool.h> only if the problem actually uses string operations, math functions, or booleans respectively.
- C++ templateCode AND driverCode: always include #include <bits/stdc++.h> and using namespace std; (this covers all standard C++ headers efficiently). Do NOT use nlohmann/json.hpp.

GENERAL RULES:
- Rewrite the description professionally. Explain the task, inputs, expected return value, and edge behavior.
- input must always be a JSON array containing function arguments. Example for add(a,b): "[2,3]".
- output must be JSON-compatible text.
- Skeletons must contain the exact function/class signature, required imports, and the exact marker. Do not solve the problem inside templateCode.
- Python templateCode: class methods indented 4 spaces under class, exactly 8 spaces before # __INSERT_BODY_HERE__. Never leave a class/function with only a blank line.
- Python driverCode: if # __USER_CODE_HERE__ is inside a method body, indent it exactly 8 spaces. If top-level, it replaces the entire user class.
- The templateCode signature, driverCode parser, examples, and all hidden tests MUST use the same parameter order and data types.
- Every driverCode value must be complete, compilable/runnable source — no pseudocode, no ellipses, no omitted parsing logic.
- driverCode MUST read from stdin, parse the JSON-array input, call the user's function/method, and print the return value in JSON-compatible format.
- C++ driverCode: parse JSON input using small standard-library helper functions only. Do NOT use nlohmann/json.hpp.
- Java driverCode: use only standard-library parsing. No Gson, no Jackson.
- C driverCode: implement simple parsing using standard C only.
- MANDATORY: Generate exactly 10 hidden test cases — all easy to moderate difficulty.
- MANDATORY: Before returning, internally verify all 10 hidden test cases and all examples are consistent with the signature (same parameter count, correct data types, correct output format).
- MANDATORY: The starter skeleton and driver must be compatible with every generated test case.`;


export const createGeneratedAssets = async (payload) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await getGeminiClient().models.generateContent({
        model: getGeminiModel(),
        contents: buildProblemPrompt(payload),
      });
      const assets = parseGeneratedJson(response.text);
      validateGeneratedAssets(assets);
      return assets;
    } catch (error) {
      if (isLeakedKeyError(error)) {
        throw new ApiError(403, "Gemini rejected the API key because it was reported as leaked. Delete it, create a fresh key, update server/.env, and restart the backend.");
      }

      if (isQuotaError(error) && attempt < 2) {
        await sleep(15_000 * (attempt + 1));
        continue;
      }

      if (attempt < 2) {
        await sleep(2_000);
        continue;
      }

      throw new ApiError(error.statusCode || error.status || 500, getGeminiErrorMessage(error) || "Gemini generation failed.");
    }
  }
};

const buildProblemDocument = (row, assets, userId, slug, problemCode) => {
  const examples = Array.isArray(assets.examples) ? assets.examples : [];
  const hiddenTestCases = Array.isArray(assets.hiddenTestCases) ? assets.hiddenTestCases : [];

  return {
    title: row.title.trim(),
    slug,
    problemCode,
    description: assets.description,
    difficulty: normalizeDifficulty(row.difficulty),
    category: row.category?.trim() || "General",
    companyId: row.companyId?.trim() || "",
    tags: toArray(row.tags),
    constraints: toArray(assets.constraints),
    inputFormat: assets.inputFormat || "Input is provided as a JSON array of function arguments.",
    outputFormat: assets.outputFormat || "Print the JSON-compatible return value.",
    examples: examples.map((example) => ({
      input: safeStringify(example.input),
      output: safeStringify(example.output),
      explanation: example.explanation || "",
    })),
    visibleTestCases: examples.slice(0, 1).map((example) => ({
      input: safeStringify(example.input),
      expectedOutput: safeStringify(example.output),
      isHidden: false,
    })),
    hiddenTestCases: hiddenTestCases.map((testCase) => ({
      input: safeStringify(testCase.input),
      expectedOutput: safeStringify(testCase.expectedOutput ?? testCase.output),
      explanation: testCase.explanation || "",
      isHidden: true,
    })),
    starterCode: assets.templateCode || {},
    driverCode: assets.driverCode || {},
    hint: assets.hint || "",
    supportedLanguages: ["python", "cpp", "java", "javascript", "c"],
    timeLimitMs: Number(row.timeLimitMs || 2000),
    memoryLimitMb: Number(row.memoryLimitMb || 256),
    createdBy: userId,
    skeletonConfig: {
      functionName: assets.functionName,
      parameters: assets.parameters,
      parameterTypes: assets.parameterTypes,
      returnType: assets.returnType,
    },
  };
};

const createUniqueSlug = async (title, usedSlugs) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(slug) || (await Problem.exists({ slug }))) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return slug;
};

const createUniqueProblemCode = async (usedCodes) => {
  let problemCode = generateProblemCode();

  while (usedCodes.has(problemCode) || (await Problem.exists({ problemCode }))) {
    problemCode = generateProblemCode();
  }

  usedCodes.add(problemCode);
  return problemCode;
};

export const generateProblemAssets = catchAsync(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required.");
  }

  try {
    const assets = await createGeneratedAssets(req.body);
    res.json(assets);
  } catch (error) {
    throw new ApiError(error.statusCode || 500, "Failed to generate assets: " + error.message);
  }
});

export const bulkGenerateProblems = catchAsync(async (req, res) => {
  const rows = Array.isArray(req.body.rows) ? req.body.rows : [];

  if (!rows.length) {
    throw new ApiError(400, "At least one CSV row is required.");
  }

  if (rows.length > 25) {
    throw new ApiError(400, "Bulk upload is limited to 25 rows at a time.");
  }

  const usedSlugs = new Set();
  const usedCodes = new Set();
  const results = [];

  for (const [index, row] of rows.entries()) {
    try {
      if (index > 0) {
        await sleep(13_000);
      }

      if (!row.title?.trim()) {
        throw new ApiError(400, "Problem title is required.");
      }

      const assets = await createGeneratedAssets({
        title: row.title,
        difficulty: row.difficulty || "Easy",
        tags: row.tags || "",
        description: row.description || row.title,
        constraints: row.constraints || "",
      });
      const slug = await createUniqueSlug(row.slug || row.title, usedSlugs);
      const problemCode = await createUniqueProblemCode(usedCodes);
      const problem = await Problem.create(buildProblemDocument(row, assets, req.user._id, slug, problemCode));

      results.push({
        row: index + 1,
        status: "created",
        title: problem.title,
        problemCode: problem.problemCode,
        hiddenTestCount: problem.hiddenTestCases.length,
      });
    } catch (error) {
      results.push({
        row: index + 1,
        status: "failed",
        title: row.title || "",
        message: error.message || "Unable to create problem.",
      });
    }
  }

  const createdCount = results.filter((result) => result.status === "created").length;
  res.status(createdCount ? 201 : 200).json({
    createdCount,
    failedCount: results.length - createdCount,
    results,
  });
});
