import z from "zod";
import { PRODUCT_LIMITS } from "./product.constants";

//Create Product Schema
export const createProductSchema = z.object({
    name: z.string({error: "Name is required"}).trim().min(PRODUCT_LIMITS.NAME_MIN_LENGTH).max(PRODUCT_LIMITS.NAME_MAX_LENGTH),
    description: z.string({error: "Description is required"}).trim().min(PRODUCT_LIMITS.DESCRIPTION_MIN_LENGTH).max(PRODUCT_LIMITS.DESCRIPTION_MAX_LENGTH).optional(),
    imageUrl: z.string({error: "Image URL is required"}).url(),
    price: z.number({error: "Price is required"}).positive(),
    category: z.string({error: "Category is required"}).trim().min(PRODUCT_LIMITS.CATEGORY_MIN_LENGTH).max(PRODUCT_LIMITS.CATEGORY_MAX_LENGTH),
    isActive: z.boolean({error: "isActive is required"}).optional().default(true),
    stock: z.number({error: "Stock is required"}).int().nonnegative().max(PRODUCT_LIMITS.STOCK_MAX_VALUE).optional().default(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;


//GET ALL PRODUCTS SCHEMA
export const getProductsQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(PRODUCT_LIMITS.LIMIT_MAX_VALUE).optional().default(PRODUCT_LIMITS.LIMIT_DEFAULT_VALUE),
    page: z.coerce.number().int().positive().optional().default(PRODUCT_LIMITS.PAGE_DEFAULT_VALUE),
    sortBy: z.enum(PRODUCT_LIMITS.SORT_BY_OPTIONS).optional().default(PRODUCT_LIMITS.SORT_BY_DEFAULT_VALUE),
    order: z.enum(PRODUCT_LIMITS.ORDER_OPTIONS).optional().default(PRODUCT_LIMITS.ORDER_DEFAULT_VALUE),
    category: z.string().trim().min(PRODUCT_LIMITS.CATEGORY_MIN_LENGTH).max(PRODUCT_LIMITS.CATEGORY_MAX_LENGTH).optional(),
    isActive: z.boolean().optional(),
});

export type GetProductsQueryInput = z.infer<typeof getProductsQuerySchema>;