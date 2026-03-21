import { apiRequest } from "./client";
import type { HealthData } from "./types";

export function getHealth() {
  return apiRequest<HealthData>("/api/health");
}
