import z from "zod";

import { PayoutMethod } from "../../../generated/prisma";

const maskedPayoutValue = z.string().nullable().optional();

const payoutAccountBaseSchema = z.object({
  payoutMethod: z.nativeEnum(PayoutMethod),
  accountHolderName: z
    .string()
    .trim()
    .min(1, "Account holder name is required")
    .max(150, "Account holder name must be at most 150 characters")
    .optional(),
  accountNumber: z
    .string()
    .trim()
    .max(50, "Account number must be at most 50 characters")
    .refine((value) => !value.includes("*"), {
      message: "Masked account number is not valid input",
    })
    .optional(),
  ifscCode: z
    .string()
    .trim()
    .max(20, "IFSC code must be at most 20 characters")
    .refine((value) => !value.includes("*"), {
      message: "Masked IFSC code is not valid input",
    })
    .optional(),
  upiId: z
    .string()
    .trim()
    .max(255, "UPI ID must be at most 255 characters")
    .refine((value) => !value.includes("*"), {
      message: "Masked UPI ID is not valid input",
    })
    .optional(),
});

export const createPayoutAccountSchema = payoutAccountBaseSchema.superRefine(
  (data, ctx) => {
    if (data.payoutMethod === PayoutMethod.BANK_ACCOUNT) {
      if (!data.accountHolderName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accountHolderName"],
          message: "Account holder name is required for bank account payouts",
        });
      }

      if (!data.accountNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accountNumber"],
          message: "Account number is required for bank account payouts",
        });
      }

      if (!data.ifscCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ifscCode"],
          message: "IFSC code is required for bank account payouts",
        });
      }
    }

    if (data.payoutMethod === PayoutMethod.UPI) {
      if (!data.accountHolderName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accountHolderName"],
          message: "Account holder name is required for UPI payouts",
        });
      }

      if (!data.upiId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["upiId"],
          message: "UPI ID is required for UPI payouts",
        });
      }
    }
  },
);

export type CreatePayoutAccountInput = z.infer<typeof createPayoutAccountSchema>;

export const updatePayoutAccountSchema = z
  .object({
    accountHolderName: z
      .string()
      .trim()
      .min(1, "Account holder name is required")
      .max(150, "Account holder name must be at most 150 characters")
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one payout account field must be provided",
  });

export type UpdatePayoutAccountInput = z.infer<typeof updatePayoutAccountSchema>;

export const payoutAccountIdParamSchema = z.object({
  id: z.string().uuid("Invalid payout account id"),
});

export const payoutAccountResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  payoutMethod: z.nativeEnum(PayoutMethod),
  accountHolderName: z.string().nullable().optional(),
  accountNumber: maskedPayoutValue,
  ifscCode: maskedPayoutValue,
  upiId: maskedPayoutValue,
  isDefault: z.boolean(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
