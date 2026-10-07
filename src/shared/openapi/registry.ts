import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

/**
 * Shared security scheme for endpoints behind the `authenticate` middleware.
 * Reference it from a path with `security: [{ [bearerAuth.name]: [] }]`.
 */
export const bearerAuth = registry.registerComponent(
  "securitySchemes",
  "bearerAuth",
  {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
);
