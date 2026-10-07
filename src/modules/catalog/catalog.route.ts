import { Router } from "express";

import { authenticate } from "@/middlewares/auth/authenticate.middleware";
import { authorize } from "@/middlewares/auth/authorize.middleware";
import { optionalAuthenticate } from "@/middlewares/auth/optional-authenticate.middleware";
import { validateRequest } from "@/middlewares/request/validate-request.middleware";

import { catalogController } from "./catalog.controller";
import {
  catalogIdParamSchema,
  catalogListQuerySchema,
  createProduceCategorySchema,
  createUnitSchema,
  updateProduceCategorySchema,
  updateUnitSchema,
} from "./catalog.schema";

// Side-effect import: registers this module's paths on the OpenAPI registry.
import "./catalog.openapi";

export const catalogRouter = Router();

/**
 * Reference data, deliberately left off the rate limiter. These reads are
 * cacheable and the writes are admin-only, so there is nothing here worth the
 * cost of a limiter — unlike the auth endpoints, where an unthrottled request
 * is a free credential guess.
 *
 * Neither list route is paginated: both tables are expected to stay in the
 * tens of rows, and a client populating a dropdown wants all of them.
 */
catalogRouter.get(
  "/produce-categories",
  optionalAuthenticate,
  validateRequest({ query: catalogListQuerySchema }),
  catalogController.listProduceCategories,
);

catalogRouter.post(
  "/produce-categories",
  authenticate,
  authorize("ADMIN"),
  validateRequest({ body: createProduceCategorySchema }),
  catalogController.createProduceCategory,
);

/**
 * PATCH is also the deactivation route — `{ "status": "INACTIVE" }` retires a
 * category. There is deliberately no DELETE: produce listings carry a foreign
 * key to `produce_categories`, so a removed row would orphan live data.
 */
catalogRouter.patch(
  "/produce-categories/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest({
    params: catalogIdParamSchema,
    body: updateProduceCategorySchema,
  }),
  catalogController.updateProduceCategory,
);

catalogRouter.get(
  "/units",
  optionalAuthenticate,
  validateRequest({ query: catalogListQuerySchema }),
  catalogController.listUnits,
);

catalogRouter.post(
  "/units",
  authenticate,
  authorize("ADMIN"),
  validateRequest({ body: createUnitSchema }),
  catalogController.createUnit,
);

catalogRouter.patch(
  "/units/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest({ params: catalogIdParamSchema, body: updateUnitSchema }),
  catalogController.updateUnit,
);
