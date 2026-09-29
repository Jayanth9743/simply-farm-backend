import { Router } from "express";
import { sendResponse } from "../shared/responses";

const healthRouter = Router();

healthRouter.get("/", async (req, res) => {
  
  return sendResponse(res, {
    statusCode: 200,
    message: "Server is running",
    data:{
        timestamp: new Date().toISOString()
    }
  })
});


export default healthRouter;