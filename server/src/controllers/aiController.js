import { GoogleGenAI } from "@google/genai";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

export const generateProblemAssets = catchAsync(async (req, res) => {
  const { title, difficulty, tags, description, constraints } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required.");
  }

  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCgu_-lW6sQF4g2YHMOBT1oYK_eNeZKwyw";
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a senior competitive-programming problem setter and online judge engineer.
Generate polished coding-problem judge assets as strict JSON only.

Problem:
Title: ${title}
Difficulty: ${difficulty || 'easy'}
Tags: ${tags || ''}
Raw admin description:
${description}

Raw admin constraints:
${constraints || 'Not provided'}

Return exactly this JSON shape, with no markdown fences:
{
  "description": "professional problem statement written in clear online-judge style",
  "constraints": "clean newline-separated constraints with realistic numeric bounds",
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
    "python": "class Solution:\\n    def method(self, ...):\\n        # __INSERT_BODY_HERE__",
    "cpp": "class Solution {\\npublic:\\n    int method(...) {\\n        // __INSERT_BODY_HERE__\\n    }\\n};",
    "java": "class Solution {\\n    public int method(...) {\\n        // __INSERT_BODY_HERE__\\n    }\\n}",
    "c": "int method(...) {\\n    // __INSERT_BODY_HERE__\\n}"
  },
  "driverCode": {
    "javascript": "const fs = require('fs');\\n// __USER_CODE_HERE__\\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim(); ... parse and call and print",
    "python": "import sys, json\\n# __USER_CODE_HERE__\\nif __name__ == '__main__':\\n    input_str = sys.stdin.read().strip() ... parse and call and print",
    "cpp": "#include <bits/stdc++.h>\\nusing namespace std;\\n// __USER_CODE_HERE__\\nint main() { ... read stdin, parse JSON array format, call Solution, print result }",
    "java": "import java.util.*;\\n// __USER_CODE_HERE__\\npublic class Main { public static void main(String[] args) { ... read stdin, parse JSON array format, call Solution, print result } }",
    "c": "#include <stdio.h>\\n#include <stdlib.h>\\n// __USER_CODE_HERE__\\nint main() { ... read stdin, parse JSON array format, call, print result }"
  }
}

Rules:
- Rewrite the description professionally. Explain the task, inputs, expected return value, and edge behavior.
- Preferred type mappings:
  - integer: JS number, Python int, C++ int or long long, Java int/long, C int/long long
  - boolean: JS boolean, Python bool, C++ bool, Java boolean, C int
  - string: JS string, Python str, C++ string, Java String, C char*
  - integer array: JS number[], Python List[int], C++ vector<int>, Java int[], C int* (plus size param if needed)
- input must always be a JSON array containing function arguments. Example for add(a,b): "[2,3]".
- output must be JSON-compatible text.
- Skeletons (templateCode) must use the EXACT marker '// __INSERT_BODY_HERE__' (or '# __INSERT_BODY_HERE__' for Python) where the user logic goes. Do not include any logic. Include proper includes/imports in the skeleton ONLY if needed by the signature.
- driverCode must use the EXACT marker '// __USER_CODE_HERE__' (or '# __USER_CODE_HERE__' for Python) where the templateCode + user body will be injected.
- The driverCode MUST read from stdin, parse the input (which is formatted exactly like the examples "input" field, i.e., a JSON array), call the user's function/method, and print the return value to stdout (formatted exactly like the examples "output" field).
- For C and C++, writing a full JSON parser is hard. Keep it simple: use string stream or scanf to parse the brackets and commas of the JSON array. Assume inputs are well-formed.
- MANDATORY: Generate AT LEAST 10 robust and edge-case testing items in the "hiddenTestCases" array.
- MANDATORY: All test cases (examples and hiddenTestCases) must STRICTLY conform to the data types defined in the function signature. Do not change data types between test cases!`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  let responseText = response.text || "";
  responseText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    const assets = JSON.parse(responseText);
    res.json(assets);
  } catch (error) {
    throw new ApiError(500, "Failed to parse generated assets: " + error.message);
  }
});
