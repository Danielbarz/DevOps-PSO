import { describe, expect, test } from "bun:test";
import { app } from "./index";

describe("Server basic tests", () => {
	test("Health check endpoint returns 200", async () => {
		const response = await app.handle(new Request("http://localhost/health"));
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body).toEqual({ status: "ok" });
	});

	test("Non-existent route returns frontend index or 404", async () => {
		const response = await app.handle(
			new Request("http://localhost/some-random-route")
		);
		// Since we have a catch-all for frontend, it should return a 200 (the file)
		// but in test environment Bun.file might return differently if path not found
		expect(response.status).toBe(200);
	});
});
