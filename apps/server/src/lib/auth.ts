import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";

export const authPlugin = new Elysia({ name: "auth.plugin" })
	.use(
		jwt({
			name: "jwt",
			secret: process.env.JWT_SECRET || "super-secret-jwt-key",
			exp: "7d",
		})
	)
	.derive({ as: "global" }, async ({ jwt, headers, request }) => {
		// Skip auth check for OPTIONS requests (CORS preflight)
		if (request.method === "OPTIONS") {
			return { userId: null };
		}

		const auth = headers.authorization;
		const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

		if (!token) {
			return { userId: null };
		}

		const payload = await jwt.verify(token);
		// Type guard for payload
		if (!payload || typeof payload === "boolean" || !payload.id) {
			return { userId: null };
		}

		return { userId: payload.id as string };
	});
