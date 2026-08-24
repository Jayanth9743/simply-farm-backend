import { Queue } from "bullmq";

import { bullmqConnection } from "@/config/bullmq";

export const emailQueue = new Queue("email", {
  connection: bullmqConnection,
});