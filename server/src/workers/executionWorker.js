import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { processSubmissionEvaluation } from "../controllers/executionController.js";

export const startExecutionWorker = () =>
  new Worker(
    "code-execution",
    async (job) => {
      await processSubmissionEvaluation(job.data);
    },
    {
      connection: redisConnection,
      concurrency: 2,
    }
  );
