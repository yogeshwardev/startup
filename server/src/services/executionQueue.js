import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const executionQueue = new Queue("code-execution", {
  connection: redisConnection,
});
