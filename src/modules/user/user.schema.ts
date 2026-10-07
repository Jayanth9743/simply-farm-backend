//user schema.ts

import z from "zod";
import {
  CREATE_USER_MESSAGES,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PHONE_REGEX,
} from "./user.constants";
import { Role, UserStatus } from "../../../generated/prisma";

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(NAME_MIN_LENGTH, CREATE_USER_MESSAGES.NAME_MIN)
    .max(NAME_MAX_LENGTH, CREATE_USER_MESSAGES.NAME_MAX),
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, CREATE_USER_MESSAGES.INVALID_PHONE),
  email: z
    .string()
    .trim()
    .email(CREATE_USER_MESSAGES.INVALID_EMAIL)
    .transform((val) => val.toLowerCase())
    .optional(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, CREATE_USER_MESSAGES.PASSWORD_MIN)
    .regex(PASSWORD_REGEX.uppercase, CREATE_USER_MESSAGES.PASSWORD_UPPERCASE)
    .regex(PASSWORD_REGEX.number, CREATE_USER_MESSAGES.PASSWORD_NUMBER)
    .regex(PASSWORD_REGEX.symbol, CREATE_USER_MESSAGES.PASSWORD_SYMBOL),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(NAME_MIN_LENGTH, CREATE_USER_MESSAGES.NAME_MIN)
    .max(NAME_MAX_LENGTH, CREATE_USER_MESSAGES.NAME_MAX)
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, CREATE_USER_MESSAGES.INVALID_PHONE)
    .optional(),
  email: z
    .string()
    .trim()
    .email(CREATE_USER_MESSAGES.INVALID_EMAIL)
    .transform((val) => val.toLowerCase())
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * Validating the path parameter keeps a non-UUID `id` from reaching Prisma,
 * where it surfaces as an opaque 500 instead of a 400.
 */
export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid user id"),
});

/**
 * Kept separate from the refined schema below: `.refine()` returns a wrapper
 * that no longer exposes an object shape, and the OpenAPI generator needs that
 * shape to emit individual query parameters.
 */
export const listUsersQueryBaseSchema = z.object({
  // pagination (offset style)
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // filters
  search: z.string().trim().min(1).max(100).optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),

  // sorting
  sortBy: z.enum(["createdAt", "updatedAt", "email"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export const listUsersQuerySchema = listUsersQueryBaseSchema.refine(
  (q) => !q.createdFrom || !q.createdTo || q.createdFrom <= q.createdTo,
  { message: "createdFrom must be before createdTo", path: ["createdFrom"] },
);

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
