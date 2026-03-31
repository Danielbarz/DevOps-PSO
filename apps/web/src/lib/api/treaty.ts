import { treaty } from "@elysiajs/eden";
import type { App } from "@scholar-seek/server";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

export const api = treaty<App>(SERVER_URL);

export type Api = typeof api;
