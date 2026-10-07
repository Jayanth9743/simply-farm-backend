import { StatusCodes } from "http-status-codes";

import { ApiError } from "@/shared/errors";

import { CatalogStatus, Prisma } from "../../../generated/prisma";
import { PRODUCE_CATEGORY_LABEL, UNIT_LABEL } from "./catalog.constant";
import {
  produceCategoryRepository,
  unitRepository,
  type CatalogRepository,
} from "./catalog.repository";

type CatalogServiceOptions = {
  /** Used in the 404 message and as the fallback 409 subject. */
  entityLabel: string;
  /**
   * The table's unique columns, matched against a P2002's payload to work out
   * which one the caller collided with. Order is the tie-break when a payload
   * mentions more than one.
   */
  uniqueFields: readonly string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Gathers every string in a P2002 payload that could name the column the
 * caller collided with.
 *
 * Where that information lives depends on how the client talks to Postgres,
 * and this project uses a driver adapter (`@prisma/adapter-pg`), which is the
 * awkward case: `meta.target` — the field the documentation points at, and the
 * one `errorMiddleware` reads — is not populated at all. The column list
 * arrives instead under `meta.driverAdapterError.cause.constraint.fields`.
 * Both shapes are collected so this keeps working if the adapter is dropped,
 * with the raw constraint name and driver message as last resorts.
 */
function collectUniqueTargetHints(
  error: Prisma.PrismaClientKnownRequestError,
): string[] {
  const hints: string[] = [];

  const push = (value: unknown) => {
    if (typeof value === "string") {
      hints.push(value);
      return;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === "string") {
          hints.push(entry);
        }
      }
    }
  };

  const meta = error.meta;

  if (!isRecord(meta)) {
    return hints;
  }

  // Shape A: query-engine client.
  push(meta.target);

  // Shape B: driver adapter.
  const adapterError = meta.driverAdapterError;

  if (isRecord(adapterError) && isRecord(adapterError.cause)) {
    const cause = adapterError.cause;

    if (isRecord(cause.constraint)) {
      push(cause.constraint.fields);
      push(cause.constraint.index);
    }

    push(cause.originalMessage);
  }

  return hints;
}

/**
 * Turns a P2002 into something a client can act on.
 *
 * The hints are matched against the table's own unique columns rather than
 * echoed, so a Postgres identifier like "units_symbol_key" never reaches the
 * response body. An exact match is preferred — that is the clean
 * `fields: ["symbol"]` case — with a substring pass behind it to catch the
 * hints that only carry a constraint name.
 */
function toConflictMessage(
  error: Prisma.PrismaClientKnownRequestError,
  options: CatalogServiceOptions,
) {
  const hints = collectUniqueTargetHints(error).map((hint) =>
    hint.toLowerCase(),
  );

  const field =
    options.uniqueFields.find((candidate) =>
      hints.includes(candidate.toLowerCase()),
    ) ??
    options.uniqueFields.find((candidate) =>
      hints.some((hint) => hint.includes(candidate.toLowerCase())),
    );

  if (!field) {
    return `${options.entityLabel} already exists`;
  }

  return `${field.charAt(0).toUpperCase()}${field.slice(1)} already exists`;
}

/**
 * Lets the database settle uniqueness instead of pre-checking with a SELECT.
 *
 * `auth.service.ts` and `user.service.ts` take the other route — look the row
 * up first, then throw a 409 — which reads well but is a race: two
 * simultaneous creates can both pass the check and one still hits the unique
 * index. Here the insert is simply attempted and the index's verdict is
 * translated, which is correct under concurrency and also covers an update
 * that renames a row onto an existing name.
 *
 * `errorMiddleware` already has a P2002 fallback, but it reads `meta.target`,
 * which the pg driver adapter leaves unset — so it degrades to the literal
 * "field already exists". Catching it here is what produces "Symbol already
 * exists" instead.
 */
async function withUniqueConstraintGuard<T>(
  operation: () => Promise<T>,
  options: CatalogServiceOptions,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        toConflictMessage(error, options),
      );
    }

    throw error;
  }
}

/**
 * Both catalog tables have identical behaviour and differ only in the labels
 * on their error messages and the set of columns that can collide, so those
 * are passed in as data and the logic is written once.
 */
export function createCatalogService<
  TRecord,
  TCreateInput extends { status?: CatalogStatus },
  TUpdateInput,
>(
  repository: CatalogRepository<TRecord, TCreateInput, TUpdateInput>,
  options: CatalogServiceOptions,
) {
  return {
    list: (includeInactive: boolean) => repository.list(includeInactive),

    /**
     * `status` is pinned here rather than left to the column default, so the
     * guarantee is visible in the code path that makes it and cannot be
     * overridden by anything the caller sends.
     */
    create: (data: TCreateInput) =>
      withUniqueConstraintGuard(
        () => repository.create({ ...data, status: CatalogStatus.ACTIVE }),
        options,
      ),

    /**
     * Also the deactivation path — there is no delete route, because produce
     * listings and orders hold foreign keys into both tables and a removed
     * category would orphan them. `status: "INACTIVE"` retires a row while
     * leaving historical references intact.
     */
    update: async (id: string, data: TUpdateInput) => {
      const record = await withUniqueConstraintGuard(
        () => repository.update(id, data),
        options,
      );

      if (!record) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `${options.entityLabel} not found`,
        );
      }

      return record;
    },
  };
}

export const produceCategoryService = createCatalogService(
  produceCategoryRepository,
  {
    entityLabel: PRODUCE_CATEGORY_LABEL,
    uniqueFields: ["name"],
  },
);

export const unitService = createCatalogService(unitRepository, {
  entityLabel: UNIT_LABEL,
  uniqueFields: ["name", "symbol"],
});
