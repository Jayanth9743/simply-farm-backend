import { Router } from "express";

import { authenticate } from "@/middlewares/auth/authenticate.middleware";
import { validateRequest } from "@/middlewares/request/validate-request.middleware";

import { addressController } from "./address.controller";
import {
  addressIdParamSchema,
  createAddressSchema,
  updateAddressSchema,
} from "./address.schema";

// Side-effect import: registers this module's paths on the OpenAPI registry.
import "./address.openapi";

export const addressRouter = Router();

addressRouter.get("/", authenticate, addressController.listAddresses);

addressRouter.post(
  "/",
  authenticate,
  validateRequest({ body: createAddressSchema }),
  addressController.createAddress,
);

addressRouter.get(
  "/:id",
  authenticate,
  validateRequest({ params: addressIdParamSchema }),
  addressController.getAddressById,
);

addressRouter.put(
  "/:id",
  authenticate,
  validateRequest({ params: addressIdParamSchema, body: updateAddressSchema }),
  addressController.updateAddress,
);

addressRouter.delete(
  "/:id",
  authenticate,
  validateRequest({ params: addressIdParamSchema }),
  addressController.deleteAddress,
);
