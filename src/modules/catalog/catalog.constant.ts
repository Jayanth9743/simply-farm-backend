/**
 * Column widths are mirrored from `schema.prisma` so an over-long value is
 * rejected as a 400 by zod rather than reaching Postgres and coming back as a
 * 500. Note the two name columns are *not* the same width: `produce_categories.name`
 * is VarChar(100) while `units.name` is VarChar(50).
 */
export const PRODUCE_CATEGORY_NAME_MAX_LENGTH = 100;
export const UNIT_NAME_MAX_LENGTH = 50;
export const UNIT_SYMBOL_MAX_LENGTH = 20;

/**
 * `description` is a Postgres `text` column, so there is no width to mirror.
 * The cap is a guard against an unbounded body rather than a schema
 * constraint.
 */
export const CATALOG_DESCRIPTION_MAX_LENGTH = 1000;

export const CATALOG_MESSAGES = {
  NAME_REQUIRED: "Name is required",
  SYMBOL_REQUIRED: "Symbol is required",
  NO_FIELDS: "At least one field must be provided",
  INVALID_ID: "Invalid id",
};

/**
 * Per-entity labels. These are the only thing that differs between the two
 * catalog services, so they are data rather than duplicated code.
 */
export const PRODUCE_CATEGORY_LABEL = "Produce category";
export const UNIT_LABEL = "Unit";
