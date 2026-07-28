import { registry } from "@/shared/openapi/registry";
import { registerSchema } from "./auth.schema";
import { z } from "zod";

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": { schema: registerSchema },
      },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              user: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                role: z.string(),
              }),
              accessToken: z.string(),
            }),
          }),
        },
      },
    },
    409: { description: "Email already registered" },
  },
});