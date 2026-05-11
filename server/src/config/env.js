import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campusarena",
  jwtSecret: process.env.JWT_SECRET || "development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  executionImage: process.env.EXECUTION_IMAGE || "campusarena-runner:latest",
  executionTimeoutMs: Number(process.env.EXECUTION_TIMEOUT_MS || 3000),
  executionCompileOverheadMs: Number(process.env.EXECUTION_COMPILE_OVERHEAD_MS || 30000),
  executionMemory: process.env.EXECUTION_MEMORY || "128m",
  executionCpus: process.env.EXECUTION_CPUS || "0.5",
};
