import { treaty } from "@elysiajs/eden";
import type { App } from "@scholar-seek/server";

// Otomatis pakai URL Azure di Production, dan localhost di Development
const SERVER_URL =
  import.meta.env.PROD && typeof window !== "undefined"
    ? window.location.origin
    : import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

export const api = treaty<App>(SERVER_URL);

export type Api = typeof api;
