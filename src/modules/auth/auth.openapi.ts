import { z } from "zod";
import { registry } from "@/shared/openapi/registry";
import { loginSchema, registerSchema } from "./auth.schema";

const userPublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email().nullable().optional(),
  role: z.string(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

const authErrorItemSchema = z.object({
  field: z.string(),
  message: z.string(),
});

const authErrorSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(authErrorItemSchema).optional(),
});

const authRegisterSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    user: userPublicSchema,
    accessToken: z.string(),
  }),
});

const authLoginSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    user: userPublicSchema,
    accessToken: z.string(),
  }),
});

const authRefreshSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    accessToken: z.string(),
  }),
});

const authLogoutSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: {
        "application/json": {
          schema: authRegisterSuccessSchema,
        },
      },
    },
    409: {
      description: "User already exists",
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Log in a user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: authLoginSuccessSchema,
        },
      },
    },
    401: {
      description: "Invalid credentials",
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
    },
    403: {
      description: "Account suspended",
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh access token using a refresh token cookie",
  responses: {
    200: {
      description: "Tokens refreshed successfully",
      content: {
        "application/json": {
          schema: authRefreshSuccessSchema,
        },
      },
    },
    401: {
      description:
        "Refresh token missing, invalid, expired, or replayed after rotation",
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
    },
    403: {
      description: "Account suspended",
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Log out the current user and revoke the refresh token",
  description:
    "Idempotent. Always clears the refresh token cookie and returns 200, " +
    "including when no valid refresh token was presented.",
  responses: {
    200: {
      description: "User logged out successfully",
      content: {
        "application/json": {
          schema: authLogoutSuccessSchema,
        },
      },
    },
  },
});
