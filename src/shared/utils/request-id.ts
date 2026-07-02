import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

import { HEADERS } from "../constants/headers";

export function getRequestId(headers: IncomingHttpHeaders): string {
  const value = headers[HEADERS.REQUEST_ID.toLowerCase()];

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }

  return randomUUID();
}