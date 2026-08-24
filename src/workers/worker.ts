import { Worker } from "bullmq";

import { bullmqConnection } from "@/config/bullmq";

const worker = new Worker(
  "email",
  async (job) => {
    console.log("Processing job:", job.name);
    console.log("Job data:", job.data);

    if (job.name === "welcome-email") {
    //   console.log(
    //     `Sending welcome email to ${job.data.email}`,
    //   );
    throw new Error("Simulated email sending failure");
    }
  },
  {
    connection: bullmqConnection,
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(
    `Job ${job?.id} failed:`,
    error,
  );
});