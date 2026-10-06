import { z } from "zod";

import { bearerAuth, registry } from "@/shared/openapi/registry";

import {
  addressBaseSchema,
  addressIdParamSchema,
  createAddressSchema,
  updateAddressSchema,
} from "./address.schema";

const TAGS = ["User Addresses"];
const secured = [{ [bearerAuth.name]: [] }];

/**
 * Note this still describes `latitude`/`longitude` as numbers, while Prisma
 * serialises `Decimal` columns to JSON strings, and describes the nullable text
 * columns as optional rather than nullable. Both are open items.
 */
const addressSchema = addressBaseSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const errorSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});

const json = <T extends z.ZodTypeAny>(schema: T) => ({
  "application/json": { schema },
});

const UNAUTHORIZED = {
  description: "Missing or invalid access token",
  content: json(errorSchema),
};

const VALIDATION_ERROR = {
  description: "Validation error",
  content: json(errorSchema),
};

const NOT_FOUND = {
  description: "Address not found",
  content: json(errorSchema),
};

registry.registerPath({
  method: "get",
  path: "/user/addresses",
  tags: TAGS,
  summary: "List saved addresses for the authenticated user",
  security: secured,
  responses: {
    200: {
      description: "Addresses retrieved successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            addresses: z.array(addressSchema),
          }),
        }),
      ),
    },
    401: UNAUTHORIZED,
  },
});

registry.registerPath({
  method: "post",
  path: "/user/addresses",
  tags: TAGS,
  summary: "Create a saved address for the authenticated user",
  security: secured,
  request: {
    body: { content: json(createAddressSchema) },
  },
  responses: {
    201: {
      description: "Address created successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            address: addressSchema,
          }),
        }),
      ),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
  },
});

registry.registerPath({
  method: "get",
  path: "/user/addresses/{id}",
  tags: TAGS,
  summary: "Get a saved address by id",
  security: secured,
  request: {
    params: addressIdParamSchema,
  },
  responses: {
    200: {
      description: "Address retrieved successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            address: addressSchema,
          }),
        }),
      ),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    404: NOT_FOUND,
  },
});

registry.registerPath({
  method: "put",
  path: "/user/addresses/{id}",
  tags: TAGS,
  summary: "Update a saved address",
  security: secured,
  request: {
    params: addressIdParamSchema,
    body: { content: json(updateAddressSchema) },
  },
  responses: {
    200: {
      description: "Address updated successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            address: addressSchema,
          }),
        }),
      ),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    404: NOT_FOUND,
  },
});

registry.registerPath({
  method: "delete",
  path: "/user/addresses/{id}",
  tags: TAGS,
  summary: "Delete a saved address",
  description:
    "Fails with 409 while the address is still referenced by a produce or " +
    "equipment listing.",
  security: secured,
  request: {
    params: addressIdParamSchema,
  },
  responses: {
    200: {
      description: "Address deleted successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
        }),
      ),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    404: NOT_FOUND,
    409: {
      description: "Address is in use by a listing",
      content: json(errorSchema),
    },
  },
});
