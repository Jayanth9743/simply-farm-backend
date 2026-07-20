import { authRepository } from "./auth.repository";
import { comparePassword, hashPassword } from "@/shared/utils/hash.util";
import { hashToken } from "@/shared/utils/hash.util";
import { signAccessToken, signRefreshToken } from "@/shared/utils/jwt.util";
import { ApiError } from "@/shared/errors/api-error";
import { env } from "@/config/env";
import type { LoginInput, RegisterInput } from "./auth.schema";

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await authRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ApiError(409, "Email is already registered");
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await authRepository.create({
      name: input.name,
      email: input.email,
      hashedPassword,
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });

    const expiresAt = new Date(
      Date.now() + env.jwt.refreshExpiresIn * 1000
    );

    await authRepository.saveRefreshToken({
      tokenHashed: hashToken(refreshToken),
      expiresAt,
      user: { connect: { id: user.id } },
    });

    const { hashedPassword: _, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken };
  },

  async login(input: LoginInput) {
  const user = await authRepository.findByEmail(input.email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    input.password,
    user.hashedPassword
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id });

  const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresIn * 1000);

  await authRepository.saveRefreshToken({
    tokenHashed: hashToken(refreshToken),
    expiresAt,
    user: { connect: { id: user.id } },
  });

  const { hashedPassword: _, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken };
},
};