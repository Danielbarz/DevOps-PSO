// apps/web/src/lib/api/treaty.ts
import { treaty } from "@elysiajs/eden";
import type { App } from "@scholar-seek/server";
import { useAuthStore } from "../store/auth";

const SERVER_URL =
	import.meta.env.PROD && typeof window !== "undefined"
		? window.location.origin
		: (import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000");

export const api = treaty<App>(SERVER_URL, {
	fetcher: ((input, init) => {
		const token = useAuthStore.getState().token;
		const options = init || {};
		if (token) {
			const headers = new Headers(options.headers || {});
			headers.set("authorization", `Bearer ${token}`);
			options.headers = headers;
		}
		return globalThis.fetch(input, options);
	}) as typeof fetch,
});

export type Api = typeof api;
