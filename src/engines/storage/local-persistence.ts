import { createJSONStorage } from "zustand/middleware";

export const GRAPHITE_STORAGE_KEY = "graphite-dsa-store-v4";

export function createGraphiteStorage() {
  return createJSONStorage(() => localStorage);
}
