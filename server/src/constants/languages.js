export const LANGUAGE_CONFIG = {
  python: {
    extension: "py",
    fileName: "main.py",
    executeCommand: "python3 main.py",
  },
  c: {
    extension: "c",
    fileName: "main.c",
    executeCommand: "gcc main.c -o main && ./main",
  },
  cpp: {
    extension: "cpp",
    fileName: "main.cpp",
    executeCommand: "g++ -std=c++17 main.cpp -o main && ./main",
  },
  java: {
    extension: "java",
    fileName: "Main.java",
    executeCommand: "javac Main.java && java Main",
  },
  javascript: {
    extension: "js",
    fileName: "main.js",
    executeCommand: "node main.js",
  },
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_CONFIG);
