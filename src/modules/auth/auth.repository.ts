import { prisma } from "@/lib/prisma";
import { Prisma, RefreshTokenStatus } from "../../../generated/prisma";

/**
 * Lets every refresh-token helper run either standalone or inside an
 * interactive transaction. `PrismaClient` is assignable to `TransactionClient`,
 * so the default keeps non-transactional callers unchanged.
 */
type Db = Prisma.TransactionClient;

/** The two terminal states a token can be moved to from ACTIVE. */
type ClosedTokenStatus = Extract<RefreshTokenStatus, "ROTATED" | "REVOKED">;

export const authRepository = {
  findByPhoneOrEmail(phone: string, email?: string) {
    const conditions: Prisma.UserWhereInput[] = [{ phone }];
    if (email) conditions.push({ email });

    return prisma.user.findFirst({
      where: { OR: conditions },
    });
  },

  create(userData: Prisma.UserCreateInput) {
    return prisma.user.create({
      data: userData,
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  saveRefreshToken(data: Prisma.RefreshTokenCreateInput, db: Db = prisma) {
    return db.refreshToken.create({
      data,
    });
  },

  /**
   * `tokenHash` is unique, so `findUnique` is the correct accessor. The owning
   * user is included to avoid a second round trip during refresh.
   */
  findRefreshTokenByHash(tokenHash: string, db: Db = prisma) {
    return db.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  },

  /**
   * Moves an ACTIVE token to a terminal state and returns how many rows
   * changed. Callers treat a count of 0 as a compare-and-swap failure: someone
   * else already rotated or revoked this token.
   *
   * Writes both `status` and `revokedAt` so the two representations stay in
   * agreement — `status` was previously left at ACTIVE forever, which made the
   * `[userId, status]` index useless and would have silently returned revoked
   * rows to any query filtering on it.
   */
  closeActiveRefreshToken(
    tokenHash: string,
    status: ClosedTokenStatus,
    db: Db = prisma,
  ) {
    return db.refreshToken.updateMany({
      where: { tokenHash, status: RefreshTokenStatus.ACTIVE },
      data: { status, revokedAt: new Date() },
    });
  },

  /** Used for refresh-token reuse detection and for "log out everywhere". */
  revokeAllActiveRefreshTokensForUser(userId: string, db: Db = prisma) {
    return db.refreshToken.updateMany({
      where: { userId, status: RefreshTokenStatus.ACTIVE },
      data: { status: RefreshTokenStatus.REVOKED, revokedAt: new Date() },
    });
  },
};
