import { ApiError } from "@/shared/errors";
import { authRepository } from "./auth.repository";
import { StatusCodes } from "http-status-codes";
import { hashPassword, hashToken } from "@/shared/utils/hash.util";
import { RegisterInput } from "./auth.schema";
import { signAccessToken, signRefreshToken } from "@/shared/utils/jwt.util";
import { env } from "@/config/env";

export const authService = {
  register: async (userData: RegisterInput) => {
    const { username, phone, email, password } = userData;

    const existingUser = await authRepository.findByPhoneOrEmail(phone, email);
    if (existingUser) {
      const field = existingUser.phone === phone ? "Phone number" : "Email";
      throw new ApiError(
        StatusCodes.CONFLICT,
        `${field} is already registered`,
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await authRepository.create({
      name: username,
      phone,
      email,
      passwordHash: hashedPassword,
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });

    const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresIn * 1000);

    await authRepository.saveRefreshToken({
      expiresAt,
      tokenHash: hashToken(refreshToken),
      user: { connect: { id: user.id } },
    });

    const { passwordHash: _, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken };
  },
};
