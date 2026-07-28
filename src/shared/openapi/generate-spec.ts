import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";
import "@/modules/auth/auth.openapi"; // side-effect import — runs registerPath calls
import { API_PREFIX } from "../constants/api";

export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Backend API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [{ url:API_PREFIX }],
  });
}