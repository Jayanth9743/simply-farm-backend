import z from "zod";

import {
  ADDRESS_MESSAGES,
  LATITUDE_BOUND,
  LONGITUDE_BOUND,
} from "./address.constant";

/**
 * Accepts a JSON number or a numeric string, and nothing else.
 *
 * `z.coerce.number()` runs everything through `Number()`, which maps `null`,
 * `""`, `false` and `[]` all to `0` — a perfectly valid coordinate. A client
 * that skipped the map picker and sent `latitude: null` would silently store a
 * location off the coast of West Africa. Restricting the input to the two
 * shapes a client can legitimately send keeps the tolerance for stringified
 * numbers without opening that hole.
 */
const coordinate = (bound: number, message: string) =>
  z
    .union([z.number(), z.string().trim().regex(/^[+-]?(\d+(\.\d+)?|\.\d+)$/)], {
      message,
    })
    .transform(Number)
    .refine((value) => Number.isFinite(value) && Math.abs(value) <= bound, {
      message,
    });

export const addressBaseSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(100, "Label must be at most 100 characters"),

  addressLine1: z
    .string()
    .trim()
    .min(1, "Address Line 1 is required")
    .max(255, "Address Line 1 must be at most 255 characters"),

  addressLine2: z
    .string()
    .trim()
    .max(255, "Address Line 2 must be at most 255 characters")
    .optional(),

  village: z
    .string()
    .trim()
    .max(100, "Village must be at most 100 characters")
    .optional(),

  taluk: z
    .string()
    .trim()
    .max(100, "Taluk must be at most 100 characters")
    .optional(),

  district: z
    .string()
    .trim()
    .min(1, "District is required")
    .max(100, "District must be at most 100 characters"),

  state: z
    .string()
    .trim()
    .min(1, "State is required")
    .max(100, "State must be at most 100 characters"),

  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be a valid 6-digit postal code"),

  // Required, matching the NOT NULL columns set by the
  // make_long_and_lat_required_in_address migration.
  latitude: coordinate(LATITUDE_BOUND, ADDRESS_MESSAGES.INVALID_LATITUDE),

  longitude: coordinate(LONGITUDE_BOUND, ADDRESS_MESSAGES.INVALID_LONGITUDE),
});

export const createAddressSchema = addressBaseSchema;

export type CreateAddressInput = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = addressBaseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: ADDRESS_MESSAGES.NO_FIELDS,
  });

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export const addressIdParamSchema = z.object({
  id: z.string().uuid("Invalid address id"),
});
