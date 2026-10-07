import { z } from "zod";

import { bearerAuth, registry } from "@/shared/openapi/registry";

import {
  createUserSchema,
  listUsersQueryBaseSchema,
  updateUserSchema,
  userIdParamSchema,
} from "./user.schema";

const TAGS = ["Users"];
const secured = [{ [bearerAuth.name]: [] }];

/** Mirrors `toPublicUser` in auth.service.ts. */
const userPublicSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * The list endpoint uses its own `select` in user.repository.ts, which omits
 * `name`. Documented as-is rather than papering over the difference.
 */
const userListItemSchema = userPublicSchema.omit({ name: true });

const errorItemSchema = z.object({
  field: z.string(),
  message: z.string(),
});

const errorSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(errorItemSchema).optional(),
});

const singleUserSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({ user: userPublicSchema }),
});

const json = <T extends z.ZodTypeAny>(schema: T) => ({
  "application/json": { schema },
});

const UNAUTHORIZED = {
  description: "Missing or invalid access token",
  content: json(errorSchema),
};

const FORBIDDEN = {
  description: "Caller lacks the required role",
  content: json(errorSchema),
};

const NOT_FOUND = {
  description: "User not found",
  content: json(errorSchema),
};

const VALIDATION_ERROR = {
  description: "Validation error",
  content: json(errorSchema),
};

// ---------------------------------------------------------------- self-service

registry.registerPath({
  method: "get",
  path: "/user/me",
  tags: TAGS,
  summary: "Get the authenticated user's own profile",
  security: secured,
  responses: {
    200: {
      description: "Profile retrieved successfully",
      content: json(singleUserSchema),
    },
    401: UNAUTHORIZED,
    404: NOT_FOUND,
  },
});

registry.registerPath({
  method: "put",
  path: "/user/me",
  tags: TAGS,
  summary: "Update the authenticated user's own profile",
  description:
    "The target user is taken from the access token, so this endpoint can " +
    "only ever modify the caller's own record. Only name, phone and email are " +
    "writable; role, status and credentials are not.",
  security: secured,
  request: {
    body: { content: json(updateUserSchema) },
  },
  responses: {
    200: {
      description: "Profile updated successfully",
      content: json(singleUserSchema),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    409: {
      description: "Phone or email already belongs to another account",
      content: json(errorSchema),
    },
  },
});

// --------------------------------------------------------------- admin / other

registry.registerPath({
  method: "get",
  path: "/user",
  tags: TAGS,
  summary: "List users",
  description: "Admin only. Offset paginated, newest-last by default.",
  security: secured,
  request: {
    query: listUsersQueryBaseSchema,
  },
  responses: {
    200: {
      description: "Users retrieved successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            users: z.array(userListItemSchema),
            meta: z.object({
              total: z.number().int(),
              page: z.number().int(),
              limit: z.number().int(),
              totalPages: z.number().int(),
            }),
          }),
        }),
      ),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    403: FORBIDDEN,
  },
});

registry.registerPath({
  method: "post",
  path: "/user",
  tags: TAGS,
  summary: "Create a user",
  description:
    "Creates a user and returns an access token, setting a refresh token " +
    "cookie. Currently unauthenticated and not rate limited.",
  request: {
    body: { content: json(createUserSchema) },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            user: userPublicSchema,
            accessToken: z.string(),
          }),
        }),
      ),
    },
    400: VALIDATION_ERROR,
    409: {
      description: "Phone or email is already registered",
      content: json(errorSchema),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/user/{id}",
  tags: TAGS,
  summary: "Get a user by id",
  description: "Readable by any authenticated user.",
  security: secured,
  request: {
    params: userIdParamSchema,
  },
  responses: {
    200: {
      description: "User retrieved successfully",
      content: json(singleUserSchema),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    404: NOT_FOUND,
  },
});

registry.registerPath({
  method: "put",
  path: "/user/{id}",
  tags: TAGS,
  summary: "Update another user's record",
  description:
    "Admin only; self-service edits go through PUT /user/me. Writable fields " +
    "are limited to name, phone and email — changing role or status is not " +
    "supported here.",
  security: secured,
  request: {
    params: userIdParamSchema,
    body: { content: json(updateUserSchema) },
  },
  responses: {
    200: {
      description: "User updated successfully",
      content: json(singleUserSchema),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    403: FORBIDDEN,
    404: NOT_FOUND,
    409: {
      description: "Phone or email already belongs to another account",
      content: json(errorSchema),
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/user/{id}",
  tags: TAGS,
  summary: "Delete a user",
  description: "Admin only.",
  security: secured,
  request: {
    params: userIdParamSchema,
  },
  responses: {
    200: {
      description: "User deleted successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
        }),
      ),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    403: FORBIDDEN,
    404: NOT_FOUND,
  },
});
