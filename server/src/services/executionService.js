import fs from "fs/promises";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env.js";
import { LANGUAGE_CONFIG } from "../constants/languages.js";
import { ApiError } from "../utils/ApiError.js";

const execFileAsync = promisify(execFile);

const buildDockerArgs = (workspacePath, command, memoryLimitMb) => [
  "run",
  "--rm",
  "--network",
  "none",
  "--cpus",
  env.executionCpus,
  "--memory",
  `${memoryLimitMb}m`,
  "--pids-limit",
  "64",
  "--read-only",
  "--tmpfs",
  "/tmp:rw,noexec,nosuid,size=64m",
  "-v",
  `${workspacePath}:/workspace`,
  "-w",
  "/workspace",
  env.executionImage,
  "sh",
  "-lc",
  command,
];

export const executeCode = async ({ code, language, stdin = "", timeLimitMs = env.executionTimeoutMs, memoryLimitMb = 256 }) => {
  const languageConfig = LANGUAGE_CONFIG[language];
  if (!languageConfig) {
    throw new ApiError(400, "Unsupported language.");
  }

  const workspacePath = path.join(os.tmpdir(), `campusarena-${uuidv4()}`);
  await fs.mkdir(workspacePath, { recursive: true });

  try {
    await fs.writeFile(path.join(workspacePath, languageConfig.fileName), code, "utf-8");
    await fs.writeFile(path.join(workspacePath, "stdin.txt"), stdin, "utf-8");

    const command = `${languageConfig.executeCommand} < stdin.txt`;
    const startedAt = Date.now();
    const { stdout, stderr } = await execFileAsync("docker", buildDockerArgs(workspacePath, command, memoryLimitMb), {
      timeout: timeLimitMs + env.executionCompileOverheadMs,
      windowsHide: true,
    });

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      timedOut: false,
      executionTimeMs: Date.now() - startedAt,
    };
  } catch (error) {
    if (error.killed || error.signal === "SIGTERM") {
      return { stdout: "", stderr: "Time limit exceeded.", timedOut: true, executionTimeMs: timeLimitMs };
    }

    return {
      stdout: error.stdout?.toString().trim() || "",
      stderr: error.stderr?.toString().trim() || error.message,
      timedOut: false,
      executionTimeMs: 0,
    };
  } finally {
    await fs.rm(workspacePath, { recursive: true, force: true });
  }
};
