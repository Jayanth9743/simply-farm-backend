import { ApiError } from "@/shared/errors";
import { authRepository } from "./auth.repository";
import { StatusCodes } from "http-status-codes";
import {
  comparePassword,
  hashPassword,
  hashToken,
} from "@/shared/utils/hash.util";
import { LoginInput, RegisterInput } from "./auth.schema";
import {
  RefreshTokenPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/shared/utils/jwt.util";
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

  login: async (credentials: LoginInput) => {
    const { phone, password } = credentials;
    const user = await authRepository.findByPhoneOrEmail(phone);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });

    const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresIn * 1000);

    await authRepository.saveRefreshToken({
      tokenHash: hashToken(refreshToken),
      expiresAt,
      user: { connect: { id: user.id } },
    });

    const { passwordHash: _, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken };
  },

  refresh: async (refreshToken: string) => {
    let payload: RefreshTokenPayload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired refresh token");
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await authRepository.findRefreshTokenByHash(tokenHash);

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid or expired refresh token",
      );
    }

    const user = await authRepository.findById(payload.sub);

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
    }

    const newAccessToken = signAccessToken({ sub: user.id, role: user.role });
    const newRefreshToken = signRefreshToken({ sub: user.id });

    const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresIn * 1000);

    await authRepository.saveRefreshToken({
      tokenHash: hashToken(newRefreshToken),
      expiresAt,
      user: { connect: { id: user.id } },
    });

    await authRepository.revokeRefreshToken(tokenHash);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  logout: async (refreshToken: string) => {
    try {
      verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired refresh token");
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired refresh token");
    }

    await authRepository.revokeRefreshToken(tokenHash);
  },
};
