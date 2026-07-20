import { z } from "zod";
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  AUTH_MESSAGES,
} from "./auth.constants";

export const registerSchema = z.object({
  name: z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, AUTH_MESSAGES.PASSWORD_MIN)
    .regex(PASSWORD_REGEX.uppercase, AUTH_MESSAGES.PASSWORD_UPPERCASE)
    .regex(PASSWORD_REGEX.number, AUTH_MESSAGES.PASSWORD_NUMBER)
    .regex(PASSWORD_REGEX.symbol, AUTH_MESSAGES.PASSWORD_SYMBOL),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;