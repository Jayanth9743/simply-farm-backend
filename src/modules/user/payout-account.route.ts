import { Router } from "express";

import { authenticate } from "@/middlewares/auth/authenticate.middleware";
import { validateRequest } from "@/middlewares/request/validate-request.middleware";

import { payoutAccountController } from "./payout-account.controller";
import {
  createPayoutAccountSchema,
  payoutAccountIdParamSchema,
  updatePayoutAccountSchema,
} from "./payout-account.schema";

// Side-effect import: registers this module's paths on the OpenAPI registry.
import "./payout-account.openapi";

export const payoutAccountRouter = Router();

payoutAccountRouter.get("/", authenticate, payoutAccountController.listPayoutAccounts);

payoutAccountRouter.post(
  "/",
  authenticate,
  validateRequest({ body: createPayoutAccountSchema }),
  payoutAccountController.createPayoutAccount,
);

payoutAccountRouter.get(
  "/:id",
  authenticate,
  validateRequest({ params: payoutAccountIdParamSchema }),
  payoutAccountController.getPayoutAccountById,
);

payoutAccountRouter.put(
  "/:id",
  authenticate,
  validateRequest({ params: payoutAccountIdParamSchema, body: updatePayoutAccountSchema }),
  payoutAccountController.updatePayoutAccount,
);

payoutAccountRouter.patch(
  "/:id/default",
  authenticate,
  validateRequest({ params: payoutAccountIdParamSchema }),
  payoutAccountController.setDefaultPayoutAccount,
);

payoutAccountRouter.delete(
  "/:id",
  authenticate,
  validateRequest({ params: payoutAccountIdParamSchema }),
  payoutAccountController.deactivatePayoutAccount,
);
