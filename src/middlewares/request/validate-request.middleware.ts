import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type ValidationSchema = {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
};

export function validateRequest(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schema.params) {
      req.params = schema.params.parse(req.params) as Request["params"];
    }

    if (schema.query) {
      // Express 5 makes req.query a getter-only accessor (no setter),
      // so it must be redefined rather than assigned directly.
      Object.defineProperty(req, "query", {
        value: schema.query.parse(req.query),
        writable: true,
        configurable: true,
      });
    }

    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }

    next();
  };
}