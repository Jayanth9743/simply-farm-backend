import z from "zod";

import { CatalogStatus } from "../../../generated/prisma";
import {
  CATALOG_DESCRIPTION_MAX_LENGTH,
  CATALOG_MESSAGES,
  PRODUCE_CATEGORY_NAME_MAX_LENGTH,
  UNIT_NAME_MAX_LENGTH,
  UNIT_SYMBOL_MAX_LENGTH,
} from "./catalog.constant";

/**
 * Trimmed but otherwise stored exactly as entered. Unlike email, a catalog
 * name is a display value an admin chose, so its casing is meaningful and is
 * not normalised. The consequence is that the unique index is case-sensitive:
 * "Tomato" and "tomato" can both exist. That is a deliberate trade, not an
 * oversight — collapsing case would need a citext column or a functional
 * unique index, neither of which the schema has.
 */
const catalogName = (maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, CATALOG_MESSAGES.NAME_REQUIRED)
    .max(maxLength, `Name must be at most ${maxLength} characters`);

const catalogDescription = z
  .string()
  .trim()
  .max(
    CATALOG_DESCRIPTION_MAX_LENGTH,
    `Description must be at most ${CATALOG_DESCRIPTION_MAX_LENGTH} characters`,
  );

/**
 * `status` is absent from both create schemas on purpose. Every catalog row is
 * born ACTIVE; the only way to change that is the PATCH route, which keeps
 * "create" and "retire" as two distinct, separately audited actions.
 */
export const createProduceCategorySchema = z.object({
  name: catalogName(PRODUCE_CATEGORY_NAME_MAX_LENGTH),
  description: catalogDescription.optional(),
});

export type CreateProduceCategoryInput = z.infer<
  typeof createProduceCategorySchema
>;

export const updateProduceCategorySchema = z
  .object({
    name: catalogName(PRODUCE_CATEGORY_NAME_MAX_LENGTH).optional(),
    // Nullable as well as optional: the column is nullable, so an admin needs
    // a way to clear a description rather than only overwrite it.
    description: catalogDescription.nullable().optional(),
    status: z.nativeEnum(CatalogStatus).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: CATALOG_MESSAGES.NO_FIELDS,
  });

export type UpdateProduceCategoryInput = z.infer<
  typeof updateProduceCategorySchema
>;

const unitSymbol = z
  .string()
  .trim()
  .min(1, CATALOG_MESSAGES.SYMBOL_REQUIRED)
  .max(
    UNIT_SYMBOL_MAX_LENGTH,
    `Symbol must be at most ${UNIT_SYMBOL_MAX_LENGTH} characters`,
  );

export const createUnitSchema = z.object({
  name: catalogName(UNIT_NAME_MAX_LENGTH),
  symbol: unitSymbol,
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;

export const updateUnitSchema = z
  .object({
    name: catalogName(UNIT_NAME_MAX_LENGTH).optional(),
    symbol: unitSymbol.optional(),
    status: z.nativeEnum(CatalogStatus).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: CATALOG_MESSAGES.NO_FIELDS,
  });

export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;

export const catalogIdParamSchema = z.object({
  id: z.string().uuid(CATALOG_MESSAGES.INVALID_ID),
});

/**
 * Kept as the literal strings rather than coerced to a boolean. `z.coerce.boolean()`
 * maps every non-empty string — including "false" and "0" — to `true`, which
 * would turn `?includeInactive=false` into a request for inactive rows. The
 * narrow enum also keeps the schema a plain object, which the OpenAPI
 * generator needs in order to emit an individual query parameter.
 *
 * Whether the flag is *honoured* is an authorisation question settled in the
 * controller, not here.
 */
export const catalogListQuerySchema = z.object({
  includeInactive: z.enum(["true", "false"]).optional(),
});

export type CatalogListQuery = z.infer<typeof catalogListQuerySchema>;

const catalogTimestamps = {
  id: z.string().uuid(),
  status: z.nativeEnum(CatalogStatus),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
};

export const produceCategoryResponseSchema = z.object({
  ...catalogTimestamps,
  name: z.string(),
  description: z.string().nullable(),
});

export const unitResponseSchema = z.object({
  ...catalogTimestamps,
  name: z.string(),
  symbol: z.string(),
});
