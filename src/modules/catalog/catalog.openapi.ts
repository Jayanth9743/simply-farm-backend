import { z } from "zod";

import { bearerAuth, registry } from "@/shared/openapi/registry";

import {
  catalogIdParamSchema,
  catalogListQuerySchema,
  createProduceCategorySchema,
  createUnitSchema,
  produceCategoryResponseSchema,
  unitResponseSchema,
  updateProduceCategorySchema,
  updateUnitSchema,
} from "./catalog.schema";

const TAGS = ["Catalog"];
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

const FORBIDDEN = {
  description: "Caller is not an admin",
  content: json(errorSchema),
};

const VALIDATION_ERROR = {
  description: "Validation error",
  content: json(errorSchema),
};

const CONFLICT = {
  description: "A row with this name or symbol already exists",
  content: json(errorSchema),
};

const LIST_DESCRIPTION =
  "Public endpoint. Returns only ACTIVE rows. `includeInactive=true` is " +
  "honoured only for an authenticated admin and is otherwise ignored rather " +
  "than rejected. Unpaginated — the table is expected to stay small.";

const DEACTIVATION_NOTE =
  "Also the deactivation route: send `status: \"INACTIVE\"` to retire a row. " +
  "There is no DELETE endpoint, because listings and orders hold foreign keys " +
  "to this table.";

registry.registerPath({
  method: "get",
  path: "/catalog/produce-categories",
  tags: TAGS,
  summary: "List produce categories",
  description: LIST_DESCRIPTION,
  request: {
    query: catalogListQuerySchema,
  },
  responses: {
    200: {
      description: "Produce categories retrieved successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            produceCategories: z.array(produceCategoryResponseSchema),
          }),
        }),
      ),
    },
    400: VALIDATION_ERROR,
  },
});

registry.registerPath({
  method: "post",
  path: "/catalog/produce-categories",
  tags: TAGS,
  summary: "Create a produce category",
  description: "Admin only. The new row is always created with status ACTIVE.",
  security: secured,
  request: {
    body: { content: json(createProduceCategorySchema) },
  },
  responses: {
    201: {
      description: "Produce category created successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            produceCategory: produceCategoryResponseSchema,
          }),
        }),
      ),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    403: FORBIDDEN,
    409: CONFLICT,
  },
});

registry.registerPath({
  method: "patch",
  path: "/catalog/produce-categories/{id}",
  tags: TAGS,
  summary: "Update a produce category",
  description: `Admin only. ${DEACTIVATION_NOTE}`,
  security: secured,
  request: {
    params: catalogIdParamSchema,
    body: { content: json(updateProduceCategorySchema) },
  },
  responses: {
    200: {
      description: "Produce category updated successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            produceCategory: produceCategoryResponseSchema,
          }),
        }),
      ),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    403: FORBIDDEN,
    404: {
      description: "Produce category not found",
      content: json(errorSchema),
    },
    409: CONFLICT,
  },
});

registry.registerPath({
  method: "get",
  path: "/catalog/units",
  tags: TAGS,
  summary: "List units",
  description: LIST_DESCRIPTION,
  request: {
    query: catalogListQuerySchema,
  },
  responses: {
    200: {
      description: "Units retrieved successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            units: z.array(unitResponseSchema),
          }),
        }),
      ),
    },
    400: VALIDATION_ERROR,
  },
});

registry.registerPath({
  method: "post",
  path: "/catalog/units",
  tags: TAGS,
  summary: "Create a unit",
  description: "Admin only. The new row is always created with status ACTIVE.",
  security: secured,
  request: {
    body: { content: json(createUnitSchema) },
  },
  responses: {
    201: {
      description: "Unit created successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            unit: unitResponseSchema,
          }),
        }),
      ),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    403: FORBIDDEN,
    409: CONFLICT,
  },
});

registry.registerPath({
  method: "patch",
  path: "/catalog/units/{id}",
  tags: TAGS,
  summary: "Update a unit",
  description: `Admin only. ${DEACTIVATION_NOTE}`,
  security: secured,
  request: {
    params: catalogIdParamSchema,
    body: { content: json(updateUnitSchema) },
  },
  responses: {
    200: {
      description: "Unit updated successfully",
      content: json(
        z.object({
          success: z.literal(true),
          message: z.string(),
          data: z.object({
            unit: unitResponseSchema,
          }),
        }),
      ),
    },
    400: VALIDATION_ERROR,
    401: UNAUTHORIZED,
    403: FORBIDDEN,
    404: {
      description: "Unit not found",
      content: json(errorSchema),
    },
    409: CONFLICT,
  },
});
