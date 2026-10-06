import { z } from "zod";

import { bearerAuth, registry } from "@/shared/openapi/registry";

import {
  createPayoutAccountSchema,
  payoutAccountIdParamSchema,
  payoutAccountResponseSchema,
  updatePayoutAccountSchema,
} from "./payout-account.schema";

const TAGS = ["Payout Accounts"];
const secured = [{ [bearerAuth.name]: [] }];

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
  description: "Payout account not found",
  content: json(errorSchema),
};

registry.registerPath({
  method: "get",
  path: "/user/payout-accounts",
  tags: TAGS,
  summary: "List payout accounts for the authenticated user",
  security: secured,
  responses: {
    200: {
      description: "Payout accounts retrieved successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            payoutAccounts: z.array(payoutAccountResponseSchema),
          }),
        }),
      ),
    },
    401: UNAUTHORIZED,
  },
});

registry.registerPath({
  method: "post",
  path: "/user/payout-accounts",
  tags: TAGS,
  summary: "Create a payout account",
  security: secured,
  request: {
    body: { content: json(createPayoutAccountSchema) },
  },
  responses: {
    201: {
      description: "Payout account created successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            payoutAccount: payoutAccountResponseSchema,
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
  path: "/user/payout-accounts/{id}",
  tags: TAGS,
  summary: "Get a payout account by id",
  security: secured,
  request: {
    params: payoutAccountIdParamSchema,
  },
  responses: {
    200: {
      description: "Payout account retrieved successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            payoutAccount: payoutAccountResponseSchema,
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
  path: "/user/payout-accounts/{id}",
  tags: TAGS,
  summary: "Update a payout account",
  security: secured,
  request: {
    params: payoutAccountIdParamSchema,
    body: { content: json(updatePayoutAccountSchema) },
  },
  responses: {
    200: {
      description: "Payout account updated successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            payoutAccount: payoutAccountResponseSchema,
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
  method: "patch",
  path: "/user/payout-accounts/{id}/default",
  tags: TAGS,
  summary: "Set a payout account as the default account",
  security: secured,
  request: {
    params: payoutAccountIdParamSchema,
  },
  responses: {
    200: {
      description: "Default payout account updated successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            payoutAccount: payoutAccountResponseSchema,
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
  path: "/user/payout-accounts/{id}",
  tags: TAGS,
  summary: "Deactivate a payout account",
  security: secured,
  request: {
    params: payoutAccountIdParamSchema,
  },
  responses: {
    200: {
      description: "Payout account deactivated successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            payoutAccount: payoutAccountResponseSchema,
          }),
        }),
      ),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    404: NOT_FOUND,
  },
});