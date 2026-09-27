import { Router } from "express";
import { sendResponse } from "../shared/responses";
import { emailQueue } from "@/queues/email.queue";

const healthRouter = Router();

healthRouter.get("/", async (req, res) => {
  await emailQueue.add("welcome-email", {
    userId: "user-123",
    email: "test@example.com",
  },{
    attempts: 3, // Number of retry attempts
    backoff: {
      type: "exponential", // Exponential backoff strategy
      delay: 1000, // Initial delay in milliseconds (1 seconds)
    },
  });
  
  return sendResponse(res, {
    statusCode: 200,
    message: "Server is running",
    data:{
        timestamp: new Date().toISOString()
    }
  })
});


export default healthRouter;