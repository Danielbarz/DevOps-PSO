import { cors } from "@elysiajs/cors";
import { env } from "@scholar-seek/env/server";
import { Elysia } from "elysia";
import { papersModule } from "./modules/papers";

const app = new Elysia()
	.onError(({ code, error, set }) => {
		if (code === "VALIDATION") {
			set.status = 400;
			return { error: error.message };
		}
		if (code === "NOT_FOUND") {
			set.status = 404;
			return { error: "Not found" };
		}
		set.status = 500;
		return { error: "Internal server error" };
	})
	.use(
		cors({
			origin: env.CORS_ORIGIN,
			methods: ["GET", "POST", "OPTIONS"],
		})
	)
	.use(papersModule)
	.get("/", () => "OK", {
		detail: {
			summary: "Health check",
			tags: ["health"],
		},
	});

app.listen(3000, () => {
	console.log(
		`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
	);
});

export type App = typeof app;
