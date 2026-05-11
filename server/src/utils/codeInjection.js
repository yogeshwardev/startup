const MARKERS = {
  python: "# __USER_CODE_HERE__",
  default: "// __USER_CODE_HERE__",
};

const PYTHON_COMMON_IMPORTS = [
  "import sys",
  "import json",
  "import math",
  "import heapq",
  "import bisect",
  "import itertools",
  "import functools",
  "import re",
  "from typing import *",
  "from collections import defaultdict, Counter, deque",
].join("\n");

const getMarker = (language) => (language === "python" ? MARKERS.python : MARKERS.default);

const getLineIndent = (line = "") => line.match(/^\s*/)?.[0] || "";

const countIndent = (line = "") => getLineIndent(line).replace(/\t/g, "    ").length;

const hasExecutablePythonLine = (lines) =>
  lines.some((line) => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith("#");
  });

const extractPythonFunctionBody = (code) => {
  const lines = String(code || "").replace(/\r\n/g, "\n").split("\n");
  const defIndex = lines.findIndex((line) => /^\s*def\s+\w+\s*\(/.test(line));

  if (defIndex === -1) {
    return String(code || "");
  }

  const defIndent = countIndent(lines[defIndex]);
  const bodyLines = [];

  for (let index = defIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() && countIndent(line) <= defIndent) {
      break;
    }
    bodyLines.push(line);
  }

  const nonBlankIndents = bodyLines
    .filter((line) => line.trim())
    .map(countIndent)
    .filter((indent) => indent > defIndent);
  const bodyIndent = nonBlankIndents.length ? Math.min(...nonBlankIndents) : defIndent + 4;

  return bodyLines
    .map((line) => (line.trim() ? line.slice(Math.min(line.length, bodyIndent)) : ""))
    .join("\n")
    .trimEnd();
};

const indentPythonBody = (body, indent) => {
  const lines = String(body || "").replace(/\r\n/g, "\n").split("\n");
  const usefulLines = hasExecutablePythonLine(lines) ? lines : ["pass"];
  return usefulLines.map((line) => (line.trim() ? `${indent}${line}` : "")).join("\n");
};

const injectPythonCode = (driver, userCode, marker) => {
  const markerLine = String(driver).split("\n").find((line) => line.includes(marker)) || "";
  const markerIndent = getLineIndent(markerLine);

  if (!markerIndent) {
    return ensurePythonCommonImports(driver.replace(marker, userCode));
  }

  const body = extractPythonFunctionBody(userCode);
  return ensurePythonCommonImports(driver.replace(marker, indentPythonBody(body, markerIndent).trimStart()));
};

const ensurePythonCommonImports = (code) => {
  const normalized = String(code || "").replace(/\r\n/g, "\n");
  const importsToAdd = PYTHON_COMMON_IMPORTS.split("\n").filter((line) => !normalized.includes(line));

  if (!importsToAdd.length) {
    return normalized;
  }

  return `${importsToAdd.join("\n")}\n${normalized}`;
};

const prefixMissingLines = (code, requiredLines) => {
  const normalized = String(code || "").replace(/\r\n/g, "\n");
  const missing = requiredLines.filter((line) => !normalized.includes(line));
  return missing.length ? `${missing.join("\n")}\n${normalized}` : normalized;
};

export const normalizeStarterCode = (starterCode = {}) => ({
  ...starterCode,
  python: starterCode.python ? ensurePythonCommonImports(starterCode.python) : starterCode.python,
  cpp: starterCode.cpp
    ? prefixMissingLines(starterCode.cpp, ["#include <bits/stdc++.h>", "using namespace std;"])
    : starterCode.cpp,
  java: starterCode.java
    ? prefixMissingLines(starterCode.java, ["import java.io.*;", "import java.util.*;"])
    : starterCode.java,
  c: starterCode.c
    ? prefixMissingLines(starterCode.c, ["#include <stdio.h>", "#include <stdlib.h>", "#include <string.h>", "#include <stdbool.h>"])
    : starterCode.c,
});

export const buildExecutableCode = ({ driverCode, userCode, language }) => {
  if (!driverCode) {
    return userCode;
  }

  const marker = getMarker(language);
  if (!driverCode.includes(marker)) {
    return userCode;
  }

  if (language === "python") {
    return injectPythonCode(driverCode, userCode, marker);
  }

  return driverCode.replace(marker, userCode);
};
