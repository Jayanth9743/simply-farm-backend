import bcrypt from "bcrypt";
import { createHash } from "node:crypto";

const SALT_ROUNDS = 12;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}