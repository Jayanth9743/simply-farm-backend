import { Router } from "express";

import { authenticate } from "@/middlewares/auth/authenticate.middleware";
import { authorize } from "@/middlewares/auth/authorize.middleware";
import { validateRequest } from "@/middlewares/request/validate-request.middleware";

import { addressRouter } from "./address.route";
import { payoutAccountRouter } from "./payout-account.route";
import { userController } from "./user.controller";
import {
  listUsersQuerySchema,
  updateUserSchema,
  userIdParamSchema,
} from "./user.schema";

// Side-effect import: registers this module's paths on the OpenAPI registry.
import "./user.openapi";

export const userRouter = Router();

userRouter.use("/addresses", addressRouter);
userRouter.use("/payout-accounts", payoutAccountRouter);

/**
 * Self-service routes take the user id from the verified access token, never
 * from the path, so there is no id for a caller to tamper with. They must stay
 * above the `/:id` routes — Express matches in registration order, and `/:id`
 * would otherwise swallow `/me` and pass "me" to Prisma as a UUID.
 */
userRouter.get("/me", authenticate, userController.me);

userRouter.put(
  "/me",
  authenticate,
  validateRequest({ body: updateUserSchema }),
  userController.updateMe,
);

userRouter.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateRequest({ query: listUsersQuerySchema }),
  userController.listUsers,
);

userRouter.post("/", userController.createUser);

userRouter.get(
  "/:id",
  authenticate,
  validateRequest({ params: userIdParamSchema }),
  userController.getUserById,
);

// Administrative edit of someone else's record. Profile self-edits go through
// PUT /me, so this is deliberately admin-only rather than ownership-checked.
userRouter.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest({ params: userIdParamSchema, body: updateUserSchema }),
  userController.updateUser,
);

userRouter.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest({ params: userIdParamSchema }),
  userController.deleteUser,
);
