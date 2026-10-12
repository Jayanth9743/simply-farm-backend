import z from "zod";

export const createProduceListingSchema = z.object({
  categoryId: z.string().uuid("Invalid category id"),
  unitId: z.string().uuid("Invalid unit id"),
  pickupAddressSnapshot: z
    .object({})
    .passthrough()
    .refine((value) => value && Object.keys(value).length > 0, {
      message: "Pickup address snapshot is required",
    }),
  name: z
    .string()
    .trim()
    .min(1, "Listing name is required")
    .max(150, "Listing name must be at most 150 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be at most 2000 characters")
    .optional(),
  price: z.coerce
    .number()
    .refine((value) => Number.isFinite(value), {
      message: "Price is required",
    })
    .refine((value) => value > 0, {
      message: "Price must be greater than 0",
    }),
  cancellationWindowHours: z.coerce
    .number()
    .refine((value) => Number.isFinite(value), {
      message: "Cancellation window is required",
    })
    .int("Cancellation window hours must be an integer")
    .min(0, "Cancellation window must be at least 0 hours")
    .max(168, "Cancellation window must be at most 168 hours")
    .default(2),
  cancellationFeePercentage: z.coerce
    .number()
    .refine((value) => Number.isFinite(value), {
      message: "Cancellation fee percentage is required",
    })
    .min(0, "Cancellation fee percentage must be at least 0")
    .max(100, "Cancellation fee percentage must be at most 100")
    .default(50),
  totalQuantity: z.coerce
    .number()
    .refine((value) => Number.isFinite(value), {
      message: "Total quantity is required",
    })
    .min(0, "Total quantity must be at least 0"),
});

export type CreateProduceListingInput = z.infer<typeof createProduceListingSchema>;
