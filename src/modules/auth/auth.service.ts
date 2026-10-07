import { StatusCodes } from "http-status-codes";

import { ApiError } from "@/shared/errors";
import { logger } from "@/config/logger";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/shared/utils/hash.util";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/shared/utils/jwt.util";
import { hashRefreshToken } from "@/shared/utils/refresh-token.util";

import {
  RefreshTokenStatus,
  UserStatus,
  type Prisma,
  type User,
} from "../../../generated/prisma";
import { AUTH_MESSAGES } from "./auth.constants";
import { authRepository } from "./auth.repository";
import type { LoginInput, RegisterInput } from "./auth.schema";

/**
 * Explicit allowlist rather than omitting `passwordHash`, so a future sensitive
 * column added to `User` is not exposed by default.
 */
export const toPublicUser = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function assertUserActive(user: Pick<User, "status">) {
  if (user.status !== UserStatus.ACTIVE) {
    throw new ApiError(StatusCodes.FORBIDDEN, AUTH_MESSAGES.ACCOUNT_SUSPENDED);
  }
}

/** Mints an access token and persists a matching refresh token row. */
export const issueSession = async (
  user: Pick<User, "id" | "role">,
  db: Prisma.TransactionClient = prisma,
) => {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id });

  await authRepository.saveRefreshToken(
    {
      tokenHash: hashRefreshToken(refreshToken.token),
      expiresAt: refreshToken.expiresAt,
      user: { connect: { id: user.id } },
    },
    db,
  );

  return { accessToken, refreshToken: refreshToken.token };
}

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

    const { accessToken, refreshToken } = await issueSession(user);

    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  login: async (credentials: LoginInput) => {
    const { phone, password } = credentials;

    const user = await authRepository.findByPhoneOrEmail(phone);
    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        AUTH_MESSAGES.INVALID_CREDENTIALS,
      );
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        AUTH_MESSAGES.INVALID_CREDENTIALS,
      );
    }

    // Checked only after the password verifies, so the suspended state is not
    // disclosed to someone who does not already hold the credentials.
    assertUserActive(user);

    const { accessToken, refreshToken } = await issueSession(user);

    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  refresh: async (presentedToken: string) => {
    // Cheap signature and expiry check before touching the database.
    try {
      verifyRefreshToken(presentedToken);
    } catch {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
      );
    }

    const tokenHash = hashRefreshToken(presentedToken);
    const storedToken = await authRepository.findRefreshTokenByHash(tokenHash);

    // Signed but unknown to us: already pruned, or minted against a secret we
    // no longer honour. Nothing to attribute it to, so just reject.
    if (!storedToken) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
      );
    }

    // Reuse detection. A token that was already rotated or revoked is being
    // replayed. That is either a client racing itself or a leaked token being
    // used by an attacker, and we cannot tell the two apart — so we close every
    // active session for this user and force a fresh login.
    if (storedToken.status !== RefreshTokenStatus.ACTIVE) {
      await authRepository.revokeAllActiveRefreshTokensForUser(
        storedToken.userId,
      );

      logger.warn(
        {
          userId: storedToken.userId,
          refreshTokenId: storedToken.id,
          status: storedToken.status,
        },
        "Refresh token reuse detected, revoked all active sessions for user",
      );

      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
      );
    }

    if (storedToken.expiresAt < new Date()) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
      );
    }

    const user = storedToken.user;
    assertUserActive(user);

    // Rotate atomically. Closing the old token first acts as a compare-and-swap:
    // two concurrent refreshes presenting the same token cannot both mint a new
    // session, and if the insert fails the rollback leaves the old token usable
    // rather than stranding the client with no valid token at all.
    const rotated = await prisma.$transaction(async (tx) => {
      const closed = await authRepository.closeActiveRefreshToken(
        tokenHash,
        RefreshTokenStatus.ROTATED,
        tx,
      );

      if (closed.count === 0) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
        );
      }

      return issueSession(user, tx);
    });

    return rotated;
  },

  /**
   * Idempotent by design. Logout is a request to end up logged out, so an
   * unknown, expired or already-revoked token is not an error — the caller
   * clears the cookie either way. Previously this threw a 401 before the cookie
   * was cleared, which made logout impossible once the token had expired.
   */
  logout: async (presentedToken?: string) => {
    if (!presentedToken) return;

    const tokenHash = hashRefreshToken(presentedToken);

    await authRepository.closeActiveRefreshToken(
      tokenHash,
      RefreshTokenStatus.REVOKED,
    );
  },
};
