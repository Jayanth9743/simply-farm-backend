import z from "zod";
import {
  AUTH_MESSAGES,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
} from "./auth.constants";

export const registerSchema = z.object({
  username: z
    .string()
    .min(NAME_MIN_LENGTH, AUTH_MESSAGES.NAME_MIN)
    .max(NAME_MAX_LENGTH, AUTH_MESSAGES.NAME_MAX),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  email: z
    .email(AUTH_MESSAGES.INVALID_EMAIL)
    .transform((val) => val.toLowerCase())
    .optional(),
  password: z
  .string()
  .min(PASSWORD_MIN_LENGTH, AUTH_MESSAGES.PASSWORD_MIN)
  .regex(PASSWORD_REGEX.uppercase, AUTH_MESSAGES.PASSWORD_UPPERCASE)
  .regex(PASSWORD_REGEX.number, AUTH_MESSAGES.PASSWORD_NUMBER)
  .regex(PASSWORD_REGEX.symbol, AUTH_MESSAGES.PASSWORD_SYMBOL),
});

export type RegisterInput = z.infer<typeof registerSchema>;
